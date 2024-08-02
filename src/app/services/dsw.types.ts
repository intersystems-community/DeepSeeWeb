import {Type} from "@angular/core";

export const CHARTS_FONT = 'Oxygen';
export const DSW_EMPTY_PORTLET = 'mdx2json.emptyportlet';

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

export interface IWidgetControl {
  label?: string;
  action: string;
  value: number | string;
  type?: ControlType;
  location?: ControlLocation;
  timeout: string;
  target: string;
  targetProperty: string;
  targetPropertyDisplay: string;
  displayList: string;
  valueList: string;
}

// Deprecated, now DataProperties is used instead
export interface IWidgetProperties {
  highRangeColor: string;
  lowRangeColor: string;
  polygonTitleProperty: string;
  longitudeProperty: string;
  latitudeProperty: string;
  colorProperty: string;
  zoom: string;
  longitude: string;
  latitude: string;
  format: string;
  chartToggle: string;

  Data?: any;
}

/*
export interface IWidgetAction {
  label: string;
  action: string;
  targetProperty: string;
}
*/

export interface IPivotItem {
  label: string;
  value: string;
}

export type DataSourceFieldType = 'input' | 'select';

export interface IDataSourceItem {
  label: string;
  field: DataSourceFieldType;
  action: string;
  _value?: string | number;
  type?: string;

  // For UI
  labels?: string[];
  values?: string[];
  dsSelected?: number | string;
  control?: IWidgetControl;
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
  controls: IWidgetControl[];
  linkedMdx: string;
  dependents: string[];
  dataLink?: string;
  kpitype: string;
  mdx: string;
  properties: IWidgetProperties;
  seriesTypes: string[];
  kpiclass: string;
  displayInfo?: IWidgetDisplayInfo;
  isExpanded: boolean;

  // Drill
  drills: IDrill[];
  isDrillthrough: boolean;

  // Actions
  acItems: IWidgetControl[];

  // Pivot
  pvItems: IPivotItem[];
  pivotMdx?: string;
  pivotData?: IPivotData;
  displayAsPivot: (mdx: string) => void;

  // For data source chooser
  dsItems: IDataSourceItem[];
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

export const ADDON_PREFIX = 'DSW.Addons.';

export interface IHeaderButton {
  id: string;
  text: string;
  icon: string;
  tooltip?: string;
  defValue?: boolean;
}

export interface IWidgetType {
  class: Type<any>;
  type?: string;
  label?: string;
  chart?: string;
  allowShowAsPivot?: boolean;
  disableLegend?: boolean;
  headerButtons?: IHeaderButton[];
}

export interface IDataInfo {
  colCount: string;
  colKey: string;
  cubeClass: string;
  cubeKey: string;
  cubeName: string;
  decimalSeparator: string;
  numericGroupSeparator: string;
  numericGroupSize: number;
  percentDone: number;
  queryKey: string;
  rowCount: number;
  rowKey: string;
}

export interface IDrill {
  path: string;
  name: string;
  category?: string;
}

export interface IChartColorsConfig {
  hcColors: string[];
  hcTextColor: string;
  hcLineColor: string;
  hcOpacity?: number;
  hcBorderColor: string;
  hcBackground: string;
}

export interface IMDXTuple {
  path: string;
  caption: string;
  title: string;
  format: string;
  dimension: string;
  children?: IMDXTuple[];

  // For UI
  originalIndex?: number;
}

export interface IMDXColumn {
  tuples: IMDXTuple[];
}

export interface IMDXData {
  Cols: IMDXColumn[];
  Data: (number | string)[];
  Error: string;
  Info?: IDataInfo;
}

export interface IPivotRowAxisOptions {
  drilldownSpec: string;
}

export interface IPivotData {
  mdx: string;
  listingRows: string;
  rowAxisOptions: IPivotRowAxisOptions;
}

export interface IPivotVariables {

}

export interface IWidgetSettings {
  _filters?: IFilter[];
  series?: boolean[];
  themeColors?: { [theme: string]: IChartColorsConfig | undefined };
}

export interface ITileSettings {

}

export interface INamespaceSettings {
  tiles?: ITileSettings[];
  widgets?: { [widget: string]: IWidgetSettings | undefined };
}

export interface IColorSettings {

}

export interface IAppSettings {
  theme?: string;
  themeColors?: { [theme: string]: IChartColorsConfig | undefined };
  language?: string;
  isSaveFilters?: boolean;
  isRelatedFilters?: boolean;
}

export interface IDSWSettings {
  ns?: INamespaceSettings;
  app?: IAppSettings;
}

export interface IFilterValue {
  path: string;
  name?: string;
  value?: string | number;
  default?: boolean;
  exclude?: boolean;

  // For UI
  checked?: boolean;
  _saved?: boolean;
}

export type ControlLocation = 'dashboard' | 'click';
export type ControlType = 'hidden';

export interface IFilter extends IWidgetControl {
  isExclude: boolean;
  isInterval: boolean;
  fromIdx: number;
  toIdx: number;
  valueDisplay: string;
  values: IFilterValue[];
  info?: string;
  source?: string;
  controlClass?: string;
  additionalParams?: string[];
  targetPropertyDataType: string;
  defaultExclude: boolean;

  // for UI
  sourceArray?: string[];
  targetArray?: string[];
  isDate?: boolean;
}

export interface IRelatedFiltersRequestData {
  Filter: string;
  Value: string;
}

export interface IChartSeriesData {
  data: IChartSeriesValue[];
  name?: string;
  format?: string;
  path?: string;
  dimension?: string;

  // From highcharts
  borderWidth?: number;
  caption?: string;
  layoutAlgorithm?: string;
  dataLabels?: any;
  size?: string;
  innerSize?: string;
  showInLegend?: boolean;
  yAxis?: number;
  type?: string;
  visible?: boolean;
  marker?: any;
  color?: string;

  // for UI
  format1?: string;
  format2?: string;
  format3?: string;
  caption1?: string;
  caption2?: string;
}

export interface IChartSeriesValue {
  y: number;
  path: string;
  name: string;
  drilldown?: boolean;
  cube?: string;
  title?: string;
}
