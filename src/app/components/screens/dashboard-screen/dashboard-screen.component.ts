import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
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

export const DEFAULT_COL_COUNT = 12;

@Component({
    selector: 'dsw-dashboard-screen',
    templateUrl: './dashboard-screen.component.html',
    styleUrls: ['./dashboard-screen.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardScreenComponent implements OnInit, OnDestroy {
    @ViewChildren('widgets') widgets: WidgetComponent[];
    @ViewChild('ctxMenu') ctxMenu: ElementRef;
    @ViewChild('gridster') gridster: GridsterComponent;

    private widgetInfo: IWidgetInfo[] = [];
    private settings: any;
    private readonly sharedWidget: string;
    private readonly subReset: Subscription;
    private subCtxClose: Subscription;
    model: any;
    ctxItem: IWidgetInfo = null;
    tilesOptions: GridsterConfig = {

        useTransformPositioning: true,
        margin: 10,
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

    private subSettingsChanged: Subscription;

    constructor(private ds: DataService,
                private vs: VariablesService,
                private fs: FilterService,
                private us: UtilService,
                private ss: StorageService,
                private es: ErrorService,
                private hs: HeaderService,
                private dbs: DashboardService,
                private router: Router,
                private i18n: I18nService,
                private ns: NamespaceService,
                private cd: ChangeDetectorRef,
                private bs: BroadcastService,
                private r2: Renderer2,
                private route: ActivatedRoute) {

        this.hs.resetSearch();
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
            this.gridster.optionsChanged();
            setTimeout(() => {
                this.gridster.resize();
            }, 1000);
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

        this.isMobile = dsw.mobile;
        this.subReset = this.bs.subscribe('resetWidgets', () => {
            window.location.reload();
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
            const headerHeight = 58;
            const rows = result.displayInfo.gridRows;
            const padding = 10;
            this.tilesOptions.fixedRowHeight = Math.floor((window.innerHeight - (headerHeight + padding * (rows + 1))) / rows);
            this.gridster.optionsChanged();
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
            this.widgetInfo.push(item);
        }

        if (!this.sharedWidget) {
            setTimeout(() => this.broadcastDependents(), 0);
        }

        this.dbs.setWidgets(this.widgetInfo);
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
    showContextMenu(item: IWidgetInfo, e: MouseEvent) {
        const ctxEl = this.ctxMenu.nativeElement;
        this.r2.setStyle(ctxEl, 'visibility', 'hidden');

        if (item.type === dsw.const.emptyWidgetClass) {
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
        if (navigator.msSaveBlob) { // IE 10+
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
}
