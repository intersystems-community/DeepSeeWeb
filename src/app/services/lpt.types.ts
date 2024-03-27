import {IMDXData} from './dsw.types';

export interface ILPTConfig {
  initialData?: IMDXData;
}

export interface ILPTControls {
  back: () => void;
}

export interface ILPTView {
  displayMessage: (msg: string) => void;
}

export interface ILPTDataSource {
  FILTERS: string;
  _convert: (data: IMDXData) => ILPTData;
}

export interface ILPTDataRow {

}

export interface ILPTColumnProp {

}

export interface ILPTData {
  columnProps: ILPTColumnProp[];
  dataArray: number[];
  dimensions: string[];
}

export interface ILPTDataController {
  setData: (data: ILPTData) => void;
  getData: () => ILPTData;
}

export interface ILPDDataSourceStack {
  BASIC_MDX: string;
}

export interface ILightPivotTable {
  DRILL_LEVEL: number;
  CONFIG: ILPTConfig;
  CONTROLS: ILPTControls;
  pivotView: ILPTView;
  dataSource: ILPTDataSource;
  dataController: ILPTDataController;
  updateSizes: () => void;
  changeBasicMDX: (newMdx: string) => void;
  isListing: () => boolean;
  getActualMDX: () => string;
  getSelectedRows: () => number[];
  _dataSourcesStack: ILPDDataSourceStack[];
}
