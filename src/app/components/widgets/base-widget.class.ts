import {
    ComponentFactoryResolver,
    ElementRef,
    HostBinding,
    OnDestroy,
    OnInit,
    Directive,
    NgZone,
    ChangeDetectorRef, Inject, Injector
} from '@angular/core';
import {UtilService} from '../../services/util.service';
import {VariablesService} from '../../services/variables.service';
import {StorageService} from '../../services/storage.service';
import {DataService} from '../../services/data.service';
import {FilterService} from '../../services/filter.service';
import {ActivatedRoute} from '@angular/router';
import {I18nService} from '../../services/i18n.service';
import {IWidgetType, WidgetTypeService} from '../../services/widget-type.service';
import * as Highcharts from 'highcharts';
import {IButtonToggle} from '../../services/widget.service';
import {Subscription} from 'rxjs';
import {CURRENT_NAMESPACE, NamespaceService} from '../../services/namespace.service';
import {BroadcastService} from '../../services/broadcast.service';
import {DomSanitizer} from '@angular/platform-browser';
import {SidebarService} from '../../services/sidebar.service';
import {WidgetComponent} from './base/widget/widget.component';
import {DashboardService} from '../../services/dashboard.service';
import * as numeral from 'numeral';


export type OBoolean = 'true' | 'false';
export type OAxisType = 'percent' | '';

export interface IAxisOverride {
    title?: string;
    axisType?: OAxisType;
    majorGridStyle?: string;
    maxValue?: number;
    minValue?: number;
    _type: string;
}

export interface IWidgetOverride {
    axisTitleStyle: string;
    chartPivot: number;
    legendVisible: OBoolean;
    seriesColorsOverride: string;
    valueLabelFormat: string;
    valueLabelStyle: string;
    valueLabelsVisible: number;
    xAxis: IAxisOverride;
    yAxisList: IAxisOverride[];
    seriesTypes: string;
    showPercentage?: number;
    seriesYAxes?: string;
    _type: string;
}

export type IAddonType = 'custom' | 'chart' | 'map';
export interface IAddonInfo {
    version?: number;
    type?: IAddonType;
    chart?: string;
}

export type WidgetColumnDisplayType = 'trendLine' | 'plotBox' | 'itemNo' | 'value' | 'label' | '';
export type WidgetColumnShowType = 'value';
export type WidgetColumnSummaryType = 'sum' | '';

export interface IWidgetDataProperties {
    // align: string;
    // baseValue: string
    name: string;
    dataValue: string;
    display: WidgetColumnDisplayType;
    format: string;
    label: string;
    // name: string;
    // override: string;
    rangeLower: string | number;
    rangeUpper: string | number;
    thresholdLower: string | number;
    thresholdUpper: string | number;
    targetValue: string | number;
    showAs: WidgetColumnShowType;
    summary: WidgetColumnSummaryType;
    /*style: string;
    subtype: string;
    summary: string;
    summaryValue: string;
    targetValue: string;
    valueColumn: number;
    width: string;*/
}

// Widget info object
export interface IWidgetInfo {
    // Gridster parameters
    x: number;
    y: number;
    cols: number;
    row: number;

    dataProperties: IWidgetDataProperties[];

    // Widget parameters
    name: string;
    title: string;
    baseTitle: string;
    idx: number;
    type: string;
    dashboard: string;
    dataSource: string;
    cube: string;
    controls: any[];
    linkedMdx: string;
    dependents: any[];
    Link: any;
    kpitype: string;
    mdx: string;
    properties: any;

    isExpanded: boolean;

    // Drill
    drills: any[];
    isDrillthrough: boolean;

    // Actions
    acItems: any[];

    // Pivot
    pvItems: any[];
    pivotMdx: string;
    pivotData: any;
    displayAsPivot: (mdx: string) => void;

    // For data source choser
    dsItems: any[];
    dsLabel: string;
    dsSelected: string;

    // Click filter
    clickFilterActive: boolean;

    // Type
    oldType: string;

    // UI
    backButton: boolean;
    toolbar: boolean;
    isLoading: boolean;
    isSupported: boolean;

    // Tile
    tile: any;

    // Map
    isMap: boolean;

    // Chart
    isLegend: boolean;
    overrides: IWidgetOverride[];
    isChart: boolean;
    isBtnZero: boolean;
    isBtnValues: boolean;
    inline: boolean;
    showValues: boolean;
    showZero: boolean;
    isTop: boolean;
    noToggleLegend: boolean;

    // For empty widget filters size
    viewSize: number;
}

@Directive()
export abstract class BaseWidget implements OnInit, OnDestroy {

    static CURRENT_ADDON_VERSION = 1;

    @HostBinding('class.inline') get inline(): boolean {
        return this.widget.inline;
    }

    // private subOnHeaderButton: Subscription;

    // Services
    protected el: ElementRef = null;
    protected us: UtilService = null;
    protected vs: VariablesService = null;
    protected ss: StorageService = null;
    protected ds: DataService = null;
    protected fs: FilterService = null;
    protected wts: WidgetTypeService = null;
    protected dbs: DashboardService = null;
    protected cfr: ComponentFactoryResolver = null;
    protected ns: NamespaceService = null;
    protected route: ActivatedRoute = null;
    public i18n: I18nService = null;
    public bs: BroadcastService = null;
    protected san: DomSanitizer = null;
    protected sbs: SidebarService = null;
    protected cd: ChangeDetectorRef = null;
    protected zone: NgZone = null;

    /*constructor(@Inject(ElementRef) protected el: ElementRef,
                @Inject(UtilService) protected us: UtilService,
                @Inject(VariablesService) protected vs: VariablesService,
                @Inject(StorageService) protected ss: StorageService,
                @Inject(DataService) protected ds: DataService,
                @Inject(FilterService) protected fs: FilterService,
                @Inject(WidgetTypeService) protected wts: WidgetTypeService,
                @Inject(DashboardService) private dbs: DashboardService,
                @Inject(ComponentFactoryResolver) protected cfr: ComponentFactoryResolver,
                @Inject(NamespaceService) protected ns: NamespaceService,
                @Inject(ActivatedRoute) protected route: ActivatedRoute,
                @Inject(I18nService) public i18n: I18nService,
                @Inject(BroadcastService) public bs: BroadcastService,
                @Inject(DomSanitizer) protected san: DomSanitizer,
                @Inject(SidebarService) protected sbs: SidebarService,
                @Inject(ChangeDetectorRef) protected cd: ChangeDetectorRef,
                @Inject(NgZone) protected zone: NgZone) {
    }*/

