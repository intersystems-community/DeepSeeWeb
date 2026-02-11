import {Component, Input} from '@angular/core';
import {BaseWidget} from '../base-widget.class';
import {CURRENT_NAMESPACE} from '../../../services/namespace.service';
import {IFilterValue, IWidgetDesc} from '../../../services/dsw.types';

declare const LightPivotTable: any;

@Component({
  selector: 'dsw-pivot',
  templateUrl: './pivot.component.html',
  styleUrls: ['./pivot.component.scss'],
  standalone: true
})
export class WPivotComponent extends BaseWidget {
  @Input() widget: IWidgetDesc = {} as IWidgetDesc;
  isSpinner = false;
  private _oldMdx = '';

  constructor() {
    super();
  }


  ngAfterViewInit() {
    this.createPivotTable();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  createPivotTable() {
    const _this = this;
    const setup = {
      initialData: this.widget.pivotData,
      container: this.el.nativeElement,
      pivotProperties: {},
      enableListingSelect: false,
      enableSearch: false,
      dataSource: {
        pivot: this.widget.dataSource,
        MDX2JSONSource: this.ds.url.substring(0, this.ds.url.length - 1),
        basicMDX: this.widget.pivotMdx || this.getMDX(),
        namespace: CURRENT_NAMESPACE,
        sendCookies: true
      },
      triggers: {
        drillDown: (p) => this.onDrillDown(p),
        // Prevent drilldown for KPI
        rowClick: (idx, rowData, cellData) => {
          if (_this.drillFilterWidgets?.length) {
            // Prevent drill if widget has click filter (#261)
            _this.doDrillFilter(cellData.source.path, _this.drills);
            _this.parent?.header?.cd.detectChanges();
            return false;
          }

          if (this.widget.kpitype) {
            return false;
          }
          return true;
        },
        back: (p) => this.onDrillDown(p),
        cellDrillThrough: (...args) => this.onDrillThrough(...args),
        contextMenu: (ctxData: { canDrill?: boolean; canDrillthrough?: boolean; drillPath?: string; drillTitle?: string; copyValue?: string }, event: MouseEvent) => {
          this.bs.broadcast('contextmenu', {
            widget: this.widget,
            event,
            ctxData: {
              canDrill: ctxData.canDrill,
              canDrillthrough: ctxData.canDrillthrough,
              drillPath: ctxData.drillPath,
              drillTitle: ctxData.drillTitle,
              copyValue: ctxData.copyValue
            }
          });
        },
        responseHandler: (info) => {
          if (info.status !== 200) {
            this.showError(info.xhr.responseText);
          }
        }
      },
      loadingMessageHTML: '<img src="assets/img/spinner.svg">',
      columnResizeAnimation: true,
      locale: this.i18n.current,
      hideButtons: true,
      formatNumbers: '#,###.##',
      controls: this.widget.controls,
      drillDownTooltip: !this.widget.kpitype && !this.drillFilterWidgets?.length
        ? this.i18n.get('clickToDrillDown') : '',
      drillThroughTooltip: this.canDoDrillthrough ? this.i18n.get('clickToDrillThrough') : '',
      wrapCellContent: true,
      drillThroughAvailable: this.canDoDrillthrough,
      showContextMenuButton: true,
      autoFitLeftHeader: true
    };
    delete this.widget.pivotMdx;

    this.lpt = new LightPivotTable(setup);
    // Remove spinner for editing widget because it created empty
    if (this.widget.edKey) {
      this.lpt?.pivotView.displayMessage('');
    }

    // Load initial data
    if (this.lpt && this.widget.initialData) {
      const data = this.widget.initialData;
      setTimeout(() => {
        this.lpt?.dataController.setData(this.lpt.dataSource._convert(data));
      })

    }
  }

  doDrillUp() {
    if (this.widget.isDrillthrough && this.restoreWidgetType) {
      this.widget.isDrillthrough = false;
      this.restoreWidgetType();
      if (this.widget.kpitype) {
        this.requestData();
      }
    } else {
      this.lpt?.CONTROLS.back();
    }

    this.widget.backButton = this.lpt?.DRILL_LEVEL !== 0;
    this.parent.cd.detectChanges();
    this.parent.header?.cd.detectChanges();
  }

  onDrillThrough(...args) {
    if (!this.canDoDrillthrough) {
      return false;
    }
    if (this.widget.kpitype) {
      const {cellData, x, y} = args[0];
      const {info, dimensions} = args[1];
      if (!dimensions[0]) {
        return;
      }
      const pathX = dimensions[0][x - info.leftHeaderColumnsNumber]?.dimension || '';
      const pathY = dimensions[0][0]?.dimension || '';
      const val = dimensions[1][y - info.topHeaderRowsNumber]?.title || '';
      if (!pathX || !pathY) {
        return;
      }
      const flt: IFilterValue[] = [
        {name: pathX, value: cellData.value, path: ''},
        {name: pathY, value: val, path: ''}
      ];

      this._requestKPIData(flt)?.then(() => {
        this.widget.isDrillthrough = true;
        this.widget.backButton = true;
        this.parent.cd.detectChanges();
        this.parent.header?.cd.detectChanges();
      });
      return false;
    }
    this._oldMdx = this.lpt?.getActualMDX() || '';
    this.widget.backButton = true;
    this.parent.cd.detectChanges();
    this.parent.header?.cd.detectChanges();
    return true;
  }

  /**
   * Called on drildown event. Broadcasts all dependent widgets to update their mdx based on pivot drill mdx
   * @param {object} p Pivot
   */
  onDrillDown(p) {
    if (p.path) {
      this.doDrillFilter(p.path, this.drills);
      this.drills.push({path: p.path, name: '', category: ''});
      this.widget.backButton = true;
    } else {
      this.drills.pop();
      this.doDrillFilter(p.path, this.drills);
    }
    this.parent.cd.detectChanges();
    this.parent.header?.cd.detectChanges();
    this.broadcastDependents(p.mdx);
  }

  /**
   * Requests pivot data
   */
  requestData() {
    const ds = this.customDataSource || this.widget.dataSource;
    if (this.widget.kpitype) {
      this._requestKPIData();
      return;
    }

    if (this.lpt) {
      let newMdx = this.getMDX();
      if (this.lpt.isListing()) {
        delete this.lpt.CONFIG.initialData;
        if (newMdx.toLowerCase().substr(0, 12) !== 'drillthrough') {
          newMdx = this.getDrillthroughMdx(newMdx) || '';
        }
      }
      if (newMdx === '') {
        return;
      }
      if (this.drillFilter) {
        newMdx = newMdx + ' %FILTER ' + this.drillFilter;
      }
      this.broadcastDependents();
      this.clearError();
      this.lpt.changeBasicMDX(newMdx);
      //this.parent.cd.detectChanges();
    }
  }

  /**
   * Resize callback
   */
  onResize() {
    if (this.lpt) {
      setTimeout(() => this.lpt?.updateSizes(), 100);
    }
  }

  /**
   * Print pivot data (incomplete, don't use this )
   */
  print() {
    // if (!this.lpt) {
    //     return;
    // }
    // const p = this.lpt.CONFIG.container;
    // const h = $(p).find('.lpt-topHeader > table');
    // const l = $(p).find('.lpt-leftHeader > table');
    // const t = $(p).find('.lpt-tableBlock > table');
    // if (!(h.length && l.length && t.length)) {
    //     return;
    // }
    // const table = {body: []};
    //
    // const trs = $(h[0]).find('tr');
    // const colCount = $(l[0]).find('tr:eq(0) th').length;
    // // create first cell
    // const row = [];
    // let cell = {text: $(p).find('.lpt-headerValue').text(), rowSpan: trs.length, colSpan: colCount};
    // row.push(cell);
    // for (let r = 0; r < trs.length; r++) {
    //     const tds = $(trs[r]).find('th');
    //     for (let c = 0; c < tds.length; c++) {
    //         const $c = $(tds[c]);
    //         const rowSpan = $c.attr('rowspan') || 1;
    //         const colSpan = $c.attr('colspan') || 1;
    //         cell = {text: $c.text(), rowSpan: rowSpan, colSpan: colSpan};
    //         row.push(cell);
    //     }
    //     table.body.push(row);
    //     row = [];
    // }
    //
    // const ct = [{table: table}];
    // pdfMake.createPdf({
    //     content: ct
    // }).open();
  }
}
