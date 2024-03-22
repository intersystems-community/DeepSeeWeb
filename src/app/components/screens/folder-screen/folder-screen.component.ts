import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import {StorageService} from '../../../services/storage.service';
import {dsw} from '../../../../environments/dsw';
import {GridsterComponent, GridsterConfig, GridsterItemComponent} from 'angular-gridster2';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService, ITileInfo} from '../../../services/data.service';
import {HomeEditorComponent} from '../../ui/home-editor/home-editor.component';
import {SidebarService} from '../../../services/sidebar.service';
import {MenuService} from '../../../services/menu.service';
import {debounceTime, distinctUntilChanged, map, startWith, switchMap} from 'rxjs/operators';
import {combineLatest, fromEvent, Observable, Subscription} from 'rxjs';
import {HeaderService} from '../../../services/header.service';
import {CURRENT_NAMESPACE, NamespaceService} from '../../../services/namespace.service';
import {WidgetComponent} from '../../widgets/base/widget/widget.component';
import {ErrorService} from '../../../services/error.service';
import {I18nService} from '../../../services/i18n.service';
import {FilterService} from '../../../services/filter.service';
import {AsyncPipe} from '@angular/common';

interface IHomeModel {
    tiles: ITileInfo[];
    widgetList: any[];
    fontColors: string[];
    icons: string[];
    edItem?: ITileInfo;
}

@Component({
    selector: 'dsw-folder-screen',
    templateUrl: './folder-screen.component.html',
    styleUrls: ['./folder-screen.component.scss'],
    standalone: true,
    imports: [GridsterComponent, GridsterItemComponent, WidgetComponent, AsyncPipe]
})
export class FolderScreenComponent implements OnInit, OnDestroy {
    @ViewChildren('widgets', {read: WidgetComponent}) widgets!: QueryList<WidgetComponent>;
    @ViewChild('gridster', {read: ElementRef, static: true}) gridster!: ElementRef;
    @ViewChild('gridster', {static: true}) gridsterComp!: GridsterComponent;
    itemDescs: any[] = [];
    isResizing = false;
    model: IHomeModel;
    tilesOptions: GridsterConfig = {
        maxCols: 8,
        minCols: 8,
        fixedRowHeight: 122,
        gridType: 'verticalFixed',
        mobileBreakpoint: 576,
        margin: 20,
        draggable: {
            enabled: false
        },
        resizable: {
            enabled: false
        }
    };
    public data$?: Observable<any>;
    isSpinner = true;
    private settings: any;
    private folder = '';
    private subOnTilesChanged;
    private subSidebarAnimEnd?: Subscription;
    private subEditDashboard?: Subscription;
    private isLoading = false;
    private subAnimation?: Subscription;

    constructor(private st: StorageService,
                private route: ActivatedRoute,
                private router: Router,
                private ss: SidebarService,
                private cd: ChangeDetectorRef,
                private hs: HeaderService,
                private ms: MenuService,
                private ds: DataService,
                private es: ErrorService,
                private i18n: I18nService,
                private fs: FilterService,
                private ns: NamespaceService) {
        this.onResize();
        this.settings = st.getAppSettings();
        this.ms.onSetTitle.emit('');
        this.fs.clear();

        this.model = {
            tiles: [],
            widgetList: [],
            fontColors: dsw.const.fontColors,
            icons: dsw.const.icons
        };


        // Reset filters query params
        // TODO: check query change
        // this.router.navigate(
        //     [],
        //     {
        //         relativeTo: this.route,
        //         queryParams: {FILTERS: ''},
        //         queryParamsHandling: 'merge'
        //     });
        // //$location.search('FILTERS', null);
    }

    trackByIndex = (index: number, r: any) => index;

    @HostListener('window:resize', ['$event'])
    onResize() {
        /* let delta = (window.innerWidth - 1336) / 2;
         if (delta < 20) {
             delta = 20;
         }
         this.tilesOptions.outerMarginLeft = delta;
         this.tilesOptions.outerMarginRight = delta;
         if (this.gridsterComp) {
             this.gridsterComp.optionsChanged();
         }*/
    }