    constructor(@Inject(Injector) protected inj: Injector) {
        // Inject services
        this.el = this.inj.get(ElementRef);
        this.us = this.inj.get(UtilService);
        this.vs = this.inj.get(VariablesService);
        this.ss = this.inj.get(StorageService);
        this.ds = this.inj.get(DataService);
        this.fs = this.inj.get(FilterService);
        this.wts = this.inj.get(WidgetTypeService);
        this.dbs = this.inj.get(DashboardService);
        this.cfr = this.inj.get(ComponentFactoryResolver);
        this.ns = this.inj.get(NamespaceService);
        this.route = this.inj.get(ActivatedRoute);
        this.i18n = this.inj.get(I18nService);
        this.bs = this.inj.get(BroadcastService);
        this.san = this.inj.get(DomSanitizer);
        this.sbs = this.inj.get(SidebarService);
        this.cd = this.inj.get(ChangeDetectorRef);
        this.zone = this.inj.get(NgZone);
    }

    dataInfo = null;

    public model: any = {};
    // Parent angular component on which widget is created
    parent: WidgetComponent;

    // Widget data
    public widget: IWidgetInfo;

    // Loading spinner, do now use directly
    // use showLoading(), hideLoading() instead
    public isSpinner = true;
    protected drills = [];
    protected drillFilter = '';
    protected drillFilterDrills = [];
    protected pivotVariables = null;

    tc: any;
    protected widgetsSettings: any;

    // Array of widget names that shall be filtered during drill down
    drillFilterWidgets = null;
    _currentData = null;

    _kpiData = null;

    // If widget on tile
    protected tile = null;

    // For light pivot
    public lpt;

    // For chart
    public chart: Highcharts.Chart;
    protected customColSpec = '';
    protected customRowSpec = '';
    protected customDataSource = '';
    protected pivotData = null;
    protected linkedMdx = '';
    protected liveUpdateInterval = null;
    protected canDoDrillthrough = false;

    protected firstRun = true;
    protected chartConfig: any;

    private subLinkedMdx: Subscription;
    private subRefreshDepenend: Subscription;
    private subDrillFilter: Subscription;
    private subDrillFilterAll: Subscription;
    private subPivotVar: Subscription;
    private subPivotVarAll: Subscription;
    private subDataSourcechange: Subscription;
    private subColSpec: Subscription;
    private subColSpecAll: Subscription;
    private hasDatasourceChoser = false;
    protected override: IWidgetOverride = null;
    protected baseType = '';

    private oneItemDrillApplied = false;

    createWidgetComponent: (type?: string) => void;
    protected onInit = () => {
    }

    ngOnInit() {
        this.baseType = this.widget?.type;
        this.override = this.getOverride();
        const settings = this.ss.getAppSettings();

        const theme = settings.theme || '';
        this.widgetsSettings = this.ss.getWidgetsSettings(this.widget.dashboard) || {};
        this.tc = settings.themeColors[theme] || {};

        // Override theme colors by widget custom colors
        if (this.widgetsSettings[this.widget.name] &&
            this.widgetsSettings[this.widget.name].themeColors &&
            this.widgetsSettings[this.widget.name].themeColors[theme]) {
            this.tc = this.widgetsSettings[this.widget.name].themeColors[theme];
        }

        if (this.widget && this.widget.drills) {
            this.drills = this.widget.drills;
        }

        // TODO: check base title
        // if (this.widget && this.widget.baseTitle === undefined) this.widget.baseTitle = this.widget ? this.widget.title : this.$parent.title;

        if (this.tile) {
            this.widget = {} as any;
            this.us.mergeRecursive(this.widget, this.tile);
        }
        // Setup for actions
        this.widget.acItems = [];

        // Pivot variables items
        this.widget.pvItems = [];

        // Setup for data source chooser
        this.widget.dsItems = [];
        this.widget.dsLabel = '';
        this.widget.dsSelected = '';
        if (this.widget && this.widget.dataSource) {
            this.widget.dsSelected = this.us.removeExt(this.widget.dataSource.split('/').pop());
        }

        if (this.widget.controls && this.widget.controls.length) {
            this.canDoDrillthrough = this.widget.controls.find((c) => {
                return c.action === 'showListing';
            }) !== undefined;
        }

        // this.liveUpdateInterval = setInterval(this.requestData, 5000);
        // Find refresh controls with timeout
        if (this.widget && this.widget.controls) {

            const colSpec = this.widget.controls.filter((ctrl) => {
                return ctrl.action === 'setColumnSpec';
            });
            if (colSpec.length !== 0) {
                this.customColSpec = colSpec[0].targetProperty;
            }

            const refreshers = this.widget.controls.filter((ctrl) => {
                return ctrl.action === 'refresh' && parseInt(ctrl.timeout) > 0;
            });
            if (refreshers.length !== 0) {
                // Use only one
                this.liveUpdateInterval = setInterval(() => this.requestData(), parseInt(refreshers[0].timeout) * 1000);
            }
        }

        // Subscribe for drill filter for widget and for all
        this.subDrillFilter = this.bs.subscribe('drillFilter:' + this.widget.name, ({path, drills}) => {
            this.onDrillFilter(path, drills);
        });
        this.subDrillFilterAll = this.bs.subscribe('drillFilter:*', ({path, drills}) => {
            this.onDrillFilter(path, drills);
        });

        // Subscribe for pivot variable changes
        this.subPivotVar = this.bs.subscribe('updatePivotVar:' + this.widget.name, (v) => this.onPivotVarChanged());
        this.subPivotVarAll = this.bs.subscribe('updatePivotVar:*', (v) => this.onPivotVarChanged());

        // Subscribe for col spec changes
        this.subColSpec = this.bs.subscribe('setColSpec:' + this.widget.name, (path) => this.onColSpecChanged(path));
        this.subColSpecAll = this.bs.subscribe('setColSpec:*', (path) => this.onColSpecChanged(path));


        this.subDataSourcechange = this.bs.subscribe('changeDataSource:' + this.widget.name, (pivot) => this.changeDataSource(pivot));


        // TODO: filter count
        // if (this.filterCount === undefined) {
        //     Object.defineProperty(this, 'filterCount', {
        //         get:  () => {
        //             return this.model.filters.length;
        //         }
        //     });
        // }

        if (this.isLinked()) {
            this.subLinkedMdx = this.bs.subscribe('setLinkedMDX:' + this.widget.name, (mdx: string) => this.onSetLinkedMdx(null, mdx));
        }
        if (this.hasDependents()) {
            this.subRefreshDepenend = this.bs.subscribe('widget:' + this.widget.name + ':refreshDependents', (v) => this.onRefreshDependents());
        }

        this.setupDrillFilter();
        this.setupChoseDataSource();
        this.setupActions();

        this.requestPivotData();
        this.requestData();
    }

