import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {WidgetComponent} from '../base/widget/widget.component';
import {BaseWidget, IWidgetInfo} from '../base-widget.class';
import {CURRENT_NAMESPACE} from '../../../services/namespace.service';

declare const LightPivotTable: any;

@Component({
    selector: 'dsw-pivot',
    templateUrl: './pivot.component.html',
    styleUrls: ['./pivot.component.scss']
})
export class WPivotComponent extends BaseWidget implements OnInit, AfterViewInit, OnDestroy {
    private _oldMdx = '';
    @Input() widget: IWidgetInfo;
    isSpinner = false;


    ngOnInit() {
        super.ngOnInit();
        // TODO: broadcast
        // this..$on("print:" + this..item.$$hashKey, print);
        // this..item.onDrillDown = onDrillDown;
        // this..item.onDrillThrough = onDrillThrough;
        // this..item.drillUp = doDrillUp;

    }

    ngAfterViewInit() {
        this.createPivotTable();
    }

    ngOnDestroy() {
        // this.lpt.destroy();
        super.ngOnDestroy();
    }

    createPivotTable() {
        const setup = {
            initialData: this.widget.pivotData,
            container: this.el.nativeElement,
            pivotProperties: {},
            dataSource: {
                pivot: this.widget.dataSource,
                MDX2JSONSource: this.ds.url.substring(0, this.ds.url.length - 1),
                basicMDX: this.widget.pivotMdx || this.getMDX(),
                namespace: CURRENT_NAMESPACE,
                sendCookies: true
            },
            triggers: {
                drillDown: (p) => this.onDrillDown(p),
                back: (p) => this.onDrillDown(p),
                cellDrillThrough: () => this.onDrillThrough()
            },
            loadingMessageHTML: '<img src="assets/img/spinner.svg">',
            columnResizeAnimation: true,
            locale: this.i18n.current,
            hideButtons: true,
            formatNumbers: "#,###.##"
        };
        delete this.widget.pivotMdx;

        this.lpt = new LightPivotTable(setup);
        (window as any).lpt = this.lpt;
    }

    doDrillUp() {
        if (this.widget.isDrillthrough && this.restoreWidgetType) {
            this.widget.isDrillthrough = null;
            this.restoreWidgetType();
        } else {
            this.lpt.CONTROLS.back();
        }

        this.widget.backButton = this.lpt.DRILL_LEVEL !== 0;
    }

    onDrillThrough() {
        if (!this.canDoDrillthrough) {
            return false;
        }
        this._oldMdx = this.lpt.getActualMDX();
        this.widget.backButton = true;
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

        this.broadcastDependents(p.mdx);
    }

    /**
     * Requests pivot data
     */
    requestData() {
        if (this.lpt) {
            let newMdx = this.getMDX();
            if (this.lpt.isListing()) {
                delete this.lpt.CONFIG.initialData;
                if (newMdx.toLowerCase().substr(0, 12) !== 'drillthrough') {
                    newMdx = this.getDrillthroughMdx(newMdx);
                }
            }
            if (newMdx === '') {
                return;
            }
            if (this.drillFilter) {
                newMdx = newMdx + ' %FILTER ' + this.drillFilter;
            }
            this.broadcastDependents();
            if (this.lpt.getActualMDX() !== newMdx) {
                this.lpt.changeBasicMDX(newMdx);
            }
        }
    }

    /**
     * Resize callback
     */
    onResize() {
        if (this.lpt) {
            setTimeout(() => this.lpt.updateSizes(), 100);
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