    ngOnInit(): void {
        /*this.subOnTilesChanged = this.st.onTilesChanged.subscribe(() => {

        });*/

        this.data$ = combineLatest([
            this.st.onTilesChanged.pipe(startWith('')),
            this.route.url,
            this.route.params.pipe(
                switchMap(params => {
                    if (params['ns'] && params['ns'].toLowerCase() !== CURRENT_NAMESPACE.toLowerCase()) {
                        this.ns.setCurrent(params['ns']);
                    }
                    return this.ds.getDashboards();
                })
            ),
            this.hs.onSearch.pipe(distinctUntilChanged())
        ]).pipe(
            map(([notUsed_OnlyForRefreshAfterTilesSettingsChanged, segments, data, search]) => {
                this.folder = decodeURIComponent(segments.map(s => s.path).join('/') || '');
                this.isLoading = false;
                const d = this.retrieveData(JSON.parse(JSON.stringify(data)), search as any || '');
                this.isSpinner = false;
                return d;
            })
        );

        // Sidebar animation end tracking for resize gridster
        this.subSidebarAnimEnd = this.ss.onAnimEnd.subscribe(() => {
            if (this.tilesOptions?.api?.resize) {
                this.tilesOptions.api.resize();
            }
        });

        // Toggles editing mode for sashboard
        this.subEditDashboard = this.ms.onEditDashboard.subscribe((isEdit) => {
            if (isEdit) {
                this.enableEditing();
            } else {
                this.disableEditing();
            }
        });

        this.subscribeForGridsterResize();

    }

    ngOnDestroy() {
        this.subAnimation?.unsubscribe();
        this.subSidebarAnimEnd?.unsubscribe();
        this.subEditDashboard?.unsubscribe();
    }

    /**
     * Get full description of tile item
     */
    getDesc(idx) {
        return this.itemDescs[idx];
    }

    /**
     * Toggle editing mode
     */
    enableEditing() {
        this.model.edItem = this.model.tiles[0];
        if (this.tilesOptions?.draggable) {
            this.tilesOptions.draggable.enabled = true;
        }
        if (this.tilesOptions?.resizable) {
            this.tilesOptions.resizable.enabled = true;
        }
        if (this.tilesOptions?.api?.optionsChanged) {
            this.tilesOptions.api.optionsChanged();
        }
        this.ss.showComponent({
            component: import('./../../ui/home-editor/home-editor.component'),
            single: true,
            inputs: {
                tiles: this.model.tiles,
                tile: this.model.tiles[0],
                folder: this.folder
            }
        });
    }

    /**
     * Disables editing
     */
    disableEditing() {
        if (this.tilesOptions?.draggable) {
            this.tilesOptions.draggable.enabled = false;
        }
        if (this.tilesOptions?.resizable) {
            this.tilesOptions.resizable.enabled = false;
        }
        if (this.tilesOptions?.api?.optionsChanged) {
            this.tilesOptions.api.optionsChanged();
        }

        this.model.edItem = undefined;
    }

    /**
     * Tile click event handler
     */
    onItemClicked(tile: ITileInfo) {
        // If editing mode - update editing sidebar
        if (this.model.edItem) {
            this.model.edItem = tile;
            this.ss.showComponent({component: import('./../../ui/home-editor/home-editor.component'), single: true, inputs: {tile}});
            return;
        }
        // Default navigate to dashboard
        let nav = tile.fullPath;

        if (tile.isFolder) {
            nav = tile.title === '' ? '..' : tile.title;
        }

        this.router.navigate([nav], {relativeTo: tile.isFolder ? this.route : this.route.root.children[0]});
    }

    /**
     * Process retrieved dashboard list
     * @param {object} result Server response contains dashboard list
     */
    retrieveData(result, search: string) {
        if (!result) {
            return;
        }
        if (result) {
            if (result.Error) {
                this.es.show(result.data.Error);
                return;
            }
        }
        if (result) {
            if (!result.children || result.children.length === 0) {
                this.es.show(this.i18n.get('errNoDashboards'));
                return;
            }
            this.model.tiles = this.getTiles(result, search);
        }
        return this.model.tiles;
    }

    /**
     * Process retrieved dashboard list to setup initial values, etc.
     * @param dashboards
     */
    setupList(dashboards) {
        for (let i = 0; i < dashboards.length; i++) {
            if (!this.settings.showImages) {
                dashboards[i].Cover = '';
            }

            if (dashboards[i].Cover) {
                dashboards[i].icon = 0;
            }

            if (dashboards[i].widget !== null) {
                dashboards[i].Cover = '';
                dashboards[i].icon = 0;
                dashboards[i].requestedWidget = dashboards[i].widget;
                this.ds.getWidgets(dashboards[i].fullPath)
                    .then((data) => {
                        this.retriveWidgetData(data, dashboards[i]);
                    });
                //.then(this.createDataCallback(dashboards[i]));
            }
        }
    }

    /**
     * Creates callback on data request, for widget placed on tile
     * @param {object} widget Widget description object
     * @returns {Function} Callback function
     */
    createDataCallback(widget) {
        return function (this: any, data: any) {
            this.retriveWidgetData(data, widget);
        };
    }