    ngOnDestroy() {
        if (this.subLinkedMdx) {
            this.subLinkedMdx.unsubscribe();
        }
        if (this.subRefreshDepenend) {
            this.subRefreshDepenend.unsubscribe();
        }
        if (this.subDrillFilter) {
            this.subDrillFilter.unsubscribe();
        }
        if (this.subDrillFilterAll) {
            this.subDrillFilterAll.unsubscribe();
        }
        if (this.subPivotVar) {
            this.subPivotVar.unsubscribe();
        }
        if (this.subPivotVarAll) {
            this.subPivotVarAll.unsubscribe();
        }
        if (this.subDataSourcechange) {
            this.subDataSourcechange.unsubscribe();
        }
        if (this.subColSpec) {
            this.subColSpec.unsubscribe();
        }
        if (this.subColSpecAll) {
            this.subColSpecAll.unsubscribe();
        }
        this.destroy();
    }

    private getOverride(): IWidgetOverride {
        let t = this.baseType;
        if (t === 'lineChartMarkers') {
            t = 'lineChart';
        }
        return this.widget?.overrides?.find(o => o._type === t);
    }

    /**
     * Setup action buttons for widget. Received from controls
     */
    setupActions() {
        if (!this.widget.controls || this.widget.controls.length === 0) {
            return;
        }
        const stdList = ['chooserowspec', 'choosedatasource', 'choosecharttype', 'applyfilter',
            'setfilter', 'refresh', 'reloaddashboard', 'showlisting', 'showgeolisting',
            'showbreakdown', 'setdatasource', 'applyvariable', 'viewdashboard', 'setrowcount',
            'setrowsort', 'setcolumncount', 'setcolumnsort', 'choosecolumnspec'];

        /*var stdList = ['applyfilter', 'setfilter', 'refresh', 'reloaddashboard', 'setdatasource',
            'applyvariable', 'setrowspec', 'setcolumnspec',
            'choosecolumnspec', 'viewdashboard', 'navigate',
            'newwindow', 'setrowcount', 'setrowsort', 'setcolumncount', 'setcolumnsort', 'newwindow'];*/
        const actions = this.widget.controls.filter((el) => {
            return stdList.indexOf(el.action.toLowerCase()) === -1 && el.type !== 'hidden';
        });
        if (actions.length === 0) {
            return;
        }
        // this.hasActions = true;
        // this.showToolbar();
        this.widget.acItems = actions;
        // Filters.isFiltersOnToolbarExists = true;
    }

    /**
     * Will setup datasource chooser. If widget has control chooseDataSource
     */
    setupChoseDataSource() {
        if (!this.widget) {
            return;
        }

        const filterChoosers = (el) => {
            return el.action === 'chooseDataSource' || el.action === 'chooseRowSpec' || el.action === 'chooseColumnSpec';
        };

        const isEmptyWidget = this.widget.type === 'mdx2json.emptyportlet';

        if (!isEmptyWidget && (!this.widget.controls || this.widget.controls.length === 0)) {
            return;
        }
        let choosers = [];
        if (this.widget.controls) {
            // Get all choosers that not placed on dashboard location
            choosers = this.widget.controls.filter(filterChoosers).filter(c => c.location !== 'dashboard');
        }

        // If this is empty widget, find other choosers on other widgets with location = "dashboard"
        if (isEmptyWidget) {
            const widgets = this.dbs.getWidgets();
            for (let i = 0; i < widgets.length; i++) {
                if (widgets[i].controls) {
                    choosers = choosers.concat(
                        widgets[i].controls.filter(filterChoosers).filter(c => c.location === 'dashboard')
                    );
                }
            }
        }

        if (choosers.length === 0) {
            return;
        }
        this.hasDatasourceChoser = true;
        this.widget.dsItems = [];
        for (let i = 0; i < choosers.length; i++) {
            let prop = choosers[i].targetProperty;
            if (!prop) {
                continue;
            }
            const a = prop.split('.');
            a.pop();
            prop = a.join('.');
            const item = {
                action: choosers[i].action,
                label: choosers[i].label || this.i18n.get('dataSource'),
                dsSelected: choosers[i].value,
                control: choosers[i],
                labels: [],
                values: []
            };
            this.widget.dsItems.push(item);
            this.ds.getTermList(prop).then(data => {
                if (data && typeof data === 'object') {
                    for (const prop in data) {
                        if (data[prop] === this.widget.dataSource) {
                            this.widget.dsSelected = prop;
                        }
                    }
                    item.labels = [];
                    item.values = [];
                    for (const k in data) {
                        item.labels.push(k);
                        item.values.push(data[k]);
                    }
                    // Set selection to first item, if current item is wrong
                    const selIdx = item.values.findIndex(v => v.split('/').pop() === item.dsSelected);
                    if (selIdx === -1) {
                        item.dsSelected = item.labels[0];
                    } else {
                        item.dsSelected = item.labels[selIdx];
                    }
                }
            });
        }
    }

