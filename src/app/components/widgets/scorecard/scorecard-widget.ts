import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseWidget} from '../base-widget.class';
import Highcharts from 'highcharts/highstock';
import {Subscription} from 'rxjs';
import {IButtonToggle} from '../../../services/widget.service';
import {IWidgetDataProperties, IWidgetDesc} from "../../../services/dsw.types";


interface IScorecardColumn {
    caption: string;
    columnNo: number;
    name: string;
}

@Component({
    selector: 'dsw-scorecard',
    templateUrl: './scorecard-widget.component.html',
    styleUrls: ['./scorecard-widget.component.scss'],
    standalone: true,
    imports: []
})
export class ScorecardWidgetComponent extends BaseWidget implements OnInit, OnDestroy {
    @Input() widget: IWidgetDesc = {} as IWidgetDesc;

    columns: any[] = [];
    rows: any[] = [];
    data: (string | number)[][] = [];
    targets: (string | number)[][] = [];
    color = '';
    props: IWidgetDataProperties[] = [];

    hasFooter = false;
    footerValues: string[] = [];
    private totalByColumn: { [key: string]: number } = {};

    private subColorsConfig?: Subscription;
    private originalData: any[] = [];

    ngOnInit(): void {
        super.ngOnInit();
        this.color = Highcharts.getOptions().colors?.[0] as string;
        if (this.tc && this.tc.hcColors) {
            this.color = this.tc.hcColors[0];
        }

        this.subColorsConfig = this.bs.subscribe('charts:update-colors', (tc) => this.updateColors(tc));

        this.prepareProps();
        if (!this.props?.length) {
            if (this.override?.columns?.length) {
                this.props = this.override.columns;
            }
        }
    }

    ngOnDestroy() {
        this.subColorsConfig?.unsubscribe();
        super.ngOnDestroy();
    }

    /**
     * Fills widget with data retrieved from server
     * @param {object} result Result of MDX query
     */
    retrieveData(data) {
        super.retrieveData(data);
        if (data.Error) {
            return;
        }

        this.originalData = data.Data;
        this.columns = data.Cols[0].tuples;
        this.rows = data.Cols[1]?.tuples || [{}];

        this.prepareData(data.Data);
        this.cd.detectChanges();
    }

    prepareProps() {
        this.props = this.widget.dataProperties;
        if (!this.props) {
            return;
        }

        this.props.forEach(p => p.label = p.label.replace('\\n', '\n'));
    }

    onHeaderButton(bt: IButtonToggle) {
        super.onHeaderButton(bt);
        switch (bt.name) {
            case 'chartConfig':
                this.showChartConfig();
                break;
        }
    }

    getValue(data: any[], rowIndex: number, prop: IWidgetDataProperties, _min?: number, _max?: number): string | number {
        switch ((prop.display || '')) {
            case 'itemNo':
                return (rowIndex + 1).toString();

            case 'label': {
                return this.rows[rowIndex].caption;
            }

            case '':
            case 'value':
            case 'plotBox': {
                const fmt = prop.format;
                /* if (fmt?.charAt(0) === '%') {
                     // fmt = '#.#';
                 }*/
                let v: string | number = this.getPropValue(data, rowIndex, prop);

                if (prop.display === 'plotBox') {
                    // Calc in % for plotbox
                    let min = prop.rangeLower as number || 0;
                    let max = prop.rangeUpper as number || 0;
                    if (_min !== undefined) {
                        min = _min;
                    }
                    if (_max !== undefined) {
                        max = _max;
                    }

                    if (prop.showAs === 'target%') {
                        return parseFloat(v as any) / parseFloat(this.getPropValue(data, rowIndex, prop, 'targetValue') as any) * 100;
                    }

                    if (max - min === 0) {
                        return 0;
                    }
                    return (v as number - min) / (max - min) * 100;
                } else {
                    if (v === '') {
                        return '';
                    }
                    if (prop.showAs === 'target%') {
                        const targetV = this.getPropValue(data, rowIndex, prop, 'targetValue');
                        return this.formatNumber((v as number) / (targetV as number), fmt);
                    }
                    if (prop.showAs === 'sum%') {
                        return this.formatNumber((v as number) / this.totalByColumn[prop.dataValue], (fmt || '#.##%'));
                    }
                    return this.formatNumber(v, fmt);
                }
            }

            case 'trendLine': {
                const colIdx = this.getColumnIndex(prop.dataValue as string);
                let v = '';
                if (colIdx !== -1) {
                    v = data[rowIndex * this.columns.length + colIdx];
                }

                return this.getSvgForTrendLine(prop, v);
            }
        }
        return 0;
    }

