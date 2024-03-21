import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    Inject,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {GridsterConfig, GridsterItem, GridsterItemComponentInterface, GridType} from 'angular-gridster2';
import {dsw} from '../../../../environments/dsw';
import {combineLatest, fromEvent, Subscription} from 'rxjs';
import {IWidgetInfo} from '../../widgets/base-widget.class';
import {CURRENT_NAMESPACE} from '../../../services/namespace.service';
import {ExportingOptions} from 'highcharts';
import {WTextComponent} from '../../widgets/text/wtext.component';
import {BaseChartClass} from '../../widgets/charts/base-chart.class';
import {DashboardEditingClass} from './dashboard-editing.class';
import {WidgetEditorComponent} from '../../editor/widget-editor/widget-editor.component';

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
export class DashboardScreenComponent extends DashboardEditingClass implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('ctxMenu') ctxMenu!: ElementRef;

    private settings: any;
    private readonly sharedWidget: string = '';
    private readonly subReset: Subscription;
    private subCtxClose?: Subscription;
    private subContextMenu: Subscription;
    private subMobileFilterDialog: Subscription;
    private touchInfo?: ITouchInfo;
    private path = '';
    page = 0;

    model = {
        items: []
    };
    ctxItem?: IWidgetInfo;
    contexMenuData: IContextMenuData = {
        canDrill: false,
        canDrillthrough: false
    };
    tilesOptions: GridsterConfig = {
        useTransformPositioning: true,
        margin: 20,
        // rowHeightRatio: 1.5,
        // gridType: GridType.ScrollVertical,
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
    isLoading = true;
    itemsInitialized = 0;
    mobileFilter?: IWidgetInfo;
    isMobileFilterVisible = false;

    private subSettingsChanged?: Subscription;
    private subOnSidebarAnim: Subscription;
    private subParamsChange?: Subscription;
    private onLoadingTimeout?: ReturnType<typeof setTimeout>;

    trackByName = (index: number, w: IWidgetInfo) => {
        const nameKey = this.path + '-' + w.name.toString();
        if (w === this.editedWidget) {
            // For edited widget use a key,
            // this allows us to recreate widget if needed (e.g. when type has been changed)
            // by changing the key
            return this.editedWidget.edKey || nameKey;
        }
        return nameKey;
    }

    constructor(@Inject(Injector) protected inj: Injector) {
        super(inj);

        this.checkRestrictions();
        this.hs.resetSearch();
        this.hs.hideMobileFilterButton();

        this.sharedWidget = this.route.snapshot.queryParamMap.get('widget') ?? '';

        this.subscribeForGridsterEvents();
        this.loadSettings();
        this.subscribeForSettingsChanged();
        this.subscribeForEditing();

        // Resize gridster after sidebar animation
        this.subOnSidebarAnim = this.sbs.onAnimEnd.subscribe(() => {
            this.gridster.onResize();
        });

        this.setupSharedWidget();

        this.isMobile = this.us.isMobile();
        this.subReset = this.bs.subscribe('refresh-dashboard', () => {
            this.requestData();
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
        this.subscribeForParamsChange();

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
        super.ngOnDestroy();
        clearTimeout(this.onLoadingTimeout);
        window.onafterprint = null;
        this.subParamsChange?.unsubscribe();
        this.subOnSidebarAnim.unsubscribe();
        this.subContextMenu.unsubscribe();
        this.subMobileFilterDialog.unsubscribe();
        if (this.subCtxClose) {
            this.subCtxClose.unsubscribe();
        }
        if (this.subReset) {
            this.subReset.unsubscribe();
        }
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
        this.ctxItem = undefined;
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
     * Builds widget list
     */
    prepareData(result) {
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
            this.fs.init(result.filters, this.path);
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
                    dashboard: this.path,
                    autocreated: true,
                    name: 'emptyWidget',
                    type: dsw.const.emptyWidgetClass,
                    key: 'emptyWidgetFor' + this.path
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
        this.list = [];
        this.dbs.setWidgets(this.list);
        this.dbs.setAllWidgets(result.widgets);
        for (i = 0; i < result.widgets.length; i++) {
            result.widgets[i].dashboard = this.path;
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
                // Don't use predefined height for empty widget
                // It will be calculated during fitEmptyWidget() call
                rows: result.widgets[i].type?.toLowerCase() === dsw.const.emptyWidgetClass ? undefined : 2,
                x: (i * 2) % (this.tilesOptions.maxCols || 1),
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
                if (this.tilesOptions.maxCols !== undefined && (item.cols > this.tilesOptions.maxCols)) {
                    item.cols = this.tilesOptions.maxCols;
                }
            }
            if (result.widgets[i].autocreated) {
                delete item.x;
                delete item.y;
            }
            if (result.widgets[i].name) {
                this.setWidgetSizeAndPos(item, result.widgets[i].name.toString());
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

            this.list.push(item);
        }

        if (!this.sharedWidget) {
            setTimeout(() => this.broadcastDependents(), 0);
        }

        this.fitEmptyWidget();

        this.dbs.setWidgets(this.list);

        // Update title
        this.ms.onSetTitle.emit(this.dbs.getWidgets()[this.page]?.title);


        /*
                if (this.editedWidget) {
                    this.list.push(this.editedWidget);
                }
        */

        /*this.cd.detectChanges();
        this.gridster.updateGrid();
        this.gridster.onResize()*/

        setTimeout(() => {
            // this.isLoaded = true;
        });
    }

    /**
     * Send message to refresh all dependent widgets
     */
    broadcastDependents() {
        const brodcasted: any[] = [];
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].dependents.length !== 0) {
                const item = this.list[i];
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
                if (!widgets[i].dataLink) {
                    continue;
                }
                if (widgets[i].dataLink === item.name) {
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
    setWidgetSizeAndPos(item, k) {
        const widgets = this.ss.getWidgetsSettings(this.path);
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
        if (!this.list[idx]) {
            return undefined;
        }
        return this.list[idx];
    }

    onWidgetSizeChanged(item: any, e?: TransitionEvent) {
        if (e && (e.propertyName !== 'width' && e.propertyName !== 'height')) {
             return;
         }
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
        if (item === this.editedWidget) {
            return;
        }
        this.contexMenuData = ctxData;
        const ctxEl = this.ctxMenu.nativeElement;
        this.r2.setStyle(ctxEl, 'visibility', 'hidden');

        let noMenu = false;
        const noCtxProp = item.dataProperties?.find(p => p.name === 'disableContextMenu');
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
            this.subCtxClose = fromEvent(document, 'mousedown').subscribe(e => {
                this.subCtxClose?.unsubscribe();
                const el = e.target as HTMLElement;
                if (el.parentElement?.classList.contains('ctx-menu')) {
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
        const comp = this.getWidgetByInfo(this.ctxItem)?.component;
        const opt = {
            sourceWidth: Math.floor(window.screen.width / 2),
            sourceHeight: Math.floor(window.screen.height / 2),
            filename: this.ctxItem?.tile || 'chart',
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
                const url = folder + '/_DeepSee.UI.MDXExcel.zen?MDX=' + encodeURIComponent(mdx || '');
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
        if (this.ctxItem?.isChart) {
            comp?.chart.exportChart(opt, {});
        }
        this.hideContextMenu();
    }

    private exportToCsv() {
        const comp = this.getWidgetByInfo(this.ctxItem)?.component;
        const d = comp?._currentData;
        if (!comp || !comp.lpt || !d) {
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

        const filename = (this.ctxItem?.title || 'data') + '.csv';
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
                ox = b.width + (sub.parentElement?.getBoundingClientRect()?.width || 0) + 2;
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
        if (!ti) {
            return;
        }
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
        if (comp instanceof BaseChartClass && comp.chartConfig.chart?.type !== 'treemap') {
            comp.updateChart(true, false);
            // comp.onResize();
            return;
        }
    }

    ctxDrill() {
        this.bs.broadcast('drilldown:' + (this.ctxItem?.name || ''), {
            path: this.contexMenuData.drillPath,
            title: this.contexMenuData.drillTitle
        });
        this.hideContextMenu();
    }

    ctxDrillthrough() {
        this.bs.broadcast('drillthrough:' + (this.ctxItem?.name || ''), {
            path: this.contexMenuData.drillPath,
            title: this.contexMenuData.drillTitle
        });
        this.hideContextMenu();
    }

    private fitEmptyWidget() {
        let empty: any;
        let maxx = 0;
        let maxy = 0;
        this.list.forEach(wi => {
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
        if (!empty || empty.rows) {
            return;
        }
        empty.rows = maxy || 2;
    }

    gotoKPIPage(w?: IWidgetInfo) {
        if (!w?.kpiclass) {
            return;
        }
        const folder = this.ss.serverSettings.DefaultApp || '/csp/' + CURRENT_NAMESPACE;
        const url = folder + '/' + w.kpiclass + '.cls';
        window.open(url, '_blank');
    }

    gotoAnalyzer(w?: IWidgetInfo) {
        if (!w?.dataSource) {
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

    private requestData() {
        this.list = [];
        // Return if this is not a dashboard
        if (this.path.indexOf('.dashboard') === -1) {
            return;
        }
        this.isLoading = true;
        this.cd.detectChanges();
        this.ds.getWidgets(this.path || '')
            .then(data => {
                this.dbs.dashboard.next(data);
                this.prepareData(data);
            })
            .finally(() => {
                this.onDataLoaded();
            });
    }

    private subscribeForParamsChange() {
        this.subParamsChange = combineLatest([
            this.route.url,
            this.route.params
        ]).subscribe(([segments, params]) => {
            this.switchNamespaceAndPath(segments, params);
            this.requestData();
        });
    }

    private switchNamespaceAndPath(segments: any, params: any) {
        // Switch namespace if changed
        if (params.ns && params.ns.toLowerCase() !== CURRENT_NAMESPACE.toLowerCase()) {
            this.ns.setCurrent(params.ns);
        }
        // Build path
        this.path = [params.name, ...segments.map(s => s.path)].join('/').slice(1);
        this.dbs.current.next(this.path);
    }

    ctxEdit() {
        // Reset editing if edit another widget
        if (this.editedWidget && this.editedWidget !== this.ctxItem) {
            this.sbs.showComponent(null);
        }
        if (this.ctxItem?.isExpanded) {
            const w = this.getWidgetByInfo(this.ctxItem);
            w?.header?.onClick('expand');
        }
        this.sbs.showComponent({component: WidgetEditorComponent, single: true, inputs: {widget: this.ctxItem}});
        this.hideContextMenu();
    }

    private onDataLoaded() {
        this.cd.detectChanges();
        this.gridster.onResize();
        clearTimeout(this.onLoadingTimeout);
        this.onLoadingTimeout = setTimeout(() => {
            this.isLoading = false;
            this.cd.detectChanges();
        }, 1);
    }

    private subscribeForSettingsChanged() {
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
    }

    private subscribeForGridsterEvents() {
        // This resize needed only for editable widget, because animation disabled
        // and transitionend event not fired
        this.tilesOptions.itemResizeCallback = (item: GridsterItem) => {
            this.onWidgetSizeChanged(item);
        };

        if (this.tilesOptions.draggable) {
            this.tilesOptions.draggable.start = () => {
                this.cd.detach();
            };

            this.tilesOptions.draggable.stop = () => {
                this.cd.reattach();
            };
        }

        this.tilesOptions.itemChangeCallback = (item: GridsterItem, itemComponent: GridsterItemComponentInterface) => {
            if (this.isLoading) {
                return;
            }
            this.dbs.saveWidgetPositionAndSize(item as IWidgetInfo);
        };
    }

    private loadSettings() {
        this.settings = this.ss.getAppSettings();
        this.tilesOptions.maxCols = parseInt(this.settings.colCount, 10) || DEFAULT_COL_COUNT;
        this.tilesOptions.minCols = this.tilesOptions.maxCols;
        this.tilesOptions.fixedRowHeight = parseInt(this.settings.widgetHeight, 10) || (Math.floor((window.innerHeight - 158) / 10)) - 1;
    }

    private setupSharedWidget() {
        if (!this.sharedWidget) {
            return;
        }
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
            // this.tilesOptions.rowHeight = "match";
        }
        this.tilesOptions.draggable = {
            enabled: false,
            dragHandleClass: ''
        };
        this.tilesOptions.resizable = {
            enabled: false
        };
    }

    private checkRestrictions() {
        if (this.route.snapshot.queryParamMap.get('nodrag') === '1' && this.tilesOptions?.draggable) {
            this.tilesOptions.draggable.enabled = false;
        }
        if (this.route.snapshot.queryParamMap.get('noresize') === '1' && this.tilesOptions?.resizable) {
            this.tilesOptions.resizable.enabled = false;
        }
    }
}