    /**
     * Callback for pivot variable change
     */
    onVariableChange(v) {
        const target = v.target;
        this.bs.broadcast(`updatePivotVar:${target}`);
    }

    // toggleButton(name) {
    //     this.widget[name] = !this.widget[name];
    //     const widgetsSettings = this.ss.getWidgetsSettings(this.widget.dashboard);
    //     if (!widgetsSettings[this.widget.name]) {
    //         widgetsSettings[this.widget.name] = {};
    //     }
    //     widgetsSettings[this.widget.name][name] = this.widget[name];
    //     this.ss.setWidgetsSettings(widgetsSettings, this.widget.dashboard);
    // }

    //  toggleExpanded() {
    //     this.toggleButton('isExpanded');
    //     if (this.expandWidget) {
    //         this.expandWidget();
    //     }
    // }

    /**
     * Callback for pivot variable changes
     */
    onPivotVarChanged() {
        this.requestData();
    }

    getDataByColumnName(data, columnName, dataIndex) {
        if (!data || !data.Data || !data.Cols || !data.Cols[0] || !data.Cols[0].tuples) {
            return;
        }
        const col = data.Cols[0].tuples.filter((el) => el.caption.toLowerCase() === columnName.toLowerCase());
        if (col.length === 0) {
            return;
        }
        const idx = data.Cols[0].tuples.indexOf(col[0]);
        return data.Data[dataIndex + idx];
    }

    setupDrillFilter() {
        const flt = this.fs.getClickFilterTarget(this.widget.name);
        if (flt) {
            this.drillFilterWidgets = flt.split(',');
        }
    }

    /**
     * Resets drill filter
     */
    resetClickFilter() {
        this.widget.clickFilterActive = false;
        if (!this.drillFilterWidgets || !this.drillFilterWidgets.length) {
            return;
        }
        for (let i = 0; i < this.drillFilterWidgets.length; i++) {
            this.bs.broadcast('drillFilter:' + this.drillFilterWidgets[i], {path: '', drills: []});
        }
    }

    doDrillFilter(path, drills) {
        if (!this.drillFilterWidgets || !this.drillFilterWidgets.length) {
            return;
        }
        let i;
        const dr = drills.slice();
        if (!path) {
            dr.pop();
        }
        this.widget.clickFilterActive = !!path;
        for (i = 0; i < this.drillFilterWidgets.length; i++) {
            this.bs.broadcast('drillFilter:' + this.drillFilterWidgets[i], {path, drills: dr});
        }
    }

    onDrillFilter(path: string, drills: string[]) {
        // TODO: removed back button on drill filter target
        // this.widget.backButton = !!path;
        this.drillFilter = path;
        this.drillFilterDrills = drills;
        this.requestData();
    }

    actionNavigate(action, newWindow = false) {
        let url = action.targetProperty;
        const idx = url.toUpperCase().indexOf('DASHBOARD=');
        if (idx !== -1) {
            let dashboard = url.substring(idx + 10, url.length);
            // Replace first & to ? if there is no ?
            if (dashboard.indexOf('?') === -1) {
                dashboard = dashboard.replace('&', '?');
            }

            const cur = location.href;
            const h = cur.indexOf('#');
            if (h !== -1) {
                url = cur.split('#')[0] + '#/' + CURRENT_NAMESPACE + '/' + dashboard;
            } else {
                url += '#/' + CURRENT_NAMESPACE + '/' + dashboard;
            }
        }

        // Build filter string
        /*let f = [];
        let widgetFilters = Filters.getAffectsFilters(this.widget.name);
        for (let i = 0; i < widgetFilters.length; i++) {
            let flt = widgetFilters[i];
            if (!flt.value) continue;
            let v = '';
            if (flt.isInterval) {
                // Format filter string like path.v1:v2
                v = flt.targetProperty + '.' + flt.values[flt.fromIdx].path + ':' + flt.values[flt.toIdx].path;
            } else {
                v = flt.targetProperty + '.' + (flt.isExclude ? '%NOT ' : '') + flt.value;
            }
            // For many selected values make correct filter string {v1,v2,v3}
            if (v.indexOf('|') !== -1) {
                v = v.replace(/\|/g, ',').replace('&[', '{&[') + '}';
            }
            f.push(v);
        }*/
        // url = url.replace('$$$FILTERS', encodeURIComponent(f.join('~')));
        url = url.replace('$$$FILTERS', this.fs.getFiltersUrlString(this.widget.name));

        // Get current value for $$$currvalue
        if (this.lpt) {
            if (this.lpt.getSelectedRows().length) {
                const d = this.lpt.dataController.getData();
                const id = d.dataArray[(this.lpt.getSelectedRows()[0] - 1) * d.columnProps.length];
                const idx = url.toLowerCase().indexOf('$$$currvalue');
                if (idx !== -1) {
                    url = url.substring(0, idx) + id + url.substring(idx + 12, url.length);
                }
            }
        }

        // Get values for $$$valuelist
        if (this.lpt) {
            if (this.lpt.getSelectedRows().length) {
                const d = this.lpt.dataController.getData();
                const rows = this.lpt.getSelectedRows();
                const values = [];
                for (let j = 0; j < rows.length; j++) {
                    const id = d.dataArray[(rows[j] - 1) * d.columnProps.length];
                    values.push(id);
                }
                const idx = url.toLowerCase().indexOf('$$$valuelist');
                if (idx !== -1) {
                    url = url.substring(0, idx) + values.join(',') + url.substring(idx + 12, url.length);
                }
            }
        }

        /*if (location.search.indexOf('embed=') === -1) {
            url += '&embed=1';
        }*/

        if (newWindow) {
            window.open(url, '_blank');
        } else {
            window.location = url;
        }
    }

    performAction(action) {
        const a = action.action.toLowerCase();

        if (a === 'navigate') {
            this.actionNavigate(action);
        } else if (a === 'newwindow') {
            this.actionNavigate(action, true);
        } else if (a === 'setColumnSpec') {
            this.customColSpec = action.targetProperty;
            this.requestData();
        } else {
            this.ds.execAction(
                action.action,
                this.widget.cube ? this.widget.cube : this.widget.dataSource.replace('.kpi', '')
            ).then(() => this.requestData());
        }
    }