    /**
     * Get tiles list from dashboard data
     */
    getTiles(data, search) {
        let tiles = data.children;
        let conf = this.st.getTilesSettings();
        conf = conf[this.folder] || {};

        // Store full path
        tiles.forEach(d => {
            if (!d.fullPath) {
                d.fullPath = d.path;
            }
        });

        if (search) {
            tiles = tiles.filter(d => d.title.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) !== -1);
        } else {

            // Filter dashboards only for current folder
            if (this.folder) {
                tiles = tiles.filter(d => d.fullPath.startsWith(this.folder + '/'));
            }

            // Get list of folders on current level
            const folderList: any[] = [];
            tiles.forEach(d => {
                if (d.fullPath.toLowerCase().startsWith(this.folder.toLowerCase() + '/')) {
                    d.path = d.fullPath.slice(this.folder.length !== 0 ? (this.folder.length + 1) : 0, d.fullPath.length);
                }
                const parts = d.path.split('/');
                if (parts.length === 1) {
                    return;
                }
                if (folderList.some(f => f === parts[0])) {
                    return;
                }
                folderList.push(parts[0]);
            });

            // Remove all non-dashboards from list
            tiles = tiles.filter(d => d.path.split('/').length === 1);

            // Append found folders
            tiles = [...tiles, ...folderList.map(f => ({isFolder: true, title: f}))];
        }

        // Set title for empty non folder tiles
        tiles.forEach(t => {
            if (!t.isFolder && !t.title) {
                t.title = t.path.split('/').splice(-1)[0].replace('.dashboard', '');
            }
        });

        // Add back button
        if (this.folder && !search) {
            tiles.push({isFolder: true, title: ''});
        }

        // Sort all dashboards
        tiles = tiles.sort((a, b) => {
            if (a.isFolder && !b.isFolder) {
                return -1;
            }
            if (b.isFolder && !a.isFolder) {
                return 1;
            }
            if (a.title > b.title) {
                return 1;
            } else {
                return -1;
            }
        });

        for (let i = 0; i < tiles.length; i++) {
            const c = conf[tiles[i].title] || {};
            if (c.hideTitle !== undefined) {
                tiles[i].hideTitle = c.hideTitle;
            }
            if (c.row !== undefined && !!!search) {
                tiles[i].y = c.row;
            } else {
                tiles[i].y = Math.floor(i / 12);
            }
            if (c.col !== undefined && !!!search) {
                tiles[i].x = c.col;
            } else {
                tiles[i].x = i % 12;
            }

            tiles[i].widget = null;
            tiles[i].requestedWidget = null;
            if (c.widget !== undefined) {
                tiles[i].widget = parseInt(c.widget, 10);
            }
            tiles[i].template = '';
            tiles[i].cols = !!search ? 1 : (c.sizeX || 1);
            tiles[i].rows = !!search ? 1 : (c.sizeY || 1);
            if (c.icon !== undefined) {
                tiles[i].icon = c.icon;
            } else {
                tiles[i].icon = (tiles[i].title === '' ? 1 : tiles[i].isFolder ? 2 : 3);
            }
            tiles[i].color = c.color || (tiles[i].title === '' ? 2 : tiles[i].isFolder ? 3 : 1);
            tiles[i].fontColor = c.fontColor || 0;
            //if (dashboards[i].widget === null) dashboards[i].customTitle = c.title || dashboards[i].title; else dashboards[i].title = "";
            tiles[i].customTitle = c.customTitle || c.title || tiles[i].title;
        }

        this.setupList(tiles);
        return tiles;
    }

    /**
     * Callback for widget data retrieved
     * @param {object} result Widget data
     * @param {object} tile Tile on which widget is placed
     */
    retriveWidgetData(result, tile) {
        if (!result.widgets[tile.widget]) {
            console.warn('Can\'t find widget with index ' + tile.widget);
            return;
        }
        // Replace inline with tile. checking (tile != undefined) is enough to know if this widget in inline mode
        result.widgets[tile.widget].inline = true;
        result.widgets[tile.widget].tile = tile;
        this.itemDescs.push(result.widgets[tile.widget]);
        tile.idx = this.itemDescs.length - 1;
    }

    /**
     * Subscribes for gridster resize
     */
    private subscribeForGridsterResize() {
        // Subscribe for gridster resize animation. Needed to adjust widget sizes
        this.subAnimation = fromEvent<TransitionEvent>(this.gridster.nativeElement, 'transitionend')
            .pipe(debounceTime(100))
            .subscribe(e => {
                if (!this.widgets || (e.propertyName !== 'width' && e.propertyName !== 'height')) {
                    return;
                }
                this.widgets.toArray().forEach(w => {
                    if (!w.component) {
                        return;
                    }
                    w.component.onResize();
                });
            });
    }
}
