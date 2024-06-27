import {EventEmitter, Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UtilService} from './util.service';
import {StorageService} from './storage.service';
import {DataService} from './data.service';
import {I18nService} from './i18n.service';
import {BroadcastService} from './broadcast.service';
import {DashboardService} from './dashboard.service';

import {IFilter, IWidgetEvent} from "./dsw.types";

const DATE_PICKER_CLASS = '%ZEN.Component.calendar';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  filtersChanged = false;
  isFiltersOnToolbarExists = false;
  items: IFilter[] = [];
  onApplyFilter = new EventEmitter<any>();
  onFiltersChanged = new EventEmitter<void>();
  private dashboard = '';

  constructor(private route: ActivatedRoute,
              private us: UtilService,
              private ss: StorageService,
              private ds: DataService,
              private bs: BroadcastService,
              private dbs: DashboardService,
              private i18n: I18nService) {
  }

  /**
   * Initialize service with filter array
   * @param {Array} filterArray Filter array
   */
  init(filterArray, dashboard) {
    this.filtersChanged = true;
    this.dashboard = dashboard;
    this.items = [];
    this.isFiltersOnToolbarExists = false;
    for (let i = 0; i < filterArray.length; i++) {
      this.items.push(filterArray[i]);
      const flt = this.items[this.items.length - 1];

      // Check for date filters
      flt.isDate = flt.controlClass === DATE_PICKER_CLASS || flt.targetPropertyDataType === '%DeepSee.Time.DayMonthYear';
      if (flt.isDate) {
        flt.values = [];
      }

            // Check for exclude filter
            this.checkForExclude(flt);

      // Check for multiple filter in value
      if (flt.value && flt.value?.toString().charAt(0) === '{') {
        flt.value = flt.value.toString().slice(1, -1);
        const paths = flt.value.toString().split(',');
        flt.value = flt.value.toString().replace(/,/g, '|');
      }

      // Check for valueList
      if (flt.valueList && flt.displayList) {
        const vals = flt.valueList.split(',');
        const txt = flt.displayList.split(',');
        flt.values = [];
        for (let j = 0; i < vals.length; j++) {
          flt.values.push({name: txt[j], path: vals[j]});
        }
      }

      // Check for interval
      if (flt.value?.toString().indexOf(':') !== -1) {
        if (flt.isDate) {
          this.initDateFilter(flt);
        } else {
          const parts = flt.value?.toString().split(':');
          flt.fromIdx = flt.values.findIndex(f => f.path === parts[0]) || -1;
          flt.toIdx = flt.values.findIndex(f => f.path === parts[1]) || -1;
          if (flt.fromIdx === -1) {
            flt.values?.push({path: parts[0], name: parts[0].replace('&[', '').replace(']', '')});
            flt.fromIdx = flt.values.length - 1;
          }
          flt.values[flt.fromIdx].checked = true;
          if (flt.toIdx === -1) {
            flt.values.push({path: parts[1], name: parts[1].replace('&[', '').replace(']', '')});
            flt.toIdx = flt.values.length - 1;
          }
          flt.values[flt.toIdx].checked = true;
          flt.isInterval = true;
        }
      }

      flt.targetArray = [];
      if ((flt.target !== '*') && (flt.target !== '')) {
        flt.targetArray = flt.target?.split(',').concat(['emptyWidget']);
      }
      flt.sourceArray = [];
      if ((flt.source !== '*') && (flt.source !== '') && (flt.location !== 'dashboard')) {
        flt.sourceArray = flt.source?.split(',');
      }
      if (flt.source === '' || flt.location === 'dashboard') {
        this.isFiltersOnToolbarExists = true;
      }

      // Parse additional filter parameters placed in filter label as comment
      if (flt.label) {
        // Find commented part as /* text */
        const parts = flt.label.match(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/g);
        if (parts && parts.length !== 0) {
          const params = parts[0].substring(2, parts[0].length - 2);
          flt.additionalParams = params.toLowerCase().trim().split(',');

          if (flt.additionalParams.indexOf('inverseorder') !== -1) {
            flt.values = flt.values?.reverse();
          }
          if (flt.additionalParams.indexOf('ignorenow') !== -1) {
            flt.values = flt.values?.filter((v) => v.path.toLowerCase() !== '&[now]');
          }
        }
        flt.label = flt.label.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/g, '');
      }

      if (this.route.snapshot.queryParamMap.get('nofilters') === '1') {
        flt.value = '';
      }
      flt.valueDisplay = this.findDisplayText(flt);
    }

    this.loadFiltersFromSettings();
    this.loadFiltersFromUrl();
  }

  /**
   * Returns whole share ulr for filters on dashboard
   */
  public getFiltersShareUrl() {
    let url = window.location.href.split('?')[0];
    // url = this.removeParameterFromUrl(url, 'FILTERS');
    const part = url.split('#')[1];
    const fltUrl = this.getFiltersUrlString();
    const flt = 'FILTERS=TARGET:*;FILTER:' + fltUrl;
    if (fltUrl) {
      if (part && part.indexOf('?') !== -1) {
        url += '&' + flt;
      } else {
        url += '?' + flt;
      }
    }
    return url;
  }

  /**
   * Return parameters for ulr with filters for widget or for all dashboard
   * @param {string} [widgetName] Name of widget
   * @returns {string}
   */
  getFiltersUrlString(widgetName?: string, ignoreTargetAll = false, dot = '.', seporator = '~') {
    const f: string[] = [];
    let widgetFilters = widgetName ? this.getAffectsFilters(widgetName) : this.items;
    if (ignoreTargetAll && widgetFilters) {
      widgetFilters = widgetFilters.filter(f => f.target !== '*');
    }
    for (let i = 0; i < widgetFilters.length; i++) {
      const flt = widgetFilters[i];
      if (!flt.value && !flt.isInterval) {
        continue;
      }
      let v = '';
      if (flt.isInterval) {
        // Format filter string like path.v1:v2
        v = flt.targetProperty + dot + flt.values?.[flt.fromIdx]?.path + ':' + flt.values?.[flt.toIdx]?.path;
      } else {
        v = flt.targetProperty + dot + (flt.isExclude ? '%NOT ' : '') + flt.value;
      }
      // For many selected values make correct filter string {v1,v2,v3}
      if (v.indexOf('|') !== -1) {
        v = v.replace(/\|/g, ',').replace('&[', '{&[') + '}';
      }
      f.push(v);
    }
    return encodeURIComponent(f.join(seporator));
  }

  loadFiltersFromUrl() {
    if (this.route.snapshot.queryParamMap.get('nofilters') === '1') {
      return;
    }

    let query = window.location.hash.split('?')[1];
    if (!query) {
      return;
    }
    query = query.replace(/\.&%5B/g, '.%26%5B');
    query = query.replace(/\.=&%5B/g, '.%26%5B');
    query = query.replace(/\.%7B=&%5B/g, '.%7B%26%5B');
    query = query.replace(/\,=&%5B/g, ',%26%5B');
    query = query.replace(/\.&\[/g, '.%26%5B');
    query = query.replace(/\.=&\[/g, '.%26%5B');
    const p = query.split('&');
    let param = '';
    p.forEach(q => {
      if (q.split('=')[0].toLowerCase() === 'filters') {
        param = q.split('=')[1];
      }

    });

    try {
      if (this.isBase64(decodeURIComponent(param))) {
        param = decodeURIComponent(param);
        if (param.charAt(param.length - 1) === '=') {
          param = param.slice(0, -1);
        }
        param = atob(param);
      }
    } catch (e) {
    }
    //let param = this.route.snapshot.queryParamMap.get('FILTERS');
    if (!param) {
      // Workaround for invalid escaped links where "=" char is escaped. Requested by Shvarov
      const p = Object.keys(this.route.snapshot.queryParams)[0];
      if (!p) {
        return;
      }
      param = p.split('FILTERS=')[1];
      if (!param) {
        return;
      }
    }
    const params = param.split(';');
    let widgetName = '';
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
    // Get affected filters
    let flt: any[] = [];
    if (widgetName !== '*') {
      flt = this.items.filter(f => f.targetArray?.indexOf(widgetName) !== -1 || f.target === widgetName || f.target === '*');
    } else {
      flt = this.items.slice();
    }
    flt.forEach((f: any, idx) => {
      const urlFilters = decodeURIComponent(filters).split('~');
      for (let i = 0; i < urlFilters.length; i++) {
        let s = decodeURIComponent(urlFilters[i]);
        // Workaround for invalid urls with ending '='. Requested by Shvarov
        if (s.charAt(s.length - 1) === '=') {
          s = s.slice(0, -1);
        }

        // Check for date
        if (f.isDate) {
          // Check for path
          const parts = s.split('.&');
          const path = parts[0];
          if (path !== f.targetProperty) {
            continue;
          }
          f.value = '&' + parts[1];
          this.initDateFilter(f);
        }

        // Check filter path
        if (s.indexOf('{') !== -1) {
          // Many values
          const path = s.substring(0, s.indexOf('{') - 1).replace('%NOT ', '');
          if (path !== f.targetProperty) {
            continue;
          }
          // &[30 to 59]|&[60+]|"
          const values = s.match(/\{([^)]+)\}/)?.[1].split(',');
          f.value = values?.join('|');
        } else {
          // Check for path
          const path = s.split('.&')[0];
          if (path !== f.targetProperty) {
            continue;
          }

          // Check for interval
          if (s.indexOf(':') !== -1) {
            const parts = s.split(':');
            // const path = parts[0].split('.&')[0];
            const from = parts[0].split('.').pop();
            const to = parts[1];
            f.fromIdx = f.values.findIndex(el => el.path === from);
            f.toIdx = f.values.findIndex(el => el.path === to);
            f.isInterval = true;
          } else {
            f.value = '&' + s.split('.&')[1];
          }
        }
      }
      f.valueDisplay = this.findDisplayText(f);
    });
  }

  getClickFilterTarget(widgetName: string) {
    const widgets: string[] = [];
    for (let i = 0; i < this.items.length; i++) {
      const flt = this.items[i];
      if (flt.location !== 'click') {
        continue;
      }
      if (flt.source?.toLowerCase() === widgetName.toLowerCase() || flt.source === '*') {
        widgets.push(flt.target || '');
      }
    }
    return widgets;
  }

  /**
   * Return all filters that affects on widget
   * @param {string} widgetName Widget name
   * @returns {Array.<object>} Filter list
   */
  getAffectsFilters(widgetName: string) {
    return this.items.filter(e => (
      e.target === '*' ||
      e.target === widgetName ||
      e.targetArray?.indexOf(widgetName) !== -1
    ));
  }

  /**
   * Returns filter display text
   * @param {object} flt Filter
   * @returns {string} Filter display text
   */
  findDisplayText(flt) {
    if (flt.value === '' || flt.value === undefined) {
      return '';
    }
    let value = flt.value;
    let isExclude = false;
    if (typeof value === 'string') {
      isExclude = value.toString().toUpperCase().endsWith('.%NOT');
    }
    if (isExclude) {
      value = value.toString().substr(0, value.toString().length - 5);
    }

    if (flt.isDate) {
      return this.findDateText(flt);
    }
    /*if (flt.isDate) {
        flt.valueDisplay = parts[0] + ':' + parts[1];
    }*/
    flt.value = value;
    const values = flt.value.toString().split('|');
    const names: string[] = [];
    for (let i = 0; i < flt.values.length; i++) {
      if (flt.values[i].path === value || (values.length > 1 && values.includes(flt.values[i].path))) {
        flt.values[i].checked = true;
        flt.values[i].default = true;
        flt.defaultExclude = isExclude;
        flt.isExclude = isExclude;
        names.push(flt.values[i].name);
      }
    }
      return (flt.isExclude ? 'Not ' : '') + names.join(',');
  }

  /**
   * Returns model representation of filters, not filters itself. To get filter use Filters.getFilter(flt.idx)
   * @param {string} widgetName Returns filters of widget with this name
   * @returns {Array} Model filters
   */
  getWidgetModelFilters(widgetName) {
    const res: any[] = [];
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].type === 'hidden') {
        continue;
      }
      if (this.items[i].location === 'click') {
        continue;
      }
      if (widgetName === 'emptyWidget') {
        if (this.items[i].source === '' || this.items[i].location === 'dashboard') {
          res.push({idx: i, label: this.items[i].label, text: this.items[i].valueDisplay, info: this.items[i].info});
          continue;
        }
      }
      if (this.items[i].location === 'dashboard') {
        continue;
      }
      if ((this.items[i].source === '*') || (this.items[i].sourceArray?.indexOf(widgetName) !== -1)) {
        res.push({idx: i, label: this.items[i].label, text: this.items[i].valueDisplay, info: this.items[i].info});

      }
    }
    return res;
  }

  /**
   * Returns list of filters USED by widget (note: this filters can be displayed on another widgets, to get displayed filters use getWidgetModelFilters)
   */
  getWidgetFilters(widgetName: string) {
    const res: IFilter[] = [];
    for (let i = 0; i < this.items.length; i++) {
      if ((this.items[i].target === '*' || this.items[i].target === '') ||
        (this.items[i].targetArray?.indexOf(widgetName) !== -1)) {
        res.push(this.items[i]);
      }
    }
    return res;
  }

  /**
   * Applies filter
   * @param {object} flt Filter to apply
   * @param {boolean} noRefresh Disable refresh broadcast if true
   */
  applyFilter(flt, noRefresh?) {
    this.onApplyFilter.emit(flt);
    let disp = '';
    let val = '';
    let i;
    for (i = 0; i < flt.values.length; i++) {
      if (flt.values[i].checked) {
        disp += flt.values[i].name + ',';
        val += flt.values[i].path + '|';
      }
    }
    if (disp !== '') {
      disp = disp.substr(0, disp.length - 1);
    }
    if (val !== '') {
      val = val.substr(0, val.length - 1);
    }
    // Change "," to "-" for date filter, because it applied as range
    if (flt.isDate) {
      disp = disp.replace(',', ' - ');
    }
    if (flt.isExclude) {
      disp = this.i18n.get('not') + ' ' + disp;
    }
    if (flt.isInterval) {
      disp = (flt.values[flt.fromIdx]?.name?.toString() || '') + ':' + (flt.values[flt.toIdx]?.name?.toString() || '');
    }
    flt.valueDisplay = disp;
    flt.value = val;
    if (!noRefresh) {

      // Only broadcast filtering if not `setFilter`
      if (flt.action !== 'setFilter') {
        if (flt.targetArray.length !== 0) {
          // Listened in widget.component.ts
          for (i = 0; i < flt.targetArray.length; i++) {
            this.bs.broadcast('filter' + flt.targetArray[i], flt);
          }
        } else {
          // Listened in widget.component.ts
          if (flt.target === '*' || flt.target === '') {
            this.bs.broadcast('filterAll', flt);
          }
        }
      }

      if (flt.sourceArray.length !== 0) {
        // Listened in widget.component.ts
        for (i = 0; i < flt.sourceArray.length; i++) {
          this.bs.broadcast('updateFilterText' + flt.sourceArray[i], flt);
        }
      }
    }
    this.filtersChanged = true;
    this.saveFilters();
    this.updateFiltersParameterInURL();
    this.onFiltersChanged.emit();
  }

  /**
   * Saves dashboard filters
   */
  saveFilters() {
    const settings = this.ss.getAppSettings();
    if (settings.isSaveFilters === false) {
      return;
    }

    let i;
    let flt;
    const active: any[] = [];
    for (i = 0; i < this.items.length; i++) {
      flt = this.items[i];
      if (flt.value !== '' || flt.isInterval) {
        active.push(flt);
      }
    }
    const res = active.map((e: any) => {
      return {
        targetProperty: e.targetProperty,
        value: e.value,
        isExclude: e.isExclude,
        isInterval: e.isInterval,
        fromIdx: e.fromIdx,
        toIdx: e.toIdx,
        valueDisplay: e.valueDisplay
      } as unknown as IFilter;
    });

    const widgets = this.ss.getWidgetsSettings(this.dashboard);
    if (res.length) {
      widgets._filters = res;
    } else {
      delete widgets._filters;
    }
    this.ss.setWidgetsSettings(widgets, this.dashboard);
  }

  /**
   * Returns filter by index
   * @param {number} idx Filter index
   * @returns {object} Filter
   */
  getFilter(idx) {
    if (!this.items[idx]) {
      return undefined;
    }
    return this.items[idx];
  }

  /**
   * Clear all filters
   */
  clear() {
    this.items = [];
  }

  // Removes parameter from url
  private removeParameterFromUrl(url, parameter) {
    return url
      .replace(new RegExp('[?&]' + parameter + '=[^&#]*(#.*)?$'), '$1')
      .replace(new RegExp('([?&])' + parameter + '=[^&]*&'), '$1');
  }

  private isBase64(str: string) {
    try {
      return btoa(atob(str)) === str;
    } catch (e) {
      return false;
    }
  }

  /**
   * Load saved filter values from settings
   */
  private loadFiltersFromSettings() {
    if (this.route.snapshot.queryParamMap.get('nofilters') === '1') {
      return;
    }
    // Don't Load filters for shared widget
    if (this.us.isEmbedded()) {
      return;
    }

    if (this.ss.getAppSettings()?.isSaveFilters === false) {
      return;
    }
    let found = false;

    const widgets = this.ss.getWidgetsSettings(this.dashboard);
    if (widgets._filters) {
      for (let i = 0; i < widgets._filters.length; i++) {
        const flt = widgets._filters[i];

        const exists = this.items.filter((el) => {
          return el.targetProperty === flt.targetProperty;
        })[0];
        if (exists) {
          // Check for single value
          exists.value = flt.value;
          exists.isExclude = flt.isExclude;
          exists.isInterval = flt.isInterval;

          if (exists.isInterval) {
            exists.fromIdx = flt.fromIdx;
            exists.toIdx = flt.toIdx;
            if (exists.isDate) {
              exists.valueDisplay = flt.valueDisplay;
              exists.values = flt.value.toString().split('|').map(v => {
                return {
                  path: v,
                  checked: true
                };
              });
            } else {
              exists.valueDisplay = exists.values?.[exists.fromIdx]?.name + ':' + exists.values?.[exists.toIdx]?.name;
            }
          } else {
            const values = flt.value.toString().split('|');

            // Multiple values was selected
            exists.values?.forEach((v) => {
              if (values.indexOf(v.path.toString()) !== -1) {
                v.checked = true;
              }
            });

            this._addSavedFilterToFilterList(flt, exists);

            if (flt.valueDisplay) {
              exists.valueDisplay = flt.valueDisplay.trim();
            }

            if (!exists.valueDisplay) {
              exists.valueDisplay = flt.value.toString().split('|').map(el => {
                const isNot = el.indexOf('.%NOT') !== -1;
                if (isNot) {
                  el = el.replace('.%NOT', '');
                }
                const v = exists.values?.find(e => e.path == el);
                let name = '';
                if (v && v.name) {
                  name = v.name.toString();
                }
                return (isNot ? this.i18n.get('not') + ' ' : '') + name;
              }).join(',');
            }
          }

          found = true;
        }
      }
    }
  }

  private updateFiltersParameterInURL() {
    if (!this.us.isEmbedded()) {
      return;
    }
    const idx = this.route.snapshot.queryParamMap.get('widget') || -1;
    if (idx === -1) {
      return;
    }
    const widget = this.dbs.getAllWidgets()[parseInt(idx, 10)];
    const name = widget?.name;
    const filters = 'TARGET:*;FILTER:' + this.getFiltersUrlString(name, true);
    this.ds.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {FILTERS: filters},
        queryParamsHandling: 'merge'
      });

    const event = {
      type: 'filter',
      index: this.route.snapshot.queryParamMap.get('widget'),
      widget,
      filters
    } as IWidgetEvent;

    if (window.parent) {
      window.parent.postMessage(event, '*');
    }
    try {
      if ((window.parent as any).dsw?.onFilter) {
        (window.parent as any).dsw.onFilter(event);
      }
    } catch (e) {
      console.error(e);
    }
  }

  private _addSavedFilterToFilterList(toAdd: any, filters: any) {
    const values = toAdd.value.toString().split('|');
    if (!values.length || !toAdd.valueDisplay) {
      return;
    }

    const display = toAdd.valueDisplay.toString().split(',');
    values.forEach((v, idx) => {
      // Check if this value already exists
      if (filters.values.some(exists => {
        if (exists.path === v) {
          return true;
        }
        // Check if path is number, because all saved filters is strings
        if (!isNaN(exists.path) && (parseInt(v, 10) === exists.path)) {
          return true;
        }
        return false;
      })) {
        return;
      }
      filters.values.push({
        name: display[idx],
        path: v,
        checked: true,
        _saved: true
      });
    });
  }

  private initDateFilter(flt: any) {
    flt.isInterval = true;
    flt.value = flt.value.toString().replace(':', '|');
    const parts = flt.value.toString().split('|');
    if (!flt.values) {
      flt.value = [];
    }
    flt.values.forEach(v => v.checked = false);
    flt.fromIdx = flt.values.findIndex(fi => fi.path === parts[0]);
    if (flt.fromIdx === -1) {
      flt.values.push({path: parts[0]});
      flt.fromIdx = flt.values.length - 1;
    }
    flt.values[flt.fromIdx].checked = true;

    flt.toIdx = flt.values.findIndex(fi => fi.path === parts[1]);
    if (flt.toIdx === -1) {
      flt.values.push({path: parts[1]});
      flt.toIdx = flt.values.length - 1;
    }
    flt.values[flt.toIdx].checked = true;
  }

  private findDateText(flt) {
    const value = flt.value || '';
    return value.toString().split('|').map(v => v.replace('&[', '').replace(']', '')).join(':');
  }

    private checkForExclude(flt) {
        flt.isExclude = (flt.value ?? '').toString().toLowerCase().startsWith('%not');
        if (!flt.isExclude) {
            return;
        }
        const path = flt.value.split(' ')[1];
        if (!path) {
            return;
        }
        const value = flt.values?.find(v => v.path === path);
        if (!value) {
            return;
        }
        flt.value = value.path + '.%NOT';
    }
}