    prepareFooter() {
        this.hasFooter = this.props.some(p => p.summary === 'sum');
        this.footerValues = [];
        if (!this.hasFooter) {
            return;
        }
        for (let p = 0; p < this.props.length; p++) {
            const fmt = this.props[p].format;
            const op = this.props[p].summary;
            this.footerValues[p] = '';
            if (op) {
                this.footerValues[p] = this.formatNumber(this.calcTotal(p, op), fmt);
            }
        }
    }

    private updateColors(tc: any) {
        this.tc = tc;
        this.color = tc?.hcColors[0];
        if (this.originalData) {
            this.prepareData(this.originalData);
        }
        this.cd.detectChanges();
    }

    /**
     * Shows chart config on sidebar
     */
    private showChartConfig() {
        const name = this.widget.name;
        const widgetsSettings = this.ss.getWidgetsSettings(this.widget.dashboard) || {};
        const save = () => {
            this.ss.setWidgetsSettings(widgetsSettings, this.widget.dashboard);
        };

        // Create settings if not exists
        if (!widgetsSettings[name]) {
            widgetsSettings[name] = {};
        }
        // Create theme if not exists
        if (!widgetsSettings[name].themeColors) {
            widgetsSettings[name].themeColors = {};
        }

        this.sbs.showComponent({
            component: import('./../../ui/chart-config/chart-config.component'),
            inputs: {
                appearance: {
                    showSeries: [true, false, false, false, false, false, false, false, false, false],
                    showBackground: false,
                    showLines: false,
                    showText: false,
                    showBorder: false
                },
                widgetSettings: widgetsSettings[name],
                onSave: save,
                onUpdate: tc => this.updateColors(tc)
            }
        });
    }

    private getPropValue(data: any[], rowIndex: number, prop: IWidgetDataProperties, valueToGet = 'dataValue') {
        const isNumber = !isNaN(parseFloat(prop[valueToGet] as string));
        let v: string | number = prop[valueToGet];
        if (!isNumber) {
            const colIdx = this.getColumnIndex(prop[valueToGet]);
            if (colIdx === -1) {
                v = 0;
            } else {
                v = data[rowIndex * this.columns.length + colIdx];
            }
        }
        return v;
    }

