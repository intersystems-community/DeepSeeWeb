import {
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    Input,
    OnDestroy,
    OnInit, Renderer2,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {BaseWidget, IWidgetInfo} from '../../base-widget.class';
import {FilterService} from '../../../../services/filter.service';
import {StorageService} from '../../../../services/storage.service';
import {DataService} from '../../../../services/data.service';
import {VariablesService} from '../../../../services/variables.service';
import {I18nService} from '../../../../services/i18n.service';
import {WidgetTypeService} from '../../../../services/widget-type.service';
import {IButtonToggle} from '../../../../services/widget.service';
import {WidgetHeaderComponent} from '../widget-header/widget-header.component';
import {NamespaceService} from '../../../../services/namespace.service';
import {BroadcastService} from '../../../../services/broadcast.service';
import {FilterPopupComponent} from '../../../ui/filter-popup/filter-popup.component';
import {Subscription} from 'rxjs';
import {ModalService} from '../../../../services/modal.service';
import {TextAreaComponent} from '../../../ui/text-area/text-area.component';

@Component({
    selector: 'dsw-widget',
    templateUrl: './widget.component.html',
    styleUrls: ['./widget.component.scss']
})
export class WidgetComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('container', {read: ViewContainerRef, static: true})
    container: ViewContainerRef;

    @ViewChild('header', {static: true})
    header: WidgetHeaderComponent;

    model = {
        error: '',
        filters: null
    };
    @Input() widget: IWidgetInfo;

    private componentRef: ComponentRef<BaseWidget>;
    public component: BaseWidget;
    hasDatasourceChoser = false;
    hasActions = false;

    private subFilter: Subscription;
    private subFilterAll: Subscription;
    private subRefresh: Subscription;
    private subCopyMdx: Subscription;

    constructor(private fs: FilterService,
                private ds: DataService,
                private ss: StorageService,
                private vs: VariablesService,
                private i18n: I18nService,
                private wts: WidgetTypeService,
                private ns: NamespaceService,
                private bs: BroadcastService,
                private ms: ModalService,
                private cfr: ComponentFactoryResolver) {

    }

    ngAfterViewInit() {

    }

    // changeWidgetType(newType: string) {
    //     this.widget.oldType = this.widget.type;
    //     this.widget.type = newType;
    //     this.createWidgetComponent();
    //     // TODO: this.widget.drills = this.drills;
    //
    // }

    // restoreWidgetType() {
    //     delete this.widget.pivotMdx;
    //     delete this.widget.pivotData;
    //     // TODO: this.widget.backButton = this.drills.length !== 0;
    //     this.widget.type = this.widget.oldType;
    //     this.createWidgetComponent();
    // }

    onHeaderButton(bt: IButtonToggle) {
        if (bt.name ==='displayAsPivot' && this.component) {
            this.component.displayAsPivot();
            return;
        }
        if (this.component) {
            this.component.onHeaderButton(bt);
        }
        this.header.cd.detectChanges();
    }

    ngOnInit() {
        // super.ngOnInit();
        this.createWidgetComponent();

        this.model.filters = this.fs.getWidgetModelFilters(this.widget.name);
        this.updateFiltersText();



        this.setupPivotVariables();
        if (this.model.filters.length === 0 && !this.hasDatasourceChoser && !this.hasActions && !this.widget.pvItems.length) {
            this.hideToolbar();
        }

        // Filter subscriptions
        this.subFilter = this.bs.subscribe("filter" + this.widget.name, flt => this.applyFilter(flt));
        this.subFilterAll = this.bs.subscribe("filterAll", flt => this.applyFilter(flt));

        this.subRefresh = this.bs.subscribe("refresh:" + this.widget.name, () => this.requestData());
        this.subCopyMdx = this.bs.subscribe(`copyMDX:${this.widget.name}`, () => this.copyMDX());
        this.bs.subscribe(`share:${this.widget.name}`, () => this.share());


        // TODO: subscribe
        // this.$on("refresh-all", () => {this.requestData();});
        // TODO: process subscriptions
        // this.$on('gridster-item-transition-end', onResize);
        // this.$on('gridster-resized', onResize);
        // this.$watch('item.row', onMoveVertical, true);
        // this.$watch('item.col', onMoveHorizontal, true);
        // this.$watch('item.sizeX', onResizeHorizontal, true);
        // this.$watch('item.sizeY', onResizeVertical, true);
        // this.$on("resetWidgets", resetWidget);
        // this.$on("setType:" + this.item.$$hashKey, changeType);
        // this.$on('$destroy',  () => {
        // filterListener();
        // filterAllListener();

        // if (this.component) {
        //     this.component.instance.requestData();
        // }
        // this.setupDrillFilter();
        // this.setupChoseDataSource();
        // this.setupActions();

        // this.requestPivotData();

    }


    /**
     * Initializes pivot variables
     */
    setupPivotVariables() {
        this.widget.pvItems = [];
        const isEmptyWidget = this.widget.type === 'mdx2json.emptyportlet';

        let items = [];
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
        if (this.subCopyMdx) {
            this.subCopyMdx.unsubscribe();
        }
        if (this.subRefresh) {
            this.subRefresh.unsubscribe();
        }
        if (this.subFilter) {
            this.subFilter.unsubscribe();
        }
        if (this.subFilterAll) {
            this.subFilterAll.unsubscribe();
        }
        if (this.component) {
            this.component.destroy();
        }
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
    showError(txt) {
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
                if (!flt.valueDisplay && flt.value) {
                    flt.valueDisplay = flt.value.replace('&[', '').replace(']', '');
                }
            }
        }

        for (let i = 0; i < this.model.filters.length; i++) {
            const flt = this.getFilter(i);
            if (flt.isInterval) {
                this.model.filters[i].text = flt.values[flt.fromIdx].name + ':' + flt.values[flt.toIdx].name;
                continue;
            }
            this.model.filters[i].text = ((flt.isExclude === true && flt.valueDisplay) ? (this.i18n.get('not') + ' ') : '') + flt.valueDisplay;
        }
    }

    /**
     * Get widget filter
     * @param {number} idx Index of filter to get
     * @returns {object} Widget filter
     */
    getFilter(idx) {
        return this.fs.getFilter(this.model.filters[idx].idx);
    }


    /**
     * Changes widget type. Callback for $on("setType")
     * @param {object} sc Scope
     * @param {string} t Type
     */
    changeType(t: string) {
        this.widget.type = t;
        if ((this.component.chart) && (t.indexOf('chart') !== -1)) {
            this.setType(t.replace('chart', ''));
        }
        // TODO: broadcast
        // this.$broadcast('typeChanged');
    }

    protected setType(type: string) {

    }

    /**
     * Reset widget position and size
     */
    resetWidget() {
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
    }

    copyMDX() {
        if (!this.component) {
            return;
        }
        const mdx = this.component.getMDX();
        this.ms.show({
            title: 'Copy MDX',
            component: TextAreaComponent,
            closeByEsc: true,
            onComponentInit: (c: TextAreaComponent) => {
                c.value = mdx;
            }
        });
    }

    /**
     * Appends button state to shared url
     * @param {string} url Url to modify
     * @param {string} state State name
     * @return {string} New url
     */
    appendShareState(url, state) {
        // TODO: check what is item ?
        const v = this.widget[state];
        if (v) {
            url += '&' + state + '=' + v;
        }
        return url;
    }

    share() {
        const c = this.component.chart;

        let url = this.fs.getFiltersShareUrl();
        const part = url.split('#')[1];
        if (part && part.indexOf('?') === -1) {
            url += '?widget=' + this.widget.idx;
        } else {
            url += '&widget=' + this.widget.idx;
        }

        // TODO: check ehat is _elem ?
        let w, h;
        // if (this._elem && this._elem[0] && this._elem[0].offsetParent) {
        //     w = this._elem[0].offsetParent.offsetWidth;
        //     h = this._elem[0].offsetParent.offsetHeight;
        // }
        if (h) {
            url += '&height=' + h;
        }

        // Share button state
        url = this.appendShareState(url, 'isLegend');
        url = this.appendShareState(url, 'isTop');
        url = this.appendShareState(url, 'showZero');
        url = this.appendShareState(url, 'showValues');

        // Store hidden series
        if (c && c.series) {
            const hidden = c.series.map((s, i) => ({v: s.visible, i: i})).filter(s => !s.v);
            if (hidden.length) {
                url += '&hiddenSeries=' + hidden.map(s => s.i).join(',');
            }
        }

        let html = '<iframe style="border: none" src="' + url + '" ';
        if (w && h) {
            html = html + 'width="' + w + '" ';
            html = html + 'height="' + h + '" ';
        }
        html += '></iframe>';

        this.ms.show({
            title: 'Share Widget',
            component: TextAreaComponent,
            closeByEsc: true,
            onComponentInit: (c: TextAreaComponent) => {
                c.value = html;
            }
        });

    }


    /**
     * Widget resize callback
     */
    // TODO: on resize
    // onResize() {
    //     this.onResize();
    // }


    requestData() {
        if (!this.component) {
            return;
        }
        this.component.requestData();
    }

    /**
     * Apply filter callback
     */
    applyFilter(flt: any) {
        this.updateFiltersText();
        this.requestData();
    }


    // toggleFilter(idx: number) {
    //
    // }

    /**
     * Callback for moving widget horizontally
     * @param {undefined} a Not used
     * @param {undefined} b Not used
     * @param {object} this Scope
     */
    onMoveHorizontal(a, b) {
        // TODO: check dragging
        return;
        // if (!gridsterConfig.isDragging) {
        //     return;
        // }
        // if (!isNaN(this.item.row)) {
        //     var widgets = Storage.getWidgetsSettings(this.widget.dashboard, Connector.getNamespace());
        //     var k = this.widget.name;
        //     if (!widgets[k]) {
        //         widgets[k] = {};
        //     }
        //     widgets[k].col = this.item.col;
        //     Storage.setWidgetsSettings(widgets, this.widget.dashboard, Connector.getNamespace());
        // }
    }

    /**
     * Callback for moving widget vertically
     * @param {undefined} a Not used
     * @param {undefined} b Not used
     * @param {object} this Scope
     */
    onMoveVertical(a, b) {
        // TODO: implement
        // if (!gridsterConfig.isDragging) {
        //     return;
        // }
        // if (!isNaN(this.item.row)) {
        //     var widgets = Storage.getWidgetsSettings(this.widget.dashboard, Connector.getNamespace());
        //     var k = this.widget.name;
        //     if (!widgets[k]) {
        //         widgets[k] = {};
        //     }
        //     widgets[k].row = this.item.row;
        //     Storage.setWidgetsSettings(widgets, this.widget.dashboard, Connector.getNamespace());
        // }
    }

    /**
     * Callback for sizing widget horizontally
     * @param {undefined} a Not used
     * @param {undefined} b Not used
     * @param {object} this Scope
     */
    onResizeHorizontal(a, b) {
        // TODO: implement
        // if (!gridsterConfig.isResizing) {
        //     return;
        // }
        // if (!isNaN(this.item.sizeX)) {
        //     var widgets = Storage.getWidgetsSettings(this.widget.dashboard, Connector.getNamespace());
        //     var k = this.widget.name;
        //     if (!widgets[k]) {
        //         widgets[k] = {};
        //     }
        //     widgets[k].sizeX = this.item.sizeX;
        //     Storage.setWidgetsSettings(widgets, this.widget.dashboard, Connector.getNamespace());
        // }
    }

    /**
     * Callback for sizing widget vertically
     * @param {undefined} a Not used
     * @param {undefined} b Not used
     * @param {object} this Scope
     */
    onResizeVertical(a, b) {
        // TODO: implement
        // if (!gridsterConfig.isResizing) {
        //     return;
        // }
        // if (!isNaN(this.item.sizeY)) {
        //     var widgets = Storage.getWidgetsSettings(this.widget.dashboard, Connector.getNamespace());
        //     var k = this.widget.name;
        //     if (!widgets[k]) {
        //         widgets[k] = {};
        //     }
        //     widgets[k].sizeY = this.item.sizeY;
        //     Storage.setWidgetsSettings(widgets, this.widget.dashboard, Connector.getNamespace());
        // }
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

    getDesc(idx) {
        // TODO: implement;
        return null;
    }



    private createWidgetComponent(type?: string) {
        if (!this.container) {
            console.error(`Can't find container for widget: `, this.widget);
            return;
        }
        this.destroyComponent();
        this.container.clear();
        const t = this.wts.getClass(type || this.widget.type);
        if (t) {
            this.widget.isSupported = true;
            const factory = this.cfr.resolveComponentFactory<BaseWidget>(t as any);
            this.componentRef = this.container.createComponent<BaseWidget>(factory);
            this.component = this.componentRef.instance;
            this.component.widget = this.widget;
            this.component.model = this.model;
            this.component.createWidgetComponent = (type: string) => {
                this.createWidgetComponent(type)
            };
            // this.component.header = this.header;
            if (this.header) {
                this.header.widget = this.widget;
                this.header.loadButtons();
            }
        } else {
            this.widget.isSupported = false;
            this.showError(this.i18n.get('errWidgetNotSupported') + ': ' + this.widget.type);
        }
    }

    private destroyComponent() {
        if (!this.componentRef) { return; }
        this.componentRef.destroy();
    }

    /**
     * On header back button click event handler
     */
    onHeaderButtonBack() {
        if (!this.component) { return; }
        this.component.doDrillUp();
    }

    /**
     * On header reset click filter button click event handler
     */
    onResetClickFilter() {
        if (!this.component) { return; }
        this.component.resetClickFilter();
    }

    /**
     * On filter variable change handler
     */
    onFilterVariable(v: any) {
        if (!this.component) { return; }
        this.component.onVariableChange(v);
    }

    /**
     * On filter datasource changed handler
     */
    onFilterDatasource(item: any) {
        if (!this.component) { return; }
        this.component.onDataSourceChange(item);
    }

    /**
     * On action handler
     */
    onFilterAction(action: string) {
        if (!this.component) { return; }
        this.component.performAction(action);
    }

    onFilter(idx: number) {

    }
}