    getDrillTitle(drill?) {
        if (!drill) {
            return this.widget.baseTitle || '';
        }
        const p = drill.path.split('.');
        p.pop();
        return (this.widget.baseTitle ? (this.widget.baseTitle + ' - ') : '') + (drill.name ? (p[p.length - 1] + ' - ') : '') + (drill.name || drill.category);
    }

    isEmptyData(data) {
        return !data || !data.Cols || !data.Cols[1] ||
            !data.Cols[1] || !data.Cols[1].tuples || data.Cols[1].tuples.length === 0 ||
            !data.Data || data.Data.length === 0 || data.Data[0] === '@NOPROPERTY';
    }


    /**
     * Back button click handler
     */
    doDrillUp() {
        if (this.widget.isDrillthrough) {
            this.restoreWidgetType();
            this.widget.isDrillthrough = false;
        } else {
            this.doDrill();
        }
    }

    restoreWidgetType() {
        delete this.widget.pivotMdx;
        delete this.widget.pivotData;
        // TODO: this.widget.backButton = this.drills.length !== 0;
        this.widget.type = this.widget.oldType;
        this.createWidgetComponent();
    }

    changeWidgetType(newType: string) {
        this.widget.oldType = this.widget.type;
        this.widget.type = newType;
        this.createWidgetComponent();
    }


    getDrillthroughMdx(mdx: string) {
        const m = mdx.toLowerCase();
        let selTxt = 'select non empty';
        let idx1 = m.indexOf(selTxt);
        if (idx1 === -1) {
            selTxt = 'select';
            idx1 = m.indexOf(selTxt);
        }
        const idx2 = m.indexOf('from');
        if (idx1 === -1) {
            console.warn('Can\'t find \'select\' in MDX during calculation drillthrough mdx');
            return;
        }
        if (idx2 === -1) {
            console.warn('Can\'t find \'from\' in MDX during calculation drillthrough mdx');
            return;
        }
        // Check for max rows parameter in pivot
        let sRows = '';
        if (this.pivotData.listingRows) {
            const listingRows = parseInt(this.pivotData.listingRows, 10);
            if (listingRows) {
                sRows = ` MAXROWS ${listingRows} `;
            }
        }
        // Find custom listing ifexists
        const c = this.widget.controls.find(c => c.action === 'showListing');
        if (c) {
            const listing = c.targetPropertyDisplay;
            if (listing) {
                const r = 'DRILLTHROUGH ' + sRows + mdx.substring(0, idx1 + selTxt.length) + ' ' + mdx.substring(idx2, mdx.length) + ` %LISTING [${listing}]`;
                return r;
            }
        }

        return 'DRILLTHROUGH ' + sRows + mdx.substring(0, idx1 + selTxt.length) + ' ' + mdx.substring(idx2, mdx.length);
    }

    /**
     * Makes drill down or drill up if path is empty
     * @param {string} [path] Drill path. If empty then drill up is happens
     * @param {string} [name] Name
     * @param {string} [category] Category
     * @param {} [noDrillCallback]  that called if no dill exists
     * @returns {IPromise<T>}
     */
    doDrill(path?: string, name?: string, category?: string, noDrillCallback?: () => void) {
        return new Promise((res: any, rej) => {
            this.clearError();
            // Apply drill filter if clickfilter is exists
            this.doDrillFilter(path, this.drills);

            const old = this.drills.slice();
            if (path) {
                this.drills.push({path, name, category});
            } else {
                this.drills.pop();
            }
            const mdx = this.getMDX();
            this.drills = old;

            this.showLoading();

            const performNoDrillAction = () => {
                if (noDrillCallback) {
                    noDrillCallback();
                    return;
                }
                if (!this.canDoDrillthrough) {
                    return;
                }
                const ddMdx = this.getDrillthroughMdx(mdx);

                this.ds.execMDX(ddMdx)
                    // .error(this._onRequestError)
                    .then((data2: any) => {
                        if (!data2 || !data2.children || data2.children.length === 0) {
                            return;
                        }
                        this.widget.isDrillthrough = true;
                        this.widget.backButton = true;
                        this.widget.pivotData = data2;
                        this.displayAsPivot(ddMdx);
                    });
            };

            this.showLoading();
            this.ds.execMDX(mdx)
                .catch(() => {
                    performNoDrillAction();
                })
                .then((data) => {
                    if (!data) {
                        return;
                    }
                    if (this.chartConfig) {
                        this.chartConfig.loading = false;
                    }
                    if (this.isEmptyData(data) && path) {
                        performNoDrillAction();
                        return;
                    }
                    if (this.isEmptyData(data)) {
                        return;
                    }

                    // Drill can be done, store new level and pass received data
                    if (path) {
                        this.drills.push({path, name, category});
                    } else {
                        this.drills.pop();
                    }
                    this.widget.backButton = this.drills.length !== 0;
                    this.widget.title = this.getDrillTitle(this.drills[this.drills.length - 1]);
                    // this.wid
                    this.broadcastDependents(mdx);
                    this.retrieveData(data);
                    this.parent?.header?.cd.detectChanges();
                    // this.cd.detectChanges();
                })
                .finally(() => {
                    this.hideLoading();
                    res();
                });
        });
    }

    /**
     * Checks for automatic drill if there is only one item
     * @param data
     */
    checkForAutoDrill(data): boolean {
        if (data?.Cols[1]?.tuples?.length === 1) {
            this.oneItemDrillApplied = true;
            this.doDrill(data.Cols[1].tuples[0].path, data.Cols[1].tuples[0].caption)
                .then(() => {
                    this.widget.backButton = false;
                    this.parent?.header?.cd.detectChanges();
                });
            return true;
        }
        return false;
    }

    showLoading() {
        if (this.isSpinner) {
            return;
        }
        this.isSpinner = true;
        this.parent.cd.detectChanges();
        this.cd.detectChanges();
    }

    hideLoading() {
        if (!this.isSpinner) {
            return;
        }
        this.isSpinner = false;
        this.parent.cd.detectChanges();
        this.cd.detectChanges();
    }