    private getColumnIndex(dimension: string): number {
        const colIdx = this.columns.findIndex(c => {

            if (c.dimension) {
                const d = dimension.split('/');
                return d.includes(c.dimension);
            }
            const regExp = /^Properties\(\"([^)]+)\"\)/;
            const matches = regExp.exec(c.valueID);
            return matches?.[1] === dimension;
        });
        return colIdx;
    }

    private prepareData(data: any[]) {
        // Calc min and max for all columns if needed
        const extremes: any[] = [];
        for (let p = 0; p < this.props.length; p++) {
            let min;
            let max;
            if (this.props[p].rangeLower !== undefined && this.props[p].rangeLower !== '') {
                min = this.props[p].rangeLower;
            }
            if (this.props[p].rangeUpper !== undefined && this.props[p].rangeUpper !== '') {
                max = this.props[p].rangeUpper;
            }
            if (min !== undefined && max !== undefined && !isNaN(min) && !isNaN(max)) {
                extremes.push({min, max});
                continue;
            }

            if (this.props[p].display === 'plotBox') {
                const colIdx = this.getColumnIndex(this.props[p].dataValue as string);
                const d = data.filter((da, idx) => {
                    return (idx + colIdx) % this.columns.length === 0;
                });
                max = Math.max(...d);
                min = Math.min(...d);
            }
            min = 0;

            extremes.push({min, max});

            if (!this.props[p].rangeLower) {
                this.props[p].rangeLower = min;
            }
            if (!this.props[p].rangeUpper) {
                this.props[p].rangeUpper = max;
            }
        }

        this.preparePercentageSums(data);

        this.data = [];
        this.targets = [];
        for (let r = 0; r < this.rows.length; r++) {
            if (!this.data[r]) {
                this.data[r] = [];
                this.targets[r] = [];
            }
            for (let p = 0; p < this.props.length; p++) {
                let min = extremes[p].min;
                let max = extremes[p].max;
                if (this.props[p].rangeLower && (typeof this.props[p].rangeLower === 'string')) {
                    min = this.getPropValue(data, r, this.props[p], 'rangeLower');
                }
                if (this.props[p].rangeUpper && (typeof this.props[p].rangeUpper === 'string')) {
                    max = this.getPropValue(data, r, this.props[p], 'rangeUpper');
                }
                this.data[r][p] = this.getValue(data, r, this.props[p], min, max);
                if (this.props[p].showAs !== 'target%' && this.props[p].targetValue && (max - min !== 0)) {
                    let percent = 100 * 100;
                    /*if (this.props[p].showAs === 'target%') {
                        percent = 100;
                    }*/
                    this.targets[r][p] = percent * 1 / (this.data[r][p] as number) * (this.getPropValue(data, r, this.props[p], 'targetValue') as number - min) / (max - min);
                }
            }
        }

        this.prepareFooter();
    }

    private getSvgForTrendLine(prop: IWidgetDataProperties, data: string): string {
        const h = 30;
        let values: number[] = [];
        if (typeof data === 'string') {
            values = data.split(',').map(v => {
                if (!v) {
                    return 0;
                }
                const value = parseFloat(v);
                if (isNaN(value)) {
                    return 0;
                }
                return value;
            });
        } else if (typeof data === 'number') {
            values = [data];
        } else if (Array.isArray(data)) {

        }
        const max = Math.max(...values);
        const min = Math.min(...values);

        const w = (values.length - 1) * 4;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}px" height="${h + 10}px" viewBox="0 0 ${w}px ${h + 10}px">
                        <path vector-effect="non-scaling-stroke" stroke-width="2" stroke="${this.color}" fill="none" d="`;

        let x = 0;
        for (let i = 0; i < values.length; i++) {
            let y = parseFloat(values[i] as any || '0');
            y = 5 + h - y / (max - min) * h;
            if (i === 0) {
                svg += `M ${x} ${y} `;
            } else {
                svg += `L ${x} ${y} `;
            }
            x += 4;
        }

        svg += `"/></svg>`;
        return this.san.bypassSecurityTrustUrl('data:image/svg+xml;base64,' + btoa(svg)) as any;
    }

    private calcTotal(propIndex: number, op: string) {
        const colIdx = this.getColumnIndex(this.props[propIndex].dataValue as string);
        if (colIdx === -1) {
            return 0;
        }
        let total = 0;
        for (let r = 0; r < this.rows.length; r++) {
            total += parseFloat(this.originalData[r * this.columns.length + colIdx]);
        }
        if (op === 'avg') {
            total = total / this.rows.length;
        }
        return total;
    }

    private preparePercentageSums(data: any) {
        this.totalByColumn = {};
        if (!this.override) {
            return;
        }
        const cols = this.override.columns?.filter(c => c.showAs === 'sum%');
        if (!cols?.length) {
            return;
        }
        cols.forEach(c => {
            const idx = this.columns.findIndex(co => co.dimension === c.dataValue);
            this.totalByColumn[c.dataValue] = data.reduce((partialSum, a, index) => {
                if (index % this.columns.length !== idx) {
                    return partialSum;
                }
                if (a === '') {
                    return partialSum;
                }
                const v = parseFloat(a);
                if (isNaN(v)) {
                    return partialSum;
                }
                return partialSum + v;
            }, 0);
        });
    }
}
