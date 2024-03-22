import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  LOCALE_ID,
  OnInit,
  ViewChild
} from '@angular/core';
import {StorageService} from '../../../services/storage.service';
import {FilterService} from '../../../services/filter.service';
import {ErrorService} from '../../../services/error.service';
import {DataService} from '../../../services/data.service';
import {dsw} from "../../../../environments/dsw";
import {DashboardService} from "../../../services/dashboard.service";
import {DateFilterComponent} from "../date-filter/date-filter.component";
import {DatePipe} from "@angular/common";
import {UtilService} from "../../../services/util.service";
import {I18nPipe} from '../../../services/i18n.service';
import {AutoFocusDirective} from '../../../directives/auto-focus.directive';
import {FormsModule} from '@angular/forms';
import {IWidgetInfo} from "../../../services/dsw.types";
import {ModalComponent} from "../modal/modal.component";

interface IFilterModel {
  search: string;
  isLoading: boolean;
  filter?: any;
  values: any[];
  isAll: boolean;
  isExclude: boolean;
  isInterval: boolean;
  from: string;
  to: string;
}

@Component({
  selector: 'dsw-filter-popup',
  templateUrl: './filter-popup.component.html',
  styleUrls: ['./filter-popup.component.scss'],
  standalone: true,
  imports: [FormsModule, AutoFocusDirective, DateFilterComponent, I18nPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterPopupComponent implements OnInit, AfterViewInit {
  @ViewChild('dateFilter') dateFilter!: DateFilterComponent;
  model: IFilterModel = {
    search: '',
    isLoading: false,
    filter: undefined,
    values: [],
    isAll: false,
    isExclude: false,
    isInterval: false,
    from: '',
    to: ''
  };
  @Input()
  _modal?: ModalComponent;
  isRelatedFilters = false;
  widget!: IWidgetInfo;
  private datePipe: DatePipe;

  constructor(private ss: StorageService,
              private el: ElementRef,
              private ds: DataService,
              private dbs: DashboardService,
              private fs: FilterService,
              private es: ErrorService,
              private us: UtilService,
              @Inject(LOCALE_ID) private locale: string) {
    this.datePipe = new DatePipe(locale);
    const settings = this.ss.getAppSettings();
    this.isRelatedFilters = settings.isRelatedFilters === undefined ? true : settings.isRelatedFilters;
  }

  @HostBinding('class.date-filter')
  get isDateFilter() {
    return !!this.model?.filter?.isDate;
  }

  get isRadio() {
    return (this.model?.filter?.type === 'radioSet' || this.model?.filter?.action === 'applyVariable');
  }

  get hasDefault() {
    return (this.model?.filter?.type === 'radioSet' && this.model?.filter?.action !== 'applyVariable');
  }

  trackByIndex = (index: number, r: any) => index;

  ngAfterViewInit() {
    const el = this.el?.nativeElement;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const maxH = window.innerHeight;
    if (rect.top + rect.height > maxH) {
      const deltaBottom = maxH - rect.top;
      const deltaTop = rect.top - 26 - 4 - 4;
      if (maxH - rect.top < 200 && deltaTop > deltaBottom) {
        // Open filter above
        const bottom = maxH - rect.top + 30 + 4;
        const delta = maxH - bottom - rect.height;
        el.style.maxHeight = (rect.height + delta - 20) + 'px';
        el.style.top = '';
        el.style.bottom = bottom + 'px';
      } else {
        // Open filter below
        const delta = (rect.top + rect.height) - maxH;
        el.style.maxHeight = (rect.height - delta - 20) + 'px';
      }
    }

    this.initializeDateFilter();
  }


  initialize(widget: IWidgetInfo, filter: any, dataSource: string) {
    this.widget = widget;
    // this.source = filter;
    // this.dataSource = dataSource;
    this.model.filter = filter;

    // Check for related filters
    if (!filter.isDate && this.isRelatedFilters/* && Filters.filtersChanged*/) {
      this.requestRelatedFilters(filter);
    } else {
      this.prepareFilters();
    }

    this.model.isAll = !this.isAnyChecked();
    this.model.isExclude = filter.isExclude;
    this.model.isInterval = filter.isInterval;
  }

  ngOnInit() {
  }

  requestRelatedFilters(initiator?: any) {
    const ds = this.getDataSource();
    this.prepareFilters();
    if (!ds) {
      return;
    }
    const related = [];
    const filters = this.fs.items;
    // Get active filters
    let activeFilters = filters.filter(f => !f.isInterval && ((f.targetProperty !== this.model.filter?.targetProperty) && f.value !== ''));
    // Reformat to DSZ filters
    activeFilters.forEach(f => {
      f.Value = f.value;
      if (f.isExclude) {
        f.Value = f.Value.split('|').map(v => v += '.%NOT').join('|');
      }
      if (f.isInterval) {
        f.Value = f.Value.replace('|', ':');
      }
      if (f.value.indexOf('|') !== -1) {
        f.Value = '{' + f.Value.replace(/\|/g, ',') + '}';
      }
    });
    activeFilters = activeFilters.map(f => ({Filter: f.targetProperty, Value: f.Value}));

    const isValuesExists = !!filters.find(f => f.targetProperty === this.model?.filter?.targetProperty)?.values?.filter(v => !v._saved)?.length;
    if (!isValuesExists) {
      return;
    }

    this.model.isLoading = true;
    this.ds
      .searchFilters('', ds, activeFilters, [this.model.filter?.targetProperty])
      .catch(e => this.onError(e, e.status))
      .then(data => {
        this.onFilterValuesReceived(data);
        this.onSearch('');
      });
  }

  /**
   * Returns data source of widget for current filter
   * @returns {undefined|string} Data source string
   */
  getDataSource(): string {
    let ds = '';
    try {
      if (this.widget.type.toLowerCase() === dsw.const.emptyWidgetClass) {
        const src = this.model.filter?.source || '';
        const w = this.dbs.getWidgets().filter(ww => ww.name === src)[0];
        ds = w?.dataSource || '';
      } else {
        ds = this.widget.dataSource;
      }
    } catch (e) {
      ds = '';
    }
    return ds;
  }

  /**
   * Initialize filters data
   */
  prepareFilters() {
    this.fs.filtersChanged = false;
    this.model.values = [];
    for (let i = 0; i < this.model.filter?.values.length; i++) {
      this.model.values.push(this.model.filter?.values[i]);
    }
    if (this.model.values.length !== 0) {
      if (this.model.values[this.model.filter?.fromIdx]) {
        this.model.from = this.model.values[this.model.filter?.fromIdx].path;
      } else {
        this.model.from = this.model.values[0].path;
      }
      if (this.model.values[this.model.filter?.toIdx]) {
        this.model.to = this.model.values[this.model.filter?.toIdx].path;
      } else {
        this.model.to = this.model.values[0].path;
      }
    }
  }

  /**
   * Search input onChange callback. Searches filter values by input text
   */
  onSearch(search: string) {
    if (search === '') {
      this.model.values = this.model.filter?.values;
    } else {
      const s = search.toLowerCase();
      this.model.values = [];
      for (let i = 0; i < this.model.filter?.values.length; i++) {
        if (this.model.filter?.values[i].name.toString().toLowerCase().indexOf(s) !== -1) {
          this.model.values.push(this.model.filter?.values[i]);
        }
      }
    }
  }

  /**
   * Selects one row. ("td" onclick event handler)
   * @param {object} f Row object
   */
  toggleRow(f: any, e: MouseEvent) {
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    for (let i = 0; i < this.model.filter?.values.length; i++) {
      this.model.filter.values[i].checked = false;
    }
    f.checked = true;
    this.model.isAll = !f.checked;
  }

  /**
   * Returns true if interval controls are visible
   * @returns {boolean} Is interval controls are visible
   */
  isIntervalControlsVisible() {
    return this.model.isInterval === true;
  }

  /**
   * Item select callback(checkbox onClick event handler)
   */
  onItemSelect(e: MouseEvent) {
    this.model.isAll = !this.isAnyChecked();
  }

  /**
   * Selects all items
   */
  setAll(e: MouseEvent) {
    // e.preventDefault();
    this.model.isAll = true;
    this.model.isExclude = false;
    this.model.isInterval = false;
    for (let i = 0; i < this.model.filter?.values.length; i++) {
      this.model.filter.values[i].checked = false;
    }
  }

  /**
   * Is any item checked
   * @returns {boolean} True if any item is checked
   */
  isAnyChecked() {
    for (let i = 0; i < this.model.filter?.values.length; i++) {
      if (this.model.filter?.values[i].checked) {
        return true;
      }
    }
    return false;
  }

  /**
   * Request filters from server by search string. (handles onEnter event on search input)
   */
  searchFilters() {
    let ds = this.getDataSource();
    if (!ds) {
      return;
    }
    const searchStr = this.model.search;
    if (!searchStr) {
      return;
    }
    this.model.isLoading = true;
    this.ds
      .searchFilters(searchStr, ds)
      .catch(e => this.onError(e, e.status))
      .then(data => {
        this.onFilterValuesReceived(data);
        this.onSearch(searchStr);
      });
  }

  /**
   * Data retrieved callback for searchFilters() request
   * @param {object} result Filter data
   */
  onFilterValuesReceived(result, doNotReplace = false) {
    this.model.isLoading = false;
    if (!result) {
      return;
    }

    // Find global filter to update its values
    const filters = result.children.filter(el => {
      return el.path === this.model.filter?.targetProperty;
    });
    if (filters.length === 0) {
      return;
    }
    const filter = filters[0];
    if (!filter.children || filter.children.length === 0) {
      return;
    }

    // Path current filter modifications(selected state, etc.) to newly received values
    const oldFilters = this.model.filter?.values.slice();
    const newFilters: any[] = [];
    filter.children.forEach(f => {
      let o = oldFilters.find(flt => {
        if (flt?.path === f?.path) {
          return true;
        }
        if (!isNaN(f?.path) && (parseInt(flt?.path, 10) === f?.path)) {
          return true;
        }
        return false;
      });
      if (o) {
        Object.assign(f, o);
      }/* else {
                toAdd.push(f);
            }*/
      newFilters.push(f);
    });

    // Update model values
    if (newFilters.length && this.model.filter) {
      this.model.filter.values = [...newFilters];
    }
    // this.model.filter.values.push(...toAdd); // filter.children;

    // Prepare filter values
    //this.prepareFilters();

    // Recreate filters
    //Filters.init(Filters.items.slice());
  }

  /**
   * Request error handling callback
   * @param {object} e Error
   * @param {string} status Status text
   */
  onError(e, status) {
    this.model.isLoading = false;
    this.es.show(`Error ${status.toString()}`);
  }

  /**
   * Dismiss filter and close dialog
   */
  removeFilter() {
    if (this.model.filter) {
      this.model.filter.isInterval = false;
    }
    delete this.model.filter?.fromIdx;
    delete this.model.filter?.toIdx;
    for (let i = 0; i < this.model.filter?.values.length; i++) {
      this.model.filter.values[i].checked = false;
    }
    this.fs.applyFilter(this.model.filter);
    this.close();
  }

  /**
   * Accepts filter and close dialog
   */
  acceptFilter() {
    this.model.filter.isExclude = this.model.isExclude;
    this.model.filter.isInterval = this.model.isInterval;
    if (this.model.filter.isInterval) {
      this.model.filter.fromIdx = this.model.values.findIndex(v => v.path === this.model.from);
      this.model.filter.toIdx = this.model.values.findIndex(v => v.path === this.model.to);
    } else {
      delete this.model.filter.from;
      delete this.model.filter.to;
    }

    // Date filter
    if (this.model.filter.isDate) {
      this.model.filter.isInterval = false;
      delete this.model.filter.from;
      delete this.model.filter.to;

      const values = this.dateFilter.getValues();
      this.model.filter.values = values.map(v => {
        const dTxt = v.getFullYear() + '-' + ('0' + (v.getMonth() + 1)).slice(-2) + '-' + ('0' + v.getDate()).slice(-2);
        return {
          name: this.datePipe.transform(v, 'dd MMM yyyy'),
          path: `&[${dTxt}]`,
          checked: true
        };
      });

      if (values.length === 2) {
        this.model.filter.isInterval = true;
        this.model.filter.fromIdx = 0;
        this.model.filter.toIdx = 1;
      }
    }

    this.fs.applyFilter(this.model.filter);
    this.fs.filtersChanged = true;
    this.close();
  }

  close() {
    this._modal?.close();
  }

  private initializeDateFilter() {
    if (!this.model?.filter?.isDate || !this.dateFilter) {
      return;
    }
    const value = this.model?.filter?.value;
    if (!value) {
      return;
    }
    let values = value.split('|').map(v => this.createDate(v));
    /*  if (values[0] === values[1]) {
          values = values.splice(-1);
      }*/
    this.dateFilter.setDateRange(values[0], values[1]);
  }

  private createDate(v: string) {
    return this.us.toDate(v.replace('&[', '').replace(']', ''));
  }
}
