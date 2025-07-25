import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {BaseWidget} from '../../base-widget.class';
import {FilterService} from '../../../../services/filter.service';
import {StorageService} from '../../../../services/storage.service';
import {VariablesService} from '../../../../services/variables.service';
import {I18nService} from '../../../../services/i18n.service';
import {WidgetTypeService} from '../../../../services/widget-type.service';
import {IButtonToggle} from '../../../../services/widget.service';
import {WidgetHeaderComponent} from '../widget-header/widget-header.component';
import {BroadcastService} from '../../../../services/broadcast.service';
import {Subscription} from 'rxjs';
import {ModalService} from '../../../../services/modal.service';
import {ActivatedRoute} from '@angular/router';
import {ShareDashboardComponent} from '../../../ui/share-dashboard/share-dashboard/share-dashboard.component';
import {WidgetFilterComponent} from '../widget-filter/widget-filter.component';
import {IWidgetControl, IWidgetDesc, IWidgetModel, IWidgetType} from '../../../../services/dsw.types';
import {NgComponentOutlet, NgOptimizedImage} from '@angular/common';
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'dsw-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  standalone: true,
  imports: [WidgetHeaderComponent, WidgetFilterComponent, NgComponentOutlet, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger(
      'fade-in-out', [
        transition(':enter', [
          style({opacity: 0}),
          animate('100ms', style({opacity: 1}))
        ]),
        transition(':leave', [
          style({opacity: 1}),
          animate('100ms', style({opacity: 0}))
        ])
      ]
    )
  ]
})
export class WidgetComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(NgComponentOutlet) ngComponentOutlet?: NgComponentOutlet;
  @ViewChild('header', {static: true}) header!: WidgetHeaderComponent;
  @ViewChild('filters', {static: true}) filters!: WidgetFilterComponent;
  @Input() widget: IWidgetDesc = {} as IWidgetDesc;
  widgetInputs?: Record<string, unknown>;
  model: IWidgetModel = {
    error: ''
  };
  widgetType?: IWidgetType;
  component?: BaseWidget;
  hasDatasourceChooser = false;
  hasActions = false;
  isHeader = true;
  private subFilter?: Subscription;
  private subUpdateFilterText?: Subscription;
  private subFilterAll?: Subscription;
  private subRefresh?: Subscription;
  private subCopyMdx?: Subscription;
  private subShare?: Subscription;
  private subChangeType?: Subscription;

  constructor(private fs: FilterService,
              private ss: StorageService,
              private vs: VariablesService,
              private i18n: I18nService,
              private wts: WidgetTypeService,
              private bs: BroadcastService,
              private ms: ModalService,
              public cd: ChangeDetectorRef,
              private route: ActivatedRoute) {
    this.isHeader = this.route.snapshot.queryParamMap.get('noheader') !== '1';
  }

  ngOnInit() {
    this.widgetInputs = {widget: this.widget, model: this.model, parent: this};
    this.updateComponent();
    this.initFilters();
    this.setupPivotVariables();
    this.checkToolbarVisibility();
    this.subscribeFilters();
    this.subscribeActions();
  }

  ngAfterViewInit() {
    // @ts-ignore
    this.component = this.ngComponentOutlet?._componentRef?.instance;
    this.initDataSourceFromParams();
    this.initDrillsForSharedWidget();
  }

  onHeaderButton(bt: IButtonToggle) {
    if (bt.name === 'displayAsPivot') {
      this.component?.displayAsPivot();
      return;
    }
    this.component?.onHeaderButton(bt);
    this.header?.cd.detectChanges();
  }

  /**
   * Initializes pivot variables
   */
  setupPivotVariables() {
    this.widget.pvItems = [];
    const isEmptyWidget = this.widget.type === 'mdx2json.emptyportlet';

    let items: any[] = [];
    if (!this.vs.isExists()) {
      return;
    }

    items = this.vs.items.filter((c) => {
      return isEmptyWidget ? (c.location === 'dashboard') : (
        (c.location !== 'dashboard') &&
        (c.location === '*' || c.location === this.widget.name)
      );
    });

    this.widget.pvItems = items;
    this.showToolbar();
  }

  showLoading() {
    this.widget.isLoading = true;
  }

  hideLoading() {
    this.widget.isLoading = false;
  }

  ngOnDestroy() {
    this.subCopyMdx?.unsubscribe();
    this.subRefresh?.unsubscribe();
    this.subFilter?.unsubscribe();
    this.subUpdateFilterText?.unsubscribe();
    this.subFilterAll?.unsubscribe();
    this.subShare?.unsubscribe();
    this.subChangeType?.unsubscribe();
  }

  /**
   * Clears error message on widget holder
   */
  clearError() {
    this.model.error = '';
  }

  /**
   * Display error message on widget holder
   */
  showError(txt: string) {
    this.model.error = txt;
  }

  /**
   * Update displayed text on filter input controls, depending on active filters
   */
  updateFiltersText() {
    // For empty widget try to get initial filter values before
    if (this.widget.type === 'mdx2json.emptyportlet') {
      for (let i = 0; i < this.model.filters.length; i++) {
        const flt = this.getFilter(i);
        if (!flt) {
          continue;
        }
        if (!flt.valueDisplay && flt.value) {
          flt.valueDisplay = flt.value.toString().replace('&[', '').replace(']', '');
        }
      }
    }

    for (let i = 0; i < this.model.filters.length; i++) {
      const flt = this.getFilter(i);
      if (!flt) {
        continue;
      }
      if (flt.isDate) {
        this.model.filters[i].text = flt.valueDisplay;
        continue;
      }
      if (flt.isInterval) {
        this.model.filters[i].text = flt.values[flt.fromIdx].name + ':' + flt.values[flt.toIdx].name;
        continue;
      }
      // ((flt.isExclude === true && flt.valueDisplay) ? (this.i18n.get('not') + ' ') : '')\
      if (this.model.filters) {
        this.model.filters[i].text = flt?.valueDisplay || '';
      }
    }
    this.cd.detectChanges();
  }

  /**
   * Get widget filter
   * @param {number} idx Index of filter to get
   * @returns {object} Widget filter
   */
  getFilter(idx: any) {
    return this.fs.getFilter((this.model.filters as any)?.[idx].idx);
  }

  /**
   * Changes widget type. Callback for $on("setType")
   * @param {object} sc Scope
   * @param {string} t Type
   */
  /* changeType(t: string) {
     this.widget.type = t;
     this.updateComponent();
   }*/

  /**
   * Reset widget position and size
   */

  /*resetWidget() {
    const widgets = this.ss.getWidgetsSettings(this.widget.dashboard);
    const k = this.widget.name;
    const w = widgets[k];
    if (!w) {
      return;
    }
    delete w.sizeX;
    delete w.sizeY;
    delete w.row;
    delete w.col;
    this.ss.setWidgetsSettings(widgets, this.widget.dashboard);
  }*/

  copyMDX() {
    if (!this.component) {
      return;
    }
    const mdx = this.component.getMDX();

    const copyModal = {
      title: '',
      component: import('./../../../ui/share-dashboard/share-dashboard/share-dashboard.component'),
      inputs: {
        title: 'Copy MDX',
        shareUrl: mdx,
        btnTitle: 'Copy',
        hideOptions: true
      },
      closeByEsc: true,
      buttons: [],
      class: 'modal-no-border',
      componentStyles: {padding: '0'},
      onComponentInit: (sd: any) => {
        sd.onCopy = () => {
          this.ms.close(copyModal);
        };
      }
    };
    void this.ms.show(copyModal);
  }

  /**
   * Appends button state to shared url
   * @param {string} url Url to modify
   * @param {string} state State name
   * @return {string} New url
   */
  appendShareState(url, state) {
    const v = this.widget[state];
    if (v) {
      url += '&' + state + '=' + v;
    }
    return url;
  }

  share() {
    const c = this.component?.chart;

    let url = this.fs.getFiltersShareUrl();
    const part = url.split('#')[1];
    const idx = (this.widget.name || this.widget.idx).toString();
    if (part && part.indexOf('?') === -1) {
      url += '?widget=' + idx;
    } else {
      url += '&widget=' + idx;
    }

    //let w;
    //let h;
    // if (this._elem && this._elem[0] && this._elem[0].offsetParent) {
    //     w = this._elem[0].offsetParent.offsetWidth;
    //     h = this._elem[0].offsetParent.offsetHeight;
    // }
    // TODO: set height here
    /*if (h) {
      url += '&height=' + h;
    }*/

    // Share button state
    url = this.appendShareState(url, 'isLegend');
    url = this.appendShareState(url, 'isTop');
    url = this.appendShareState(url, 'showZero');
    url = this.appendShareState(url, 'showValues');

    // Store hidden series
    if (c && c.series) {
      const hidden = c.series.map((s, i) => ({v: s.visible, i})).filter(s => !s.v);
      if (hidden.length) {
        url += '&hiddenSeries=' + hidden.map(s => s.i).join(',');
      }
    }

    // Append drills
    const drills = this.component?.getDrillsAsParameter();
    if (drills) {
      url += '&drilldown=' + drills;
    }

    let html = '<iframe style="border: none" src="' + url + '" ';
    /* if (w && h) {
       html = html + 'width="' + w + '" ';
       html = html + 'height="' + h + '" ';
     }*/
    html += '></iframe>';

    const shareModal = {
      title: '',
      component: import('./../../../ui/share-dashboard/share-dashboard/share-dashboard.component'),
      inputs: {
        title: 'Share widget',
        shareUrl: html,
        btnTitle: 'Copy',
        hideOptions: true
      },
      closeByEsc: true,
      buttons: [],
      class: 'modal-no-border',
      componentStyles: {padding: '0'},
      onComponentInit: (sd: ShareDashboardComponent) => {
        sd.onCopy = () => {
          this.ms.close(shareModal);
        };
      }
    };
    void this.ms.show(shareModal);
  }

  requestData() {
    this.component?.requestData();
  }

  /**
   * Apply filter callback
   */
  applyFilter(flt: any) {
    this.updateFiltersText();
    this.requestData();
    // this.updateFiltersParameterInURL();
  }

  /**
   * Changes ngDialog css rules to set modal position to the desired place
   * @param {string} selectorText Selector to find elements
   * @param {string} style Style attribute to change
   * @param {string} value Attribute value
   */
  changeStyle(selectorText, style, value) {
    // TODO: implement
    // var theRules = [];
    // for (var i = 0; i < document.styleSheets.length; i++) {
    //     if (document.styleSheets[i].cssRules) {
    //         theRules = document.styleSheets[i].cssRules;
    //     } else if (document.styleSheets[i].rules) {
    //         theRules = document.styleSheets[i].rules;
    //     }
    //     for (var n in theRules) {
    //         if (theRules[n].selectorText == selectorText) {
    //             theRules[n].style[style] = value;
    //         }
    //     }
    // }
  }

  /**
   * Show widget toolbar
   */
  showToolbar() {
    this.widget.toolbar = true;
  }

  /**
   * Hide widget toolbar
   */
  hideToolbar() {
    this.widget.toolbar = false;
  }

  /**
   * On header back button click event handler
   */
  onHeaderButtonBack() {
    this.component?.doDrillUp();
  }

  /**
   * On header reset click filter button click event handler
   */
  onResetClickFilter() {
    this.component?.resetClickFilter();
  }

  /**
   * On filter variable change handler
   */
  onFilterVariable(v: any) {
    this.component?.onVariableChange(v);
  }

  /**
   * On filter datasource changed handler
   */
  onFilterDatasource(item: any) {
    this.component?.onDataSourceChange(item);
  }

  /**
   * On action handler
   */
  onFilterAction(action: IWidgetControl) {
    this.component?.performAction(action);
  }

  onFilter(idx: number) {

  }

  updateComponent() {
    this.widgetType = this.wts.getDesc(this.widget.type);
    const t = this.widgetType?.class; // this.wts.getClass(type || this.widget.type);
    if (t) {
      this.widget.isSupported = true;
      this.cd.detectChanges();
      setTimeout(()=> {
        // @ts-ignore
        this.component = this.ngComponentOutlet?._componentRef?.instance;
      });
    } else {
      this.widget.isSupported = false;
      this.showError(this.i18n.get('errWidgetNotSupported') + ': ' + this.widget.type);
      this.cd.detectChanges();
    }
  }

  // Set dills for shared widget
  private initDrillsForSharedWidget() {
    const drills = this.route.snapshot.queryParamMap.get('drilldown') || '';
    if (drills && this.component && this.widget) {
      this.component.drills = decodeURIComponent(drills).split('~').map(d => {
        return {path: d, name: d};
      });
      this.widget.backButton = !!this.component?.drills.length;
      this.widget.title = this.component.getDrillTitle(this.component.drills[this.component.drills.length - 1]);
      this.header?.cd.detectChanges();
    }
  }

  // Get datasource from params for shared widget
  private initDataSourceFromParams() {
    if (!this.widget.shared) {
      return;
    }
    const ds = this.route.snapshot.queryParamMap.get('datasource');
    if (ds && this.component) {
      // this.widget.dataSource = ds;
      this.component.customDataSource = ds;
    }
  }

  private updateFilterText(flt: any) {
    this.updateFiltersText();
  }

  private initFilters() {
    this.model.filters = this.fs.getWidgetModelFilters(this.widget.name);
    this.updateFiltersText();
  }

  private checkToolbarVisibility() {
    if (this.model.filters.length === 0 && !this.hasDatasourceChooser && !this.hasActions && !this.widget.pvItems.length) {
      this.hideToolbar();
    }
  }

  private subscribeFilters() {
    this.subFilter = this.bs.subscribe('filter' + this.widget.name, flt => this.applyFilter(flt));
    this.subUpdateFilterText = this.bs.subscribe('updateFilterText' + this.widget.name, flt => this.updateFilterText(flt));
    this.subFilterAll = this.bs.subscribe('filterAll', flt => this.applyFilter(flt));
  }

  private subscribeActions() {
    this.subRefresh = this.bs.subscribe('refresh:' + this.widget.name, () => this.requestData());
    this.subCopyMdx = this.bs.subscribe(`copyMDX:${this.widget.name}`, () => this.copyMDX());
    this.subShare = this.bs.subscribe(`share:${this.widget.name}`, () => this.share());
    //this.subChangeType = this.bs.subscribe('setType:' + this.widget.name, type => this.changeType(type));
  }
}