    applyDrill(mdx: string) {
        let i;

        // TODO: check filter params
        const filterParam = this.route.snapshot.queryParamMap.get('filter');
        if (filterParam) {
            mdx = mdx + ' %FILTER ' + filterParam;
        }

        let drills = this.drills;
        if (drills.length === 0) {
            drills = this.drillFilterDrills;
        }
        if (drills.length === 0) {
            return mdx;
        }
        let customDrills = [];
        if (this.pivotData && this.pivotData.rowAxisOptions && this.pivotData.rowAxisOptions.drilldownSpec) {
            customDrills = this.pivotData.rowAxisOptions.drilldownSpec.split('^');
        }

        for (i = 0; i < drills.length; i++) {
            if (drills[i].path) {
                mdx += ' %FILTER ' + drills[i].path;
            }
        }


        const customDrill = customDrills[drills.length - 1];
        const path = customDrill || drills[drills.length - 1].path;

        // Remove all s
        // TODO: dont replace %Label
        const match = mdx.match(/ON 0,(.*)ON 1/);
        let order = '';
        if (match && match.length === 2) {
            const str = match[1];
            const orderMatch = str.match(/ORDER\((.*?)\,/);

            if (orderMatch && orderMatch[0]) {
                order = orderMatch[0];
            }
            if (order) {
                mdx = mdx.replace(order, 'ORDER(' + path + '.children,');
            } else {
                const isNonEmpty = str.indexOf('NON EMPTY') !== -1;
                mdx = mdx.replace(str, (isNonEmpty ? 'NON EMPTY ' : ' ') + path + ' ');
            }
        }

        if (((!customDrill && customDrills.length !== 0) || (customDrills.length === 0))
            // if on exis 1 there are more than one element then skip
            && (!mdx.match(/\{.*\} ON 1/))) {
            const idx = mdx.indexOf('.Members ON 1 FROM');
            if (idx === -1) {
                if (!order) {
                    mdx = mdx.replace(' ON 1 FROM', ' .children ON 1 FROM');
                }
            } else {
                const from = mdx.indexOf('[');
                const str = '.Members ON 1 FROM';
                const to = mdx.indexOf(str);
                mdx = mdx.substr(0, from) + path + '.children ON 1 FROM' + mdx.substr(to + str.length);
                // mdx = mdx.replace('.Members ON 1 FROM', '.' + path.split('.').pop() + '.children ON 1 FROM');
                // mdx = mdx.replace('.Members ON 1 FROM', '.&[' + path.split('&[').pop() + '.children ON 1 FROM');
            }
            return mdx;
        }

        if (this.drillFilter) {
            mdx = mdx + ' %FILTER ' + this.drillFilter;
        }

        return mdx;
    }

    /**
     * Changes current datasource
     * @param {string} pivot Pivot name
     */
    changeDataSource(pivot, item?) {
        if (item && item.control.target !== '') {
            const targets = item.control.target.split(',');
            for (let i = 0; i < targets.length; i++) {
                this.bs.broadcast('changeDataSource:' + targets[i], pivot);
            }
            return;
        }

        if (pivot) {
            this.customDataSource = pivot;
        } else {
            this.customDataSource = '';
        }
        this.requestPivotData();
    }

    onColSpecChanged(path) {
        this.customColSpec = path;
        this.requestData();
    }

    /**
     * Change current row spec
     * @param {string} path Path
     */
    changeRowSpec(path) {
        if (!path) {
            this.customRowSpec = '';
        } else {
            this.customRowSpec = path;
        }
        this.requestData();
    }

    /**
     * Change current col spec
     * @param {string} path Path
     */
    changeColumnSpec(path, item) {
        let colSpec = '';
        if (path) {
            colSpec = path.replace(/\\/g, '');
        }
        const target = item.control.target;
        this.bs.broadcast('setColSpec:' + target, colSpec);
    }


    /**
     * Event handler for datasource list intem change
     * @param item
     */
    onDataSourceChange(item) {
        let val;
        const sel = item.dsSelected;
        if (sel) {
            const idx = item.labels.indexOf(sel);
            if (idx !== -1) {
                val = item.values[idx];
            }
        }
        switch (item.action) {
            case 'chooseDataSource':
                this.changeDataSource(val, item);
                break;
            case 'chooseRowSpec':
                this.changeRowSpec(val);
                break;
            case 'chooseColumnSpec':
                this.changeColumnSpec(val, item);
                break;
        }
    }


    /**
     * Callback for $on(":refreshDependents"). Sends refresh broadcast to all dependent widgets
     */
    onRefreshDependents() {
        this.broadcastDependents();
    }

    /**
     * Updates linked mdx query. Used when widget is linked to another. Callback for $on(":setLinkedMDX")
     * @param {object} sc Scope
     * @param {string} mdx MDX to set
     */
    onSetLinkedMdx(sc, mdx) {
        // if (this.storedData) this.storedData = [];
        // Store in scope to have ability get it after wiget type is changed dynamically

        this.widget.linkedMdx = mdx;
        this.linkedMdx = mdx;
        this.requestData();
    }

    /**
     * Returns linked widget
     * @returns {object} Linked widget
     */
    isLinked() {
        if (!this.widget) {
            return false;
        }
        return this.widget.Link;
    }

    /**
     * Check if widget has dependents
     * @returns {boolean} true if widget has dependents
     */
    hasDependents() {
        if (!this.widget) {
            return 0;
        }
        if (!this.widget.dependents) {
            return 0;
        }
        return this.widget.dependents.length !== 0;
    }


    requestPivotData() {
        const ds = this.customDataSource || this.widget.dataSource;
        // Check if this KPI
        if (this.widget.kpitype) {
            if (ds) {
                this.ds.getKPIData(ds).then(data => this._retriveKPI(data));
            }
        } else {
            if (ds) {
                this.ds.getPivotData(ds)
                    .then(data => this._retriveDataSource(data))
                    .catch(e => {
                        this.showError(e.error?.Error || e.message);
                    });
            }
        }
    }

    convertKPIToMDXData(d) {
        const orig = d;
        d = d.Result;
        const res = {Info: {cubeName: orig.Info.KpiName}, Cols: [], Data: []};
        let i, j;
        const cats = [];
        for (i = 0; i < d.Properties.length; i++) {
            cats.push({caption: d.Properties[i].caption || d.Properties[i].name, dimension: d.Properties[i].name});
        }
        res.Cols.push({tuples: cats});

        const ser = [];
        for (i = 0; i < d.Series.length; i++) {
            for (j = 0; j < d.Properties.length; j++) {
                res.Data.push(d.Series[i][d.Properties[j].name]);
            }
            const name = d.Series[i]['%series'] || d.Series[i].seriesName;
            ser.push({
                title: name,
                caption: name
            });
        }
        res.Cols.push({tuples: ser});
        return res;
    }

    retrieveData(data: any) {
        this.hideLoading();
        if (data.Error) {
            this.showError(data.Error);
            return;
        }
    }

    /**
     * Callback for retrieving KPI data
     * @param {object} data KPI data
     */
    _retriveKPI(data) {
        if (!this) {
            return;
        }
        this._kpiData = data;
        // this._desc.kpiName = data.Info;
        if (this.lpt) {
            this.lpt.dataController.setData(this.lpt.dataSource._convert(this.convertKPIToMDXData(data)));
            // this.lpt.refresh();
            return;
        }
        this.retrieveData(this.convertKPIToMDXData(data));
        // console.log(data);
    }

    _retriveDataSource(data) {
        if (!this) {
            return;
        }
        this.pivotData = data;
        if (this.customDataSource) {
            this.widget.mdx = data.mdx;
            this.requestData();
        }
    }

    public onResize() {
    }

    /**
     * Request widget data
     */
    public requestData() {
        if (!this.widget.isSupported) {
            return;
        }

        // Remove auto drill for one item
        if (this.oneItemDrillApplied) {
            this.drills = [];
            this.oneItemDrillApplied = false;

            this.widget.backButton = false;
            this.widget.title = this.getDrillTitle();
            this.parent?.header?.cd.detectChanges();
        }

        // this.widget.title = this.baseTitle;
        // this.drillLevel = 0;
        // this.drills = [];
        if (this.widget.kpitype) {
            const ds = this.customDataSource || this.widget.dataSource;
            if (ds) {
                this.ds.getKPIData(ds).then(data => this._retriveKPI(data));
            }
            return;
        }
        const mdx = this.getMDX();
        if (!mdx) {
            return;
        }
        this.clearError();
        setTimeout(() => this.broadcastDependents(), 0);
        // this.firstRun = false;

        // Check for variables
        if (mdx.indexOf('$') !== -1 && !this.pivotVariables) {
            this.ds.getPivotVariables(this.widget.cube).then((d) => {
                this.pivotVariables = d;
            })
                .catch(e => {
                   this.showError(e.message);
                });
        }

        this.showLoading();
        this.ds.execMDX(mdx).catch((e) => this._onRequestError(e)).then((data) => {
            this._currentData = data;
            this.retrieveData(data);
        })
            .finally(() => {
                this.hideLoading();
            });
    }

    /**
     * Update mdx on dependent widgets
     * @param {string|undefined} customMdx MDX that will be set on all dependent widgets
     */
    broadcastDependents(customMdx?: string) {
        if (this.hasDependents()) {
            for (let i = 0; i < this.widget.dependents.length; i++) {
                this.bs.broadcast('setLinkedMDX:' + this.widget.dependents[i], customMdx || this.getMDX());
            }
        }
    }

    /**
     * Process request error for widget
     */
    _onRequestError(e, status?) {
        if (this.chartConfig) {
            this.chartConfig.loading = false;
        }
        let msg = this.i18n.get('errWidgetRequest');
        switch (status) {
            case 401: case 403:
                msg = this.i18n.get('errUnauth');
                break;
            case 404:
                msg = this.i18n.get('errNotFound');
                break;
        }
        this.showError(msg);
    }

    clearError() {
        if (this.parent) {
            this.parent.clearError();
        }

    }

    showError(msg) {
        if (this.parent) {
            this.parent.showError(msg);
        }
    }

    checkColSpec(mdx) {
        if (this.customColSpec) {
            let selText = 'SELECT NON EMPTY';
            let lastSel = mdx.lastIndexOf(selText);
            if (lastSel === -1) {
                selText = 'SELECT';
                lastSel = mdx.lastIndexOf(selText);
            }
            if (lastSel === -1) {
                return mdx;
            }
            const lastOn = mdx.lastIndexOf('ON 0');
            if (lastOn === -1) {
                return mdx;
            }
            if (lastOn < lastSel) {
                return mdx;
            }

            mdx = mdx.replace(mdx.substring(lastSel, lastOn), selText + ' ' + this.customColSpec + ' ');
            return mdx;
        }
        return mdx;
    }

    replaceMDXVariables(mdx) {
        if (!this.vs.items.length || mdx.indexOf('$') === -1) {
            return mdx;
        }

        for (let i = 0; i < this.vs.items.length; i++) {
            const v = this.vs.items[i];
            if (v.value === '') {
                continue;
            }
            const p = v.targetProperty.toLowerCase();
            // v.value = 2014;
            let idx;
            while ((idx = mdx.toLowerCase().indexOf(p)) !== -1) {
                mdx = mdx.substr(0, idx) + v.value + mdx.substr(idx + p.length, mdx.length);
            }
        }
        return mdx;
    }

    /**
     * Adds to mdx filters from query. Used in urls formed from "NewWindow" action*
     * @param {string} mdx MDX to change
     * @returns {string} MDX with filters
     */
    addQueryFilters(mdx: string) {
        const querySettings = this.route.snapshot.queryParamMap.get('SETTINGS');
        if (!querySettings) {
            return mdx;
        }
        const params = querySettings.split(';');
        let widgetName = null;
        let filters = '';
        for (let i = 0; i < params.length; i++) {
            const parts = params[i].split(':');
            if (parts[0].toLowerCase() === 'target') {
                widgetName = parts[1];
                continue;
            }
            if (parts[0].toLowerCase() === 'filter') {
                filters = parts.slice(1).join(':');
            }
        }
        if (widgetName && (this.widget.name === widgetName || widgetName === '*' || widgetName.split(',').indexOf(this.widget.name) !== -1) && filters) {
            const f = filters.split('~');
            for (let i = 0; i < f.length; i++) {
                const s = f[i];
                const isExclude = s.indexOf('%NOT') !== -1;
                if (s.indexOf('{') !== -1) {
                    // Many values
                    const path = s.substring(0, s.indexOf('{')).replace('%NOT ', '');
                    const values = s.match(/\{([^)]+)\}/)[1].split(',');
                    mdx += ' %FILTER %OR({';
                    mdx += values.map(v => path + v + (isExclude ? '.%NOT' : '')).join(',');
                    mdx += '})';
                } else {
                    // One value
                    mdx += ' %FILTER ' + s;
                }
            }
        }

        return mdx;
    }

