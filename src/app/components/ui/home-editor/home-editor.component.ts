import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges
} from '@angular/core';
import {dsw} from '../../../../environments/dsw';
import {MenuService} from '../../../services/menu.service';
import {SidebarService} from '../../../services/sidebar.service';
import {DataService, ITileInfo} from '../../../services/data.service';
import {StorageService} from '../../../services/storage.service';
import {NamespaceService} from '../../../services/namespace.service';
import {NavigationStart, Router, RouterEvent} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
    selector: 'dsw-home-editor',
    templateUrl: './home-editor.component.html',
    styleUrls: ['./../../editor/editor-styles.scss', './../chart-config/chart-config.component.scss', './home-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeEditorComponent implements OnInit, OnDestroy {
    @Input() tiles: ITileInfo[];
    // @Input() tile: ITileInfo;
    @Input() folder: string;

    model: any;
    private originalTiles: string;

    set tile(value: ITileInfo) {
        const needRefresh = value !== this._tile;
        this._tile = value;
        if (needRefresh) {
            this.requestWidgetList();
        }
    }

    get tile(): ITileInfo {
        return this._tile;
    }

    private _tile: ITileInfo;
    private subRouteChange: Subscription;

    constructor(private ds: DataService,
                private ms: MenuService,
                private sbs: SidebarService,
                private st: StorageService,
                private ns: NamespaceService,
                private router: Router,
                private cd: ChangeDetectorRef) {
        this.model = {
            colors: dsw.const.bgColorClasses,
            fontColors: dsw.const.fontColors,
            icons: dsw.const.icons,
            widgetList: []
        };
    }

    ngOnInit() {
        // Cancel editing on any navigation
        this.subRouteChange = this.router.events.subscribe((e: RouterEvent) => {
            if (e instanceof NavigationStart) {
                this.onCancelEditing();
            }
        });

        this.saveOriginalTiles();
        this.requestWidgetList();
    }


    ngOnDestroy() {
        this.ms.onEditDashboard.emit(false);
        this.subRouteChange.unsubscribe();
    }

    // ngOnChanges(changes: SimpleChanges) {
    //     console.log('fdsd');
    //     const c = changes['tile'];
    //
    //     if (c && c.currentValue !== c.previousValue) {
    //         this.requestWidgetList();
    //         this.cd.detectChanges();
    //     }
    // }

    /**
     * Saves original tiles as string to be able make cancel
     */
    private saveOriginalTiles() {
        this.originalTiles = JSON.stringify(this.tiles);
    }

    /**
     * Restores original tiles on cancel
     */
    private restoreOriginalTiles() {
        this.tiles.splice(0, this.tiles.length);
        const old = JSON.parse(this.originalTiles);
        old.forEach(t => this.tiles.push(t));
    }

    /**
     * Request widget list for editing tile
     */
    private requestWidgetList() {
        this.model.widgetList = [];
        if (this.tile && !this.tile.isFolder) {
            this.ds.getWidgets(this.tile.fullPath).then((data) => this.fillWidgetList(data));
        }
    }

    /**
     * Fills widget list
     */
    private fillWidgetList(data) {
        if (data) {
            this.model.widgetList = data.widgets.map((w, n) => {
                return {idx: n, name: w.title || w.name};
            });
            this.model.widgetList = [{idx: '', name: ''}, ...this.model.widgetList];
            this.cd.detectChanges();
        }
    }

    /**
     * Save tiles configuration to storage
     */
    saveTiles() {
        const settings = this.st.getTilesSettings();

        for (let i = 0; i < this.tiles.length; i++) {
            const tile = this.tiles[i];
            const f = this.folder;

            // Create settings if not exists
            if (!settings[f]) {
                settings[f] = {};
            }
            if (!settings[f][tile.title]) {
                settings[f][tile.title] = {};
            }

            const conf = settings[f][tile.title];
            conf.row = tile.y;
            conf.col = tile.x;
            conf.sizeX = tile.cols;
            conf.sizeY = tile.rows;
            conf.color = tile.color;
            conf.fontColor = tile.fontColor;
            conf.icon = tile.icon;
            conf.hideTitle = tile.hideTitle;
            conf.customTitle = tile.customTitle;

            if (tile.widget !== null && tile.widget !== '') {
                conf.widget = parseInt(tile.widget, 10);
            } else {
                delete conf.widget;
            }
        }

        this.st.setTilesSettings(settings);

        // Refresh only if widget id changed
        // TODO: refresh widgets
        // for (let i = 0; i < this.model.tiles.length; i++) {
        //     if (this.model.tiles[i].widget !== this.model.tiles[i].requestedWidget) {
        //         this.requestData();
        //         return;
        //     }
        // }
    }

    /**
     * Set tile background color
     */
    setTileColor(c: number) {
        if (!this.tile) {
            return;
        }
        this.tile.color = c;
    }

    /**
     * Set tile font color
     */
    setFontColor(c: number) {
        if (!this.tile) {
            return;
        }
        this.tile.fontColor = c;
    }

    /**
     * Set tile icon
     */
    setIcon(c: number) {
        if (!this.tile) {
            return;
        }
        this.tile.icon = c;
    }

    /**
     * On cancel button click
     */
    onCancelEditing() {
        this.restoreOriginalTiles();
        this.close();
    }

    /**
     * On save button click
     */
    onSaveTiles() {
        this.saveTiles();
        this.st.onTilesChanged.emit();
        this.close();
    }

    /**
     * Close sidebar and stop editing
     */
    close() {
        this.sbs.showComponent(null);
    }
}
