export type WidgetEventType = 'drill' | 'filter' | 'datasource';

export interface IWidgetDisplayInfo {
    colWidth: number;
    leftRow: number;
    rowHeight: number;
    topCol: number;
    width?: number;
    height?: number;
}

export interface IWidgetDrill {
    name: string;
    path: string;
}

export interface IWidgetEvent {
    type: WidgetEventType;
    index: string;
    widget: IWidgetDesc;
    drills?: IWidgetDrill[];
    filters?: string;
    datasource?: string;
}

export interface IDSW {
    onFilter: (e: IWidgetEvent) => void;
    onDrill: (e: IWidgetEvent) => void;
    onDataSource: (e: IWidgetEvent) => void;
}

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
    columns?: any[];
    legendLabels?: string;
    markerShapes?: string;
}

export type IAddonType = 'custom' | 'chart' | 'map';

export interface IAddonInfo {
    version?: number;
    type?: IAddonType;
    chart?: string;
    overrideBaseType?: string;
}

export type WidgetColumnDisplayType = 'trendLine' | 'plotBox' | 'itemNo' | 'value' | 'label' | '';
export type WidgetColumnShowType = 'value' | 'target%' | 'sum%';
export type WidgetColumnSummaryType = 'sum' | '';

export interface IWidgetDataProperties {
    // align: string;
    // baseValue: string
    name: string;
    dataValue: string | number;
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
    override: any;
    /*style: string;
    subtype: string;
    summary: string;
    summaryValue: string;
    targetValue: string;
    valueColumn: number;
    width: string;*/
}

// Widget info object
export interface IWidgetDesc {
    // Gridster parameters
    x: number;
    y: number;
    cols: number;
    rows: number;
    dragEnabled?: boolean;

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
    dataLink?: string;
    kpitype: string;
    mdx: string;
    properties: any;
    seriesTypes: string[];
    kpiclass: string;
    displayInfo?: IWidgetDisplayInfo;

    isExpanded: boolean;

    // Drill
    drills: any[];
    isDrillthrough: boolean;

    // Actions
    acItems: any[];

    // Pivot
    pvItems: any[];
    pivotMdx?: string;
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
    shared?: boolean;

    // Additional
    format?: string;

    // Gridster
    //item?: GridsterItem;

    // editor
    referenceTo?: string;
    edKey: string; // needed to recreate widget by generating new key, so angular will create new using trackBy
    oldWidget?: IWidgetDesc;
}

export interface IKPIDataInfo {
    Error: string;
    KpiName: string;
}

export interface IKPIDataProperty {
    caption: string;
    columnNo: number;
    name: string;
}

export interface IKPIDataSeries {
    [key: string]: number;
}

export interface IKPIDataResult {
    Properties: IKPIDataProperty[];
    Series: IKPIDataSeries[];
}

export interface IKPIData {
    Info: IKPIDataInfo;
    Result: IKPIDataResult;
}

export interface IWidgetModel {
  error?: string;
  filters?: any;
}