    /**
     * Return widget MDX depending on active filters
     */
    getMDX(): string {
        let filterActive = false;
        let i;
        let flt;
        let path;
        let str;

        // If widget is linked, use linkedMDX
        if (this.isLinked()) {
            str = this.replaceMDXVariables(this.linkedMdx || this.widget.linkedMdx || '');
            str = this.checkColSpec(str);
            return this.applyDrill(str);
        }

        // Check for active filters on widget
        const filters = this.fs.getWidgetFilters(this.widget.name);

        // Add filter for drillFilter feature
        if (this.drillFilter) {
            const idx = this.drillFilter.indexOf('&');
            if (idx !== -1) {
                filters.push({
                    targetProperty: this.drillFilter.substring(0, idx - 1),
                    value: '&' + this.drillFilter.substring(idx + 1, this.drillFilter.length)
                });
            }
        }
        for (i = 0; i < filters.length; i++) {
            flt = filters[i];
            if (flt.value !== '' || flt.isInterval) {
                filterActive = true;
                break;
            }
        }
        let mdx = this.replaceMDXVariables(this.widget.mdx);
        if (!mdx) {
            console.warn('Widget without MDX');
        }

        if (this.customRowSpec) {
            const match = mdx.match(/ON 0,(.*)ON 1/);
            if (match.length === 2) {
                str = match[1];
                const isNonEmpty = str.indexOf('NON EMPTY') !== -1;
                mdx = mdx.replace(str, (isNonEmpty ? 'NON EMPTY ' : ' ') + this.customRowSpec + ' ');
            }
        }

        // Apply col spec
        mdx = this.checkColSpec(mdx);
        // Add filters from query params if exists
        mdx = this.addQueryFilters(mdx);

        // Don't use filters in widgets placed on tiles
        if (!filterActive || this.widget.tile) {
            return this.applyDrill(mdx);
        }

        // Find all interval filters
        const where = '';
        for (i = 0; i < filters.length; i++) {
            flt = filters[i];
            if (!flt.isInterval) {
                continue;
            }
            path = flt.targetProperty;
            const v1 = flt.values[flt.fromIdx].path;
            const v2 = flt.values[flt.toIdx].path;
            mdx += ' %FILTER %OR(' + path + '.' + v1 + ':' + v2 + ')';
        }

        // Find other filters
        for (i = 0; i < filters.length; i++) {
            flt = filters[i];
            if (flt.value !== '' && !flt.isInterval) {
                let bracket = '{';
                if (flt.isExclude) {
                    bracket = '(';
                }
                const values = flt.value.toString().split('|');
                path = flt.targetProperty;
                if (flt.isExclude) {
                    mdx += ' %FILTER ' + bracket;
                } else {
                    mdx += ' %FILTER %OR(' + bracket;
                }
                for (let j = 0; j < values.length; j++) {
                    if (flt.isExclude) {
                        mdx += path + '.' + values[j] + '.%NOT,';
                    } else {
                        mdx += path + '.' + values[j] + ',';
                    }
                }
                bracket = '}';
                if (flt.isExclude) {
                    bracket = ')';
                }
                mdx = mdx.substr(0, mdx.length - 1) + ' ' + bracket;
                if (!flt.isExclude) {
                    mdx += ')';
                }
            }
        }

        // Inserting "where" condition in appropriate part of mdx request
        if (where) {
            const m = mdx.toUpperCase();
            let pos = m.indexOf('WHERE');
            if (pos === -1) {
                // Where not exists, it should be before %FILTER
                pos = m.indexOf('%FILTER');
                if (pos === -1) {
                    mdx += ' WHERE ' + where;
                } else {
                    mdx = mdx.slice(0, pos) + ' WHERE ' + where + ' ' + mdx.slice(pos);
                }
            } else {
                // Insert in exists condition
                mdx = mdx.slice(0, pos) + ' ' + where + ' AND ' + mdx.slice(pos);
            }
        }

        return this.applyDrill(mdx);
    }


