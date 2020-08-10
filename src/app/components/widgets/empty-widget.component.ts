import {Component, OnInit} from '@angular/core';
import {BaseWidget} from './base-widget.class';
import {NAMESPACE} from '../../services/data.service';
import {IButtonToggle} from '../../services/widget.service';

@Component({
    selector: 'dsw-empty-widget',
    template: '',
})
export class EmptyWidgetComponent extends BaseWidget implements OnInit {
    isSpinner = false;

    ngOnInit() {
        this.widget.title = this.i18n.get("filters");
        this.widget.toolbar = true;
        this.widget.viewSize = this.getViewSize(); // viewSize - value in % to place filtes (can be 33, 50, 100)

    }

    requestData() {

    }

    onHeaderButton(btn: IButtonToggle) {
        switch (btn.name) {
            case 'setDefault': this.setFiltersToDefaults(); break;
            case 'byRows': this.setViewSize(100); break;
            case 'by2columns': this.setViewSize(50); break;
            case 'by3columns': this.setViewSize(33); break;
        }
    }

    /**
     * Sets all filters to its default values
     */
    setFiltersToDefaults() {
        for (let i = 0; i < this.model.filters.length; i++) {
            const flt = this.fs.getFilter(i);
            flt.isInterval = false;
            flt.isExclude = flt.defaultExclude;
            flt.fromIdx = -1;
            flt.toIdx = -1;
            flt.values.forEach(function(fv){
                fv.checked = fv.default === true;
            });
            this.fs.applyFilter(flt, true);
        }
        this.bs.broadcast('filterAll');
        // TODO: update text
        // this.updateFiltersText();
    }

    /**
     * Sets filter block size in percent. Used to switch different tile views of filter inputs
     * @param {number} n Size in percent(100, 50, 33)
     */
    setViewSize(n) {
        this.widget.viewSize = n;
        this.saveViewSize();
    }

    /**
     * Returns filter block size in percent
     * @returns {number} Size
     */
    getViewSize() {
        const widgets = this.ss.getWidgetsSettings(this.widget.dashboard);
        const n = this.widget.name;
        if (!widgets[n]) return 100;
        if (widgets[n].viewSize === undefined) return 100;
        return widgets[n].viewSize;
    }

    /**
     * Save filter block size to storage
     */
    saveViewSize() {
        const widgets = this.ss.getWidgetsSettings(this.widget.dashboard);
        const n = this.widget.name;
        if (!widgets[n]) widgets[n] = {};
        widgets[n].viewSize = this.widget.viewSize;
        this.ss.setWidgetsSettings(widgets, this.widget.dashboard);
    }
}
