import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {StorageService} from '../../../services/storage.service';
import {IWidgetInfo} from '../../widgets/base-widget.class';
import {FilterService} from '../../../services/filter.service';
import {ErrorService} from '../../../services/error.service';
import {DataService} from '../../../services/data.service';
import {dsw} from "../../../../environments/dsw";
import {DashboardService} from "../../../services/dashboard.service";

@Component({
    selector: 'dsw-filter-popup',
    templateUrl: './filter-popup.component.html',
    styleUrls: ['./filter-popup.component.scss']
})
export class FilterPopupComponent implements OnInit, AfterViewInit {
    model = {
        search: '',
        isLoading: false,
        filter: null,
        values: [],
        isAll: false,
        isExclude: false,
        isInterval: false,
        from: '',
        to: ''

    };
    isRelatedFilters = false;
    widget: IWidgetInfo;
    // source: any;
    //dataSource: any;
    trackByIndex = (index: number, r: any) => index;

    constructor(private ss: StorageService,
                private el: ElementRef,
                private ds: DataService,
                private dbs: DashboardService,
                private fs: FilterService,
                private es: ErrorService) {
        const settings = this.ss.getAppSettings();
        this.isRelatedFilters = settings.isRelatedFilters === undefined ? true : settings.isRelatedFilters;
    }

    get isRadio() {
        return (this.model?.filter.type === 'radioSet' || this.model?.filter.action === 'applyVariable');
    }

    get hasDefault() {
        return (this.model?.filter.type === 'radioSet' && this.model?.filter.action !== 'applyVariable');
    }

    ngAfterViewInit() {
        const el = this.el?.nativeElement;
        if (!el) {
            return;
        }
        const rect = el.getBoundingClientRect();
        const maxH = window.innerHeight;
        if (rect.top + rect.height > maxH) {
            const delta = (rect.top + rect.height) - maxH;
            el.style.maxHeight = (rect.height - delta - 20) + 'px';
            console.log(delta);
        }
    }


    initialize(widget: IWidgetInfo, filter: any, dataSource: string) {
        this.widget = widget;
        // this.source = filter;
        // this.dataSource = dataSource;
        this.model.filter = filter;

        // Check for related filters
        if (this.isRelatedFilters/* && Filters.filtersChanged*/) {
            this.requestRelatedFilters();
        } else {
            this.prepareFilters();
        }

        this.model.isAll = !this.isAnyChecked();

        this.model.isInterval = filter.isInterval;
    }

    ngOnInit() {
    }

    requestRelatedFilters() {
        const ds = this.getDataSource();
        this.prepareFilters();
        if (!ds) {
            return;
        }
        const related = [];
        const filters = this.fs.items;
        // Get active filters
        let activeFilters = filters.filter(f => !f.isInterval && ((f.targetProperty !== this.model.filter.targetProperty) && f.value !== ''));
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
        if (isValuesExists) {
            return;
        }

        this.model.isLoading = true;
        this.ds
            .searchFilters('', ds, activeFilters, [this.model.filter.targetProperty])
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
        for (let i = 0; i < this.model.filter.values.length; i++) {
            this.model.values.push(this.model.filter.values[i]);
        }
        if (this.model.values.length !== 0) {
            if (this.model.values[this.model.filter.fromIdx]) {
                this.model.from = this.model.values[this.model.filter.fromIdx].path;
            } else {
                this.model.from = this.model.values[0].path;
            }
            if (this.model.values[this.model.filter.toIdx]) {
                this.model.to = this.model.values[this.model.filter.toIdx].path;
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
            this.model.values = this.model.filter.values;
        } else {
            const s = search.toLowerCase();
            this.model.values = [];
            for (let i = 0; i < this.model.filter.values.length; i++) {
                if (this.model.filter.values[i].name.toString().toLowerCase().indexOf(s) !== -1) {
                    this.model.values.push(this.model.filter.values[i]);
                }
            }
        }
    }

    /**
     * Selects one row. ("td" onclick event handler)
     * @param {object} f Row object
     */
    toggleRow(f: any, e: MouseEvent) {
        if ((e.target as HTMLElement).tagName === 'INPUT') { return; }
        for (let i = 0; i < this.model.filter.values.length; i++) {
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
        for (let i = 0; i < this.model.filter.values.length; i++) {
            this.model.filter.values[i].checked = false;
        }
    }

    /**
     * Is any item checked
     * @returns {boolean} True if any item is checked
     */
    isAnyChecked() {
        for (let i = 0; i < this.model.filter.values.length; i++) {
            if (this.model.filter.values[i].checked) {
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
            return el.path === this.model.filter.targetProperty;
        });
        if (filters.length === 0) {
            return;
        }
        const filter = filters[0];
        if (!filter.children || filter.children.length === 0) {
            return;
        }

        // Path current filter modifications(selected state, etc.) to newly received values
        let oldFilters = this.model.filter.values.slice();
        const toAdd = [];
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
            } else {
                toAdd.push(f);
            }
        });

        // Update model values
        this.model.filter.values.push(...toAdd); // filter.children;

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
        this.model.filter.isInterval = false;
        delete this.model.filter.fromIdx;
        delete this.model.filter.toIdx;
        for (let i = 0; i < this.model.filter.values.length; i++) {
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
        this.fs.applyFilter(this.model.filter);
        this.fs.filtersChanged = true;
        this.close();
    }

    close() {
        this['$modal'].close();
    }
}
