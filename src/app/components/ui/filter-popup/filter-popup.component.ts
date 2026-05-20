import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  LOCALE_ID, OnDestroy,
  OnInit,
  Pipe,
  PipeTransform,
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
import {IFilter, IFilterModel, IFilterValue, IRelatedFiltersRequestData, IWidgetDesc} from "../../../services/dsw.types";
import {ModalComponent} from "../modal/modal.component";
import {Subject, Subscription} from 'rxjs';
import {debounceTime, filter} from 'rxjs/operators';
import {BroadcastService} from '../../../services/broadcast.service';
import {I18nService} from '../../../services/i18n.service';

@Pipe({
  name: 'selectedFirst',
  pure: true,
  standalone: true
})
export class SelectedFirstPipe implements PipeTransform {
  transform(value: any[]): any[] {
    if (!Array.isArray(value)) {
      return value; // Return the value unchanged if it's not an array
    }

    // Sort by `checked` field: `true` comes first, `false` later
    return value.sort((a, b) => (a.checked === b.checked) ? 0 : (a.checked ? -1 : 1));
  }
}

@Component({
  selector: 'dsw-filter-popup',
  templateUrl: './filter-popup.component.html',
  styleUrls: ['./filter-popup.component.scss'],
  standalone: true,
  imports: [FormsModule, AutoFocusDirective, DateFilterComponent, I18nPipe, SelectedFirstPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterPopupComponent implements OnInit, AfterViewInit, OnDestroy {
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
  relatedFiltersHint = '';
  widget!: IWidgetDesc;
  private datePipe: DatePipe;
  private restoreValuesOnClose = true;
  private originalValues?: IFilterValue[];
  private readonly MIN_SEARCH_LENGTH = 3;
  private readonly SEARCH_DEBOUNCE_MS = 700;
  private searchInput$ = new Subject<string>();
  private searchSubscription?: Subscription;
  private searchRequestId = 0;

  constructor(private ss: StorageService,
              private el: ElementRef,
              private ds: DataService,
              private dbs: DashboardService,
              private fs: FilterService,
              private es: ErrorService,
              private us: UtilService,
              private bs: BroadcastService,
              private i18n: I18nService,
              private cdr: ChangeDetectorRef,
              @Inject(LOCALE_ID) private locale: string) {
    this.datePipe = new DatePipe(locale);
    const settings = this.ss.getAppSettings();
    this.isRelatedFilters = settings.isRelatedFilters === undefined ? true : settings.isRelatedFilters;
    // this.isRelatedFilters = !!settings.isRelatedFilters;
  }

  get hasClearableSelection(): boolean {
    return !!this.model.filter?.values?.some(v => v.checked || v._pinned);
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

  ngAfterViewInit() {
    this.fitFiltersIntoScreen();
    this.initializeDateFilter();
  }

  private fitFiltersIntoScreen() {
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
  }

  initialize(widget: IWidgetDesc, filter: any, dataSource: string) {
    this.widget = widget;
    // this.source = filter;
    // this.dataSource = dataSource;
    this.model.filter = filter;

    // Check for related filters
    if (!filter.isDate && this.isRelatedFilters/* && Filters.filtersChanged*/) {
      this.requestRelatedFilters();
    } else {
      this.prepareFilters();
      this.updateRelatedFiltersHint();
      this.broadcastRelatedFilters();
    }

    this.model.isAll = !this.isAnyChecked();
    this.model.isExclude = filter.isExclude;
    this.model.isInterval = filter.isInterval;
    if (this.model.filter.values?.length) {
      this.originalValues = structuredClone(this.model.filter.values);
    }
  }

  ngOnInit() {
    this.searchSubscription = this.searchInput$.pipe(
      debounceTime(this.SEARCH_DEBOUNCE_MS),
      filter(s => (s || '').trim().length >= this.MIN_SEARCH_LENGTH)
    ).subscribe(() => this.searchFilters());
  }

  /**
   * Called from template on search input change; feeds debounced stream for auto-request to backend.
   */
  onSearchInputChange(value: string) {
    this.searchInput$.next((value || '').trim());
  }

  requestRelatedFilters(force = false) {
    this.fetchFilterValues('', force);
  }

  clearSelection() {
    if (!this.model.filter?.values) {
      return;
    }
    this.model.filter.values = this.model.filter.values
      .filter(v => !v._pinned)
      .map(v => ({...v, checked: false}));
    this.model.search = '';
    this.searchRequestId++;
    this.model.isAll = true;
    if (this.isRelatedFilters) {
      this.fetchFilterValues('', true);
    } else {
      this.prepareFilters();
    }
    this.updateRelatedFiltersHint();
    this.broadcastRelatedFilters();
    this.cdr.detectChanges();
  }

  private fetchFilterValues(searchStr: string, force = false) {
    const ds = this.getDataSource();
    this.prepareFilters();
    if (!ds || !this.model.filter) {
      return;
    }

    const filters = this.fs.items;
    const isValuesExists = !!filters
      .find(f => f.targetProperty === this.model.filter?.targetProperty)
      ?.values?.filter(v => !v._saved)?.length;
    if (!force && !searchStr && !isValuesExists) {
      this.updateRelatedFiltersHint();
      this.broadcastRelatedFilters();
      return;
    }

    const related = this.isRelatedFilters ? this.buildRelatedFiltersPayload() : undefined;
    this.model.isLoading = true;
    this.ds
      .searchFilters(searchStr, ds, related, [this.model.filter.targetProperty])
      .catch(e => this.onError(e, e.status))
      .then(data => {
        this.onFilterValuesReceived(data);
        this.onSearch(searchStr);
      })
      .finally(() => {
        this.model.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  private getActiveRelatedFilters(): IFilter[] {
    return this.fs.items.filter(f =>
      !f.isInterval &&
      f.targetProperty !== this.model.filter?.targetProperty &&
      f.value !== ''
    );
  }

  private buildRelatedFiltersPayload(): IRelatedFiltersRequestData[] {
    const res: IRelatedFiltersRequestData[] = [];
    this.getActiveRelatedFilters().forEach(f => {
      let value = f.value.toString();
      if (f.isExclude) {
        value = value.split('|').map(v => v += '.%NOT').join('|');
      }
      if (f.isInterval) {
        value = value.replace('|', ':');
      }
      if (f.value.toString().indexOf('|') !== -1) {
        value = '{' + value.replace(/\|/g, ',') + '}';
      }
      res.push({Filter: f.targetProperty, Value: value});
    });
    return res;
  }

  private pathsEqual(a: string | number | undefined, b: string | number | undefined): boolean {
    if (a === b) {
      return true;
    }
    if (a === undefined || b === undefined) {
      return false;
    }
    const aNum = Number(a);
    const bNum = Number(b);
    return !isNaN(aNum) && !isNaN(bNum) && aNum === bNum;
  }

  private updateRelatedFiltersHint() {
    if (!this.isRelatedFilters) {
      this.relatedFiltersHint = '';
      return;
    }
    const active = this.getActiveRelatedFilters();
    if (!active.length) {
      this.relatedFiltersHint = '';
      return;
    }
    const parts = active.map(f => `${f.label} — ${f.valueDisplay || '…'}`);
    this.relatedFiltersHint = this.i18n.get('filtersAffectingList') + ': ' + parts.join(', ');
  }

  private broadcastRelatedFilters() {
    if (!this.isRelatedFilters) {
      this.bs.broadcast('filterPopupRelated', []);
      return;
    }
    this.bs.broadcast('filterPopupRelated', this.getActiveRelatedFilters().map(f => f.targetProperty));
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

    setTimeout(() => {
      this.fitFiltersIntoScreen();
    });
  }

  /**
   * Search input onChange callback. Searches filter values by input text
   */
  onSearch(search: string) {
    const all = this.model.filter?.values || [];
    const pinnedOrChecked = all.filter(v => v.checked || v._pinned);

    if (search === '') {
      this.model.values = all;
    } else {
      const s = search.toLowerCase();
      const matched = all.filter(v => v.name?.toString().toLowerCase().indexOf(s) !== -1);
      const extras = pinnedOrChecked.filter(v => !matched.some(m => this.pathsEqual(m.path, v.path)));
      this.model.values = [...extras, ...matched];
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
  onItemSelect(e: MouseEvent, v?: IFilterValue) {
    if (v && !v.checked && v._pinned && this.model.filter?.values) {
      this.model.filter.values = this.model.filter.values.filter(item => !this.pathsEqual(item.path, v.path));
      this.onSearch(this.model.search);
    }
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
   * Request filters from server by search string. (handles onEnter event on search input and debounced auto-request)
   */
  searchFilters() {
    const ds = this.getDataSource();
    if (!ds) {
      return;
    }
    const searchStr = this.model.search;
    if (!searchStr) {
      return;
    }
    this.model.isLoading = true;
    const requestId = ++this.searchRequestId;
    const related = this.isRelatedFilters ? this.buildRelatedFiltersPayload() : undefined;
    this.ds
      .searchFilters(searchStr, ds, related, [this.model.filter?.targetProperty])
      .catch(e => this.onError(e, e.status))
      .then(data => {
        if (requestId === this.searchRequestId) {
          this.onFilterValuesReceived(data);
          this.onSearch(searchStr);
        }
        this.model.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  /**
   * Data retrieved callback for searchFilters() request
   * @param {object} result Filter data
   */
  onFilterValuesReceived(result) {
    this.model.isLoading = false;
    if (!result) {
      return;
    }

    const filters = result.children.filter(el => el.path === this.model.filter?.targetProperty);
    if (filters.length === 0) {
      return;
    }
    const filter = filters[0];
    const previous = this.model.filter?.values?.slice() || [];
    const checkedToPreserve = previous.filter(v => v.checked);

    if (!filter.children || filter.children.length === 0) {
      if (checkedToPreserve.length && this.model.filter) {
        this.model.filter.values = checkedToPreserve.map(v => ({...v, _pinned: true}));
      }
      this.updateRelatedFiltersHint();
      this.broadcastRelatedFilters();
      return;
    }

    const newFilters: IFilterValue[] = [];

    filter.children.forEach(f => {
      const match = previous.find(flt => this.pathsEqual(flt.path, f.path));
      if (match) {
        Object.assign(f, {checked: match.checked, _saved: match._saved, _pinned: false});
      }
      newFilters.push(f);
    });

    checkedToPreserve.forEach(sel => {
      if (!newFilters.some(f => this.pathsEqual(f.path, sel.path))) {
        newFilters.unshift({...sel, _pinned: true});
      }
    });

    if (newFilters.length && this.model.filter) {
      this.model.filter.values = [...newFilters];
    }

    this.updateRelatedFiltersHint();
    this.broadcastRelatedFilters();
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
    this.clearSelectedItems();
    this.fs.applyFilter(this.model.filter);
    this.restoreValuesOnClose = false;
    this.close();
  }

  private clearSelectedItems() {
    for (let i = 0; i < this.model.filter?.values.length; i++) {
      this.model.filter.values[i].checked = false;
    }
  }

  private restoreSelectionState() {
    if (!this.originalValues?.length) {
      return;
    }
    this.model.filter.values = structuredClone(this.originalValues);
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
    this.restoreValuesOnClose = false;
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

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
    this.searchInput$.complete();
    this.bs.broadcast('filterPopupRelated', []);
    if (this.restoreValuesOnClose) {
      this.restoreSelectionState();
    }
  }
}
