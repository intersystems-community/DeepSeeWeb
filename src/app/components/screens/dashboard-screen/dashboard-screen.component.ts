import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    QueryList,
    Renderer2,
    ViewChild,
    ViewChildren
} from '@angular/core';
import {
    GridsterComponent,
    GridsterConfig,
    GridsterItem,
    GridsterItemComponentInterface,
    GridType
} from 'angular-gridster2';
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
import {ExportingOptions} from 'highcharts';
import {DashboardService} from '../../../services/dashboard.service';
import {MenuService} from '../../../services/menu.service';
import {WTextComponent} from '../../widgets/text/wtext.component';
import {BaseChartClass} from '../../widgets/charts/base-chart.class';

const SWIPE_TIME_THRESHOLD = 200;
const SWIPE_PIXELS_Y_THRESHOLD = 100;
const SWIPE_PIXELS_X_THRESHOLD = 50;

export const DEFAULT_COL_COUNT = 12;

export interface IContextMenuData {
    canDrill: boolean;
    canDrillthrough: boolean;
    drillPath?: string;
    drillTitle?: string;
}

interface ITouchInfo {
    startTime: number;
    endTime: number;
    sx: number;
    sy: number;
    ex: number;
    ey: number;
}

@Component({
    selector: 'dsw-dashboard-screen',
    templateUrl: './dashboard-screen.component.html',
    styleUrls: ['./dashboard-screen.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardScreenComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChildren('widgets') widgets: QueryList<WidgetComponent>;
    @ViewChild('ctxMenu') ctxMenu: ElementRef;
    @ViewChild('gridster') gridster: GridsterComponent;

    private widgetInfo: IWidgetInfo[] = [];
    private settings: any;
    private readonly sharedWidget: string;
    private readonly subReset: Subscription;
    private subCtxClose: Subscription;
    private subContextMenu: Subscription;
    private subMobileFilterDialog: Subscription;
    private touchInfo: ITouchInfo;
    page = 0;

    model: any;
    ctxItem: IWidgetInfo = null;
    contexMenuData: IContextMenuData = {
        canDrill: false,
        canDrillthrough: false
    };
    tilesOptions: GridsterConfig = {
        useTransformPositioning: true,
        margin: 20,
        // rowHeightRatio: 1.5,
        //gridType: GridType.ScrollVertical,
        gridType: GridType.VerticalFixed,
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
    itemsInitialized = 0;
    mobileFilter: IWidgetInfo;
    isMobileFilterVisible = false;

    private subSettingsChanged: Subscription;

    constructor(private ds: DataService,
                private vs: VariablesService,
                private fs: FilterService,
                public us: UtilService,
                private ss: StorageService,
                private es: ErrorService,
                private hs: HeaderService,
                public dbs: DashboardService,
                private router: Router,
                private i18n: I18nService,
                private ns: NamespaceService,
                private cd: ChangeDetectorRef,
                private bs: BroadcastService,
                private r2: Renderer2,
                private ms: MenuService,
                private route: ActivatedRoute) {

        this.hs.resetSearch();
        this.hs.hideMobileFilterButton();
        // this.ms.onSetTitle.emit('');
        this.sharedWidget = this.route.snapshot.queryParamMap.get('widget');

        this.tilesOptions.draggable.start = () => {
            this.cd.detach();
        };

        this.tilesOptions.itemInitCallback = () => {
            this.itemsInitialized++;
            if (this.itemsInitialized === this.widgetInfo.length) {
                // console.log('loaded');
                setTimeout(() => {
                    this.isLoaded = true;
                });

            }
        };

        this.tilesOptions.draggable.stop = () => {
            this.cd.reattach();
        };

        this.tilesOptions.itemChangeCallback = (item: GridsterItem, itemComponent: GridsterItemComponentInterface) => {
            this.saveWidgetPositionAndSize(item as any, itemComponent);
        };

        this.model = {
            items: []
        };
        this.settings = ss.getAppSettings();
        this.tilesOptions.maxCols = parseInt(this.settings.colCount, 10) || DEFAULT_COL_COUNT;
        this.tilesOptions.minCols = this.tilesOptions.maxCols;
        this.tilesOptions.fixedRowHeight = parseInt(this.settings.widgetHeight, 10) || (Math.floor((window.innerHeight - 158) / 10)) - 1;

        this.subSettingsChanged = this.ss.onSettingsChanged.subscribe(settings => {
            this.tilesOptions.maxCols = settings.colCount || DEFAULT_COL_COUNT;
            this.tilesOptions.minCols = this.tilesOptions.maxCols;
            if (this.gridster) {
                this.gridster.optionsChanged();
                setTimeout(() => {
                    // this.gridster.resize();
                    this.gridster.onResize();
                }, 1000);
            }
        });

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

        this.isMobile = this.us.isMobile();
        this.subReset = this.bs.subscribe('resetWidgets', () => {
            window.location.reload();
        });

        this.subMobileFilterDialog = this.hs.mobileFilterDialogToggle.subscribe(() => {
            this.isMobileFilterVisible = !this.isMobileFilterVisible;
            this.cd.detectChanges();
        });

        this.subContextMenu = this.bs.subscribe('contextmenu', (data: any) => {
            this.showContextMenu(data.widget, data.event, data.ctxData);
            this.cd.detectChanges();
        });
    }

    ngOnInit() {
        this.data$ = combineLatest([
            this.route.url,
            this.route.params
        ]).pipe(
            switchMap(([segments, params]) => {
                // Switch namespace if changed
                if (params['ns'] && params['ns'].toLowerCase() !== CURRENT_NAMESPACE.toLowerCase()) {
                    this.ns.setCurrent(params['ns']);
                }
                // Build path
                const path = [params.name, ...segments.map(s => s.path)].join('/').slice(1);
                // Return nothis if this is not dashboard
                if (path.indexOf('.dashboard') === -1) {
                    return of([]);
                }
                // Return widgets for dashboard
                return this.ds.getWidgets(path || '').pipe(
                    map((data) => this.retrieveData(data, path))
                );
            })
        );

        // // This needed to restore gridster after printing
        // window.onafterprint = () => {
        //     setTimeout(() => {
        //         this.gridster.resize();
        //     }, 2000);
        // };
    }

    ngAfterViewInit() {
        /* if (this.isMobile) {
             (this.gridster).onResize = () => {};
         }*/
    }

    ngOnDestroy() {
        window.onafterprint = null;
        this.subContextMenu.unsubscribe();
        this.subMobileFilterDialog.unsubscribe();
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

        if (!isNaN(pos.x)) {
            widgets[k].col = pos.x;
        }
        if (!isNaN(pos.y)) {
            widgets[k].row = pos.y;
        }
        if (!isNaN(pos.cols)) {
            widgets[k].sizeX = pos.cols;
        }
        if (!isNaN(pos.rows)) {
            widgets[k].sizeY = pos.rows;
        }

        this.ss.setWidgetsSettings(widgets, widget.dashboard);
    }

    /**
     * Sets widget type. Widget to change: this.ctxItem
     * @param {string} type Widget type
     */
    setType(type: string) {
        if (!this.ctxItem) {
            return;
        }
        this.bs.broadcast('setType:' + this.ctxItem.name, type);
        this.hideContextMenu();
    }

    /**
     * Hides context menu
     */
    hideContextMenu() {
        this.ctxItem = null;
        this.r2.setStyle(this.ctxMenu.nativeElement, 'visibility', 'hidden');
    }

    /**
     * Shares widget and open dialog with iframe code
     */
    shareItem() {
        if (!this.ctxItem) {
            return;
        }
        this.bs.broadcast('share:' + this.ctxItem.name);
        this.hideContextMenu();
    }

    /**
     * Copies widget MDX and open dialog
     */
    copyMDX() {
        if (!this.ctxItem) {
            return;
        }
        this.bs.broadcast('copyMDX:' + this.ctxItem.name);
        this.hideContextMenu();
    }


    /**
     * Print callback. Prints this.ctxItem widget
     */
    printItem() {
        if (!this.ctxItem) {
            return;
        }
        this.bs.broadcast('print:' + this.ctxItem.name);
        this.hideContextMenu();
    }

    /**
     * Refresh callback. Refresh this.ctxItem widget
     */
    refreshItem() {
        if (!this.ctxItem) {
            return;
        }
        this.bs.broadcast('refresh:' + this.ctxItem.name);
        this.hideContextMenu();
    }

    /**
     * Retrieve data callback. Builds widget list
     */
    retrieveData(result, path: string) {
        let i;

        this.itemsInitialized = 0;
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
            const headerHeight = 63;
            const rows = result.displayInfo.gridRows;
            const padding = 20;
            let minHeight = window.innerHeight;
            if (minHeight < 800) {
                minHeight = 800;
            }
            this.tilesOptions.fixedRowHeight = Math.floor((minHeight - (headerHeight + padding * (rows + 1))) / rows);
            // this.tilesOptions.fixedRowHeight = 400;
           /* if (this.tilesOptions.fixedRowHeight < 20) {
                this.tilesOptions.fixedRowHeight = 20;
            }*/
            if (this.gridster) {
                this.gridster.optionsChanged();
            }
        }

        this.vs.init(result);

        if (result.filters) {
            this.fs.init(result.filters, path);
        }

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
        this.widgetInfo = [];
        this.dbs.setWidgets(this.widgetInfo);
        this.dbs.setAllWidgets(result.widgets);
        for (i = 0; i < result.widgets.length; i++) {
            result.widgets[i].dashboard = path;
            // Ignore all widgets but not shared
            if (this.sharedWidget) {
                const idx = parseInt(this.sharedWidget, 10);
                if (!isNaN(idx) && idx !== i) {
                    continue;
                }
                if (result.widgets[i].name !== this.sharedWidget) {
                    continue;
                }
            }
            // Create item for model
            let item: any = {
                idx: i,
                cols: 2,
                rows: 2,
                x: (i * 2) % this.tilesOptions.maxCols,
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
                item.shared = true;
            }

            // Create item for description
            item = {
                ...JSON.parse(JSON.stringify(result.widgets[i])),
                ...JSON.parse(JSON.stringify(item))
            };

            // this.us.mergeRecursive(item, result.widgets[i]);
            if (!this.sharedWidget) {
                this.fillDependentWidgets(item, result.widgets);
            }

            if (this.isMobile && item.type === dsw.const.emptyWidgetClass) {
                this.mobileFilter = item;
                this.hs.showMobileFilterButton();
                continue;
            }

            this.widgetInfo.push(item);
        }

        if (!this.sharedWidget) {
            setTimeout(() => this.broadcastDependents(), 0);
        }

        this.fitEmptyWidget();

        this.dbs.setWidgets(this.widgetInfo);

        // Update title
        this.ms.onSetTitle.emit(this.dbs.getWidgets()[this.page]?.title);

        if (this.isMobile) {
            this.isLoaded = true;
        }

        return this.widgetInfo;
    }

    /**
     * Send message to refresh all dependent widgets
     */
    broadcastDependents() {
        const brodcasted = [];
        for (let i = 0; i < this.widgetInfo.length; i++) {
            if (this.widgetInfo[i].dependents.length !== 0) {
                const item = this.widgetInfo[i];
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
        if (!this.widgetInfo[idx]) {
            return undefined;
        }
        return this.widgetInfo[idx];
    }

    onAnimationEnd(item: any, e: TransitionEvent) {
        // TODO: change size only when width or height has been changed
        // if (e.propertyName !== 'width' && e.propertyName !== 'height') {
        //     return;
        // }
        const w = this.getWidgetByInfo(item);
        if (w && w.component) {
            w.component.onResize();
        }
    }

    /**
     * Shows context menu
     * @param item
     * @param e
     */
    showContextMenu(item: IWidgetInfo, e: MouseEvent, ctxData?) {
        this.contexMenuData = ctxData;
        const ctxEl = this.ctxMenu.nativeElement;
        this.r2.setStyle(ctxEl, 'visibility', 'hidden');

        let noMenu = false;
        const noCtxProp = item.dataProperties.find(p => p.name === 'disableContextMenu');
        if (noCtxProp) {
            noMenu = noCtxProp.dataValue === 1;
        }

        if (item.type === dsw.const.emptyWidgetClass || noMenu || this.us.isPreventContextMenu()) {
            return;
        }

        e.preventDefault();
        this.ctxItem = item;
        let y = e.clientY;
        let x = e.clientX;

        setTimeout(() => {
            if (y + ctxEl.offsetHeight > window.innerHeight) {
                y -= ctxEl.offsetHeight;
            }
            if (x + ctxEl.offsetWidth > window.innerWidth) {
                x -= ctxEl.offsetWidth;
            }

            this.r2.setStyle(ctxEl, 'left', x + 'px');
            this.r2.setStyle(ctxEl, 'top', y + 'px');
            if (this.subCtxClose) {
                this.subCtxClose.unsubscribe();
            }
            this.subCtxClose = fromEvent(document, 'mousedown').subscribe((e: MouseEvent) => {
                this.subCtxClose.unsubscribe();
                const el = e.target as HTMLElement;
                if (el.parentElement.classList.contains('ctx-menu')) {
                    return;
                }
                this.hideContextMenu();
                this.cd.detectChanges();
            });

            this.r2.setStyle(ctxEl, 'visibility', 'visible');
        });
    }

    /**
     * Exports widget as file
     * @param type
     */
    exportWidget(type: string) {
        const comp = this.getWidgetByInfo(this.ctxItem).component;
        const opt = {
            sourceWidth: Math.floor(window.screen.width / 2),
            sourceHeight: Math.floor(window.screen.height / 2),
            filename: this.ctxItem.tile || 'chart',
            type: 'image/svg+xml'
        } as ExportingOptions;

        switch (type) {
            case 'png':
                opt.type = 'image/png';
                break;
            case 'svg':
                opt.type = 'image/svg+xml';
                break;
            case 'jpg':
                opt.type = 'image/jpeg';
                break;
            case 'pdf':
                opt.type = 'application/pdf';
                break;
            case 'xls': {
                let mdx = comp?.getMDX();
                if (!mdx) {
                    console.warn(`Can't get MDX for widget: ${this.ctxItem}`);
                    return;
                }
                if (comp?.lpt) {
                    const lpt = comp.lpt;
                    mdx = lpt._dataSourcesStack[lpt._dataSourcesStack.length - 1].BASIC_MDX + lpt.dataSource.FILTERS;
                }
                const folder = this.ss.serverSettings.DefaultApp || ('/csp/' + CURRENT_NAMESPACE);
                const url = folder + '/_DeepSee.UI.MDXExcel.zen?MDX=' + encodeURIComponent(mdx);
                window.open(url, '_blank');
                this.hideContextMenu();
                return;
            }
            case 'csv': {
                this.exportToCsv();
                this.hideContextMenu();
                return;
            }
        }
        if (this.ctxItem.isChart) {
            comp.chart.exportChart(opt, null);
        }
        this.hideContextMenu();
    }

    private exportToCsv() {
        const comp = this.getWidgetByInfo(this.ctxItem).component;
        const d = comp._currentData;
        if (!comp.lpt && !d) {
            return;
        }
        let cats, ser, data;
        if (comp.lpt) {
            ser = comp.lpt.dataController.getData().dimensions[0];
            cats = comp.lpt.dataController.getData().dimensions[1];
            data = comp.lpt.dataController.getData().dataArray;
        } else {
            cats = d.Cols[1].tuples;
            ser = d.Cols[0].tuples;
            data = d.Data;
        }
        const nl = '\r\n';
        const sep = '|';
        let csvFile = '"sep=' + sep + '"' + nl;
        let i, j;
        // if (ser.length === 1) {
        //
        // } else {
        // Build header
        if (cats[0] && cats[0].dimension) {
            csvFile += cats[0].dimension + sep;
        }
        for (j = 0; j < ser.length; j++) {
            csvFile += ser[j].caption;
            if (j !== ser.length - 1) {
                csvFile += sep;
            }
        }
        csvFile += nl;

        // Build data
        for (i = 0; i < (cats.length || (data.length / ser.length)); i++) {
            if (cats[i] && cats[i].caption) {
                csvFile += cats[i].caption + sep;
            }
            for (j = 0; j < ser.length; j++) {
                csvFile += data[i * ser.length + j] || '0';
                if (j !== ser.length - 1) {
                    csvFile += sep;
                }
            }
            csvFile += nl;
        }
        // }

        const filename = (this.ctxItem.title || 'data') + '.csv';
        const blob = new Blob([csvFile], {type: 'text/csv;charset=utf-8;'});
        // @ts-ignore
        if (navigator.msSaveBlob) { // IE 10+
            // @ts-ignore
            navigator.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                setTimeout(() => {
                    link.click();
                    document.body.removeChild(link);
                }, 10);
            }
        }
    }

    checkItems() {
        console.log('CD!');
    }

    /**
     * Shows sub menu element
     * @param sub
     */
    showSubmenu(sub: HTMLDivElement, e: MouseEvent) {
        // Do not recal pos if hovering sub items
        if (!(e.target as HTMLElement).classList.contains('ctx-sub')) {
            return;
        }
        // Remove offset
        this.r2.removeStyle(sub, 'transform');
        // Hide before calculate offset
        this.r2.setStyle(sub, 'visibility', 'hidden');

        // Wait to shown in DOM
        setTimeout(() => {
            const b = sub.getBoundingClientRect();

            let ox = 0;
            let oy = 0;

            // Check if in vertical bounds of screen
            if (b.top + b.height > window.innerHeight) {
                // Adjust Y offset, if not
                oy = b.top + b.height - window.innerHeight + 10;
            }

            // Check if in horizontal bounds of screen
            if (b.left + b.width > window.innerWidth) {
                // Adjust X offset, if not
                ox = b.width + sub.parentElement.getBoundingClientRect().width + 2;
            }

            this.r2.setStyle(sub, 'transform', `translateX(${-ox}px) translateY(${-oy}px)`);
            this.r2.setStyle(sub, 'visibility', 'visible');
        });
    }

    @HostListener('touchstart', ['$event'])
    onTouchStart(e: TouchEvent) {
        this.touchInfo = {
            startTime: performance.now(),
            endTime: 0,
            sx: e.changedTouches[0].screenX,
            sy: e.changedTouches[0].screenY,
            ex: 0,
            ey: 0
        };
    }

    @HostListener('touchend', ['$event'])
    onTouchEnd(e: TouchEvent) {
        if (this.isMobileFilterVisible) {
            return;
        }
        const ti = this.touchInfo;
        ti.endTime = performance.now();
        ti.ex = e.changedTouches[0].screenX;
        ti.ey = e.changedTouches[0].screenY;
        if (ti.endTime - ti.startTime > SWIPE_TIME_THRESHOLD) {
            return;
        }
        if (Math.abs(ti.ey - ti.sy) > SWIPE_PIXELS_Y_THRESHOLD) {
            return;
        }
        if (Math.abs(ti.ex - ti.sx) < SWIPE_PIXELS_X_THRESHOLD) {
            return;
        }
        const dx = ti.ex > ti.sx ? -1 : 1;
        this.page += dx;
        const count = this.dbs.getWidgets().length;
        if (this.page < 0) {
            this.page = 0;
        }
        if (this.page > count - 1) {
            this.page = count - 1;
        }

        // Update title
        this.ms.onSetTitle.emit(this.dbs.getWidgets()[this.page].title);

        // Redraw some widgets
        const comp = this.widgets.toArray()[this.page].component;
        if (comp instanceof WTextComponent) {
            comp.adjustSize();
            return;
        }
        if (comp instanceof BaseChartClass && comp.chartConfig.chart.type !== 'treemap') {
            comp.updateChart(true, false);
            //comp.onResize();
            return;
        }
    }

    ctxDrill() {
        this.bs.broadcast('drilldown:' + this.ctxItem.name, {
            path: this.contexMenuData.drillPath,
            title: this.contexMenuData.drillTitle
        });
        this.hideContextMenu();
    }

    ctxDrillthrough() {
        this.bs.broadcast('drillthrough:' + this.ctxItem.name, {
            path: this.contexMenuData.drillPath,
            title: this.contexMenuData.drillTitle
        });
        this.hideContextMenu();
    }

    private fitEmptyWidget() {
        let empty = null;
        let maxx = 0;
        let maxy = 0;
        this.widgetInfo.forEach(wi => {
            if (wi.name === 'emptyWidget') {
                empty = wi;
                return;
            }
            const x = (wi.x || 0) + (wi.cols || 0);
            const y = (wi.y || 0) + (wi.rows || 0);
            if (x > maxx) {
                maxx = x;
            }
            if (y > maxy) {
                maxy = y;
            }
        });
        if (!empty) {
            return;
        }
        empty.rows = maxy || 2;
    }

    gotoKPIPage(w: IWidgetInfo) {
        if (!w.kpiclass) {
            return;
        }
        const folder = this.ss.serverSettings.DefaultApp || '/csp/' + CURRENT_NAMESPACE;
        const url = folder + '/' + w.kpiclass + '.cls';
        window.open(url, '_blank');
    }

    gotoAnalyzer(w: IWidgetInfo) {
        if (!w.dataSource) {
            return;
        }
        const folder = this.ss.serverSettings.DefaultApp || '/csp/' + CURRENT_NAMESPACE;
        const filters = this.fs.getFiltersUrlString(w.name, false, '\t', '\n');
        let url = folder + '/_DeepSee.UI.Dialog.Analyzer.zen?&PIVOT=' + encodeURIComponent(w.dataSource);
        if (filters) {
            url += '&FILTERSTATE=' + filters;
        }
        window.open(url, '_blank');
    }
}
