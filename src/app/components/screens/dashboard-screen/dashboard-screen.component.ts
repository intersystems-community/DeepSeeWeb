import {ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {GridsterComponent, GridsterConfig, GridsterItem, GridsterItemComponentInterface, GridType} from 'angular-gridster2';
import {StorageService} from '../../../services/storage.service';
import {dsw} from '../../../../environments/dsw';
import {combineLatest, fromEvent, Observable, of, Subscription} from 'rxjs';
import {DataService} from '../../../services/data.service';
import {map, switchMap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {VariablesService} from '../../../services/variables.service';
import {FilterService} from '../../../services/filter.service';
import {UtilService} from '../../../services/util.service';
import {ErrorService} from '../../../services/error.service';
import {HeaderService} from '../../../services/header.service';
import {I18nService} from '../../../services/i18n.service';
import {IWidgetInfo} from '../../widgets/base-widget.class';
import {WidgetComponent} from '../../widgets/base/widget/widget.component';
import {CURRENT_NAMESPACE, NamespaceService} from '../../../services/namespace.service';
import {BroadcastService} from '../../../services/broadcast.service';

@Component({
    selector: 'dsw-dashboard-screen',
    templateUrl: './dashboard-screen.component.html',
    styleUrls: ['./dashboard-screen.component.scss']
})
export class DashboardScreenComponent implements OnInit, OnDestroy {
    @ViewChildren('widgets') widgets: WidgetComponent[];
    @ViewChild('ctxMenu') ctxMenu: ElementRef;
    @ViewChild('gridster') gridster: GridsterComponent;;

    private desc: any[] = [];
    private settings: any;
    private readonly sharedWidget: string;
    private readonly subReset: Subscription;
    private subCtxClose: Subscription;
    model: any;
    ctxItem: IWidgetInfo = null;
    tilesOptions: GridsterConfig = {
        margin: 10,
        gridType: GridType.Fit,
        draggable: {
            ignoreContent: true,
            dragHandleClass: 'drag-handle',
            enabled: true
        },
        resizable: {
            enabled: true
        }
    };
    isMobile = false;
    data$: Observable<any>;
    isLoaded = false;

    constructor(private ds: DataService,
                private vs: VariablesService,
                private fs: FilterService,
                private us: UtilService,
                private ss: StorageService,
                private es: ErrorService,
                private hs: HeaderService,
                private router: Router,
                private i18n: I18nService,
                private ns: NamespaceService,
                private cd: ChangeDetectorRef,
                private bs: BroadcastService,
                private r2: Renderer2,
                private route: ActivatedRoute) {

        this.hs.resetSearch();
        // TODO: check widget sharing
        this.sharedWidget = this.route.snapshot.queryParamMap.get('widget');

        this.tilesOptions.itemChangeCallback = (item: GridsterItem, itemComponent: GridsterItemComponentInterface) => {
            this.saveWidgetPositionAndSize(item as any, itemComponent);
        };

        this.model = {
            items: []
        };
        this.settings = ss.getAppSettings();
        this.tilesOptions.maxCols = parseInt(this.settings.colCount, 10) || 12;
        this.tilesOptions.fixedRowHeight = parseInt(this.settings.widgetHeight, 10) || (Math.floor((window.innerHeight - 158) / 10)) - 1;

        if (this.sharedWidget) {
            this.tilesOptions.maxCols = 1;
            this.tilesOptions.minCols = 1;
            this.tilesOptions.maxRows = 1;
            this.tilesOptions.minRows = 1;
            this.tilesOptions.gridType = 'fit';
            const p = this.route.snapshot.queryParamMap;
            const h = p.get('height');
            if (h) {
                this.tilesOptions.rowHeight = parseInt(h, 10);
            } else {
                //this.tilesOptions.rowHeight = "match";
            }
            this.tilesOptions.draggable = {
                enabled: false,
                dragHandleClass: ''
            };
            this.tilesOptions.resizable = {
                enabled: false
            };
        }

        this.isMobile = dsw.mobile;
        // TODO: solve this by transition end
        // this.tilesOptions.resizable.stop = (item: any, itemComponent, ) => {
        //     const w = this.getWidgetByInfo(item);
        //     if (w && w.component) {
        //         w.component.onResize();
        //     }
        // };
        this.subReset = this.bs.subscribe('resetWidgets', () => { window.location.reload(); });
    }

    ngOnInit() {
        this.data$ = combineLatest([
            this.route.url,
            this.route.params
        ]).pipe(
            switchMap(([segments, params]) => {
                if (params['ns'] && params['ns'].toLowerCase() !== CURRENT_NAMESPACE.toLowerCase()) {
                    this.ns.setCurrent(params['ns']);
                }
                const path = [params.name, ...segments.map(s => s.path)].join('/').slice(1);
                if (path.indexOf('.dashboard') === -1) return of([]);
                return this.ds.getWidgets(path || '').pipe(
                    map((data) => this.retrieveData(data, path))
                );
            })
        );

        // This needed to restore gridster after printing
        window.onafterprint = () => {
            setTimeout(() => {
                this.gridster.resize();
            }, 2000);
        }

    }
    ngOnDestroy() {
        window.onafterprint = null;
        if (this.subCtxClose) {
            this.subCtxClose.unsubscribe();
        }
        if (this.subReset) {
            this.subReset.unsubscribe();
        }
        this.data$ = null;
    }

    getWidgetByInfo(info: IWidgetInfo): WidgetComponent {
        return this.widgets.find((w) => w.widget === info);
    }


    saveWidgetPositionAndSize(widget: IWidgetInfo, item: GridsterItemComponentInterface) {
        const pos = item.$item; // {cols: 2, rows: 7, x: 3, y: 1}
        const widgets = this.ss.getWidgetsSettings(widget.dashboard);
        const k = widget.name;
        if (!widgets[k]) {
            widgets[k] = {};
        }

        if (!isNaN(pos.x)) { widgets[k].col = pos.x; }
        if (!isNaN(pos.y)) { widgets[k].row = pos.y; }
        if (!isNaN(pos.cols)) { widgets[k].sizeX = pos.cols; }
        if (!isNaN(pos.rows)) { widgets[k].sizeY = pos.rows; }

        this.ss.setWidgetsSettings(widgets, widget.dashboard);
    }

    /**
     * Sets widget type. Widget to change: this.ctxItem
     * @param {string} t Widget type
     */
    setType(t) {
        if (!this.ctxItem) {
            return;
        }
        // TODO: check setType
        // this.$broadcast('setType:' + this.ctxItem, t);
    }

    /**
     * Widget context menu callback. Sets current context widget: this.ctxItem
     */
    onCtxMenuShow(item) {
        // TODO: check hash key
        this.ctxItem = item.$$hashKey;
        this.ctxItem = item;
    }

    /**
     * Shares widget and open dialog with iframe code
     */
    shareItem() {
        if (!this.ctxItem) {
            return;
        }
        this.bs.broadcast('share:' + this.ctxItem.name);
        this.ctxItem = null;
    }

    /**
     * Copies widget MDX and open dialog
     */
    copyMDX() {
        if (!this.ctxItem) {
            return;
        }
        this.bs.broadcast('copyMDX:' + this.ctxItem.name);
        this.ctxItem = null;
    }


    /**
     * Print callback. Prints this.ctxItem widget
     */
    printItem() {
        if (!this.ctxItem) {
            return;
        }
        this.bs.broadcast('print:' + this.ctxItem.name);
        this.ctxItem = null;

    }

    /**
     * Refresh callback. Refresh this.ctxItem widget
     */
    refreshItem() {
        if (!this.ctxItem) {
            return;
        }
        this.bs.broadcast('refresh:' + this.ctxItem.name);
        this.ctxItem = undefined;
    }

    /**
     * Retrieve data callback. Builds widget list
     */
    retrieveData(result, path: string) {
        let i;
        // TODO: temporary solution to prevent start animation bug with gridster
        setTimeout(() => {
            this.isLoaded = true;
        }, 1000);

        if (!result) {
            return;
        }

        if (result.Error) {
            this.es.show(result.Error);
            return;
        }
        if (!result.widgets) {
            this.es.show(this.i18n.get('errNoWidgets'));
            return;
        }

        if (result.displayInfo && result.displayInfo.gridRows && !this.settings.widgetHeight && !this.sharedWidget) {
            this.tilesOptions.fixedRowHeight = Math.floor((window.innerHeight - 60) / (result.displayInfo.gridRows));
        }

        this.vs.init(result);

        if (result.filters) {
            this.fs.init(result.filters, path);
        }
        // TODO: Check if there is actions on toolbar
        let isExists = false;
        if ((this.fs.isFiltersOnToolbarExists || this.vs.isExists()) && !this.sharedWidget) {
            // Check if there empty widget exists, if no - we should create it
            for (i = 0; i < result.widgets.length; i++) {
                if (result.widgets[i].type.toLowerCase() === dsw.const.emptyWidgetClass) {
                    isExists = true;
                }
            }
            if (!isExists) {
                result.widgets.push({
                    dashboard: path,
                    autocreated: true,
                    name: 'emptyWidget',
                    type: dsw.const.emptyWidgetClass,
                    key: 'emptyWidgetFor' + path
                });
                isExists = true;
            }
        }
        if (dsw.mobile) {
            // TODO: broadcast
            // $rootScope.$broadcast('menu:showFilterButton', isExists);
        }
        if (result.info) {
            // TODO: broadcast
            // $rootScope.$broadcast('menu:changeTitle', result.info.title);
        }
        this.model.items = [];
        this.desc = [];
        for (i = 0; i < result.widgets.length; i++) {
            result.widgets[i].dashboard = path;
            if (this.sharedWidget && i != this.sharedWidget) {
                continue;
            }
            // Create item for model
            let item: any = {
                idx: i,
                cols: 2,
                rows: 2,
                x: (i * 2) % 12,
                y: Math.floor(i / 6) * 2,
                title: result.widgets[i].title,
                toolbar: true,
                backButton: false,
                menuDisabled: false
            };
            if (result.widgets[i].displayInfo) {
                let tc = 1;
                let tr = 1;
                if (result.displayInfo) {
                    tc = Math.floor(12 / result.displayInfo.gridCols);
                    if (tc < 1) {
                        tc = 1;
                    }
                    if (tr < 1) {
                        tr = 1;
                    }
                }
                item.x = result.widgets[i].displayInfo.topCol * tc;
                item.y = result.widgets[i].displayInfo.leftRow * tr;
                item.cols = (result.widgets[i].displayInfo.colWidth || 1) * tc;
                item.rows = (result.widgets[i].displayInfo.rowHeight || 2);
                if (item.cols > this.tilesOptions.maxCols) {
                    item.cols = this.tilesOptions.maxCols;
                }
            }
            if (result.widgets[i].autocreated) {
                delete item.x;
                delete item.y;
            }
            if (result.widgets[i].name) {
                this.setWidgetSizeAndPos(item, result.widgets[i].name.toString(), path);
            }

            // For shared widget set pos to zero and index too
            if (this.sharedWidget) {
                item.x = 0;
                item.y = 0;
                item.idx = 0;
                item.cols = 1;
                item.rows = 1;
                item.menuDisabled = true;
            }

            this.model.items.push(item);

            // Create item for description
            item = {
                ...JSON.parse(JSON.stringify(result.widgets[i])),
                ...JSON.parse(JSON.stringify(item))
            };

            // this.us.mergeRecursive(item, result.widgets[i]);
            if (!this.sharedWidget) {
                this.fillDependentWidgets(item, result.widgets);
            }
            this.desc.push(item);
        }

        if (!this.sharedWidget) {
            setTimeout(() => this.broadcastDependents(), 0);
        }

        return this.desc;
    }

    /**
     * Send message to refresh all dependent widgets
     */
    broadcastDependents() {
        const brodcasted = [];
        for (let i = 0; i < this.desc.length; i++) {
            if (this.desc[i].dependents.length !== 0) {
                const item = this.desc[i];
                if (brodcasted.indexOf(item.name) !== -1) {
                    continue;
                }
                brodcasted.push(item.name);
                this.bs.broadcast('widget:' + item.name + ':refreshDependents');
                // $rootScope.$broadcast('widget:' + item.key + ':refreshDependents');
            }
        }
    }

    /**
     * Builds dependents list for widget
     * @param {object} item Main widget
     * @param {Array} widgets Array of widgets. Checks any widget in this array, is it dependent from "Main widget"(linked to main widget)
     */
    fillDependentWidgets(item, widgets) {
        item.dependents = [];
        for (let i = 0; i < widgets.length; i++) {
            if (widgets[i] !== item) {
                if (!widgets[i].Link) {
                    continue;
                }
                if (widgets[i].Link === item.name) {
                    item.dependents.push(widgets[i].name);
                }
            }
        }
    }

    /**
     * Set widget position and size in gridster
     * @param {object} item Gridster item
     * @param {string|number} k Widget key
     */
    setWidgetSizeAndPos(item, k, path: string) {
        const widgets = this.ss.getWidgetsSettings(path);
        const w = widgets[k];
        if (!w) {
            return;
        }
        if (w.sizeX !== undefined) {
            item.cols = w.sizeX;
        }
        if (w.sizeY !== undefined) {
            item.rows = w.sizeY;
        }
        if (w.col !== undefined) {
            item.x = w.col;
        }
        if (w.row !== undefined) {
            item.y = w.row;
        }
    }

    /**
     * Get widget description(actual description retrieved from server)
     * @param {number} idx Widget index
     * @returns {object} Widget description
     */
    getDesc(idx) {
        if (!this.desc[idx]) {
            return undefined;
        }
        return this.desc[idx];
    }

    onAnimationEnd(item: any, e: TransitionEvent) {
        // console.log(e.propertyName);
        // TODO: change size only when width or height has been changed
        // if (e.propertyName !== 'width' && e.propertyName !== 'height') {
        //     return;
        // }
        const w = this.getWidgetByInfo(item);
        if (w && w.component) {
            w.component.onResize()
        }
    }

    /**
     * Shows context menu
     * @param item
     * @param e
     */
    showContextMenu(item: IWidgetInfo, e: MouseEvent) {
        if (item.type === dsw.const.emptyWidgetClass) {
            return;
        }

        e.preventDefault();
        this.ctxItem = item;
        let y = e.clientY;
        let x = e.clientX;
        if (y + this.ctxMenu.nativeElement.offsetHeight > window.innerHeight) {
            y -= this.ctxMenu.nativeElement.offsetHeight;
        }
        if (x + this.ctxMenu.nativeElement.offsetWidth > window.innerWidth) {
            x -= this.ctxMenu.nativeElement.offsetWidth;
        }

        this.r2.setStyle(this.ctxMenu.nativeElement, 'left', x + 'px');
        this.r2.setStyle(this.ctxMenu.nativeElement, 'top', y + 'px');
        if (this.subCtxClose) {
            this.subCtxClose.unsubscribe();
        }
        this.subCtxClose = fromEvent(document, 'mousedown').subscribe((e: MouseEvent) => {
            this.subCtxClose.unsubscribe();
            const el = e.target as HTMLElement;
            if (el.parentElement.classList.contains('ctx-menu')) {
                return;
            }
            this.ctxItem = null;
        })
    }
}