    /**
     * Called before widget was destroyed
     */
    destroy() {
        this._currentData = null;
        // this.subOnHeaderButton.unsubscribe();
        // Removing interval updates of widget
        if (this.liveUpdateInterval) {
            clearInterval(this.liveUpdateInterval);
        }
        this.liveUpdateInterval = null;
    }

    public onHeaderButton(bt: IButtonToggle) {
        if (bt.name === 'expand') {
            this.widget.isExpanded = bt.state;
            setTimeout(() => {
                this.onResize();
            }, 0);
        }
    }

    /**
     * Displays chart as pivot widget
     */
    displayAsPivot(customMdx?: string) {
        if (this.widget.type === 'pivot') {
            this.widget.isDrillthrough = null;
            this.restoreWidgetType();
        } else {
            this.widget.pivotMdx = customMdx || this.getMDX();
            this.changeWidgetType('pivot');
        }
    }

    formatNumber(v, format) {
        let res;
        if (format) {
            res = numeral(v).format(format.replace(/;/g, ''));
        } else {
            res = v.toString();
        }
        if (this.dataInfo) {
            res = res.replace(/,/g, this.dataInfo.numericGroupSeparator)
                .replace(/\./g, this.dataInfo.decimalSeparator);
        }
        return res;
    }
}

