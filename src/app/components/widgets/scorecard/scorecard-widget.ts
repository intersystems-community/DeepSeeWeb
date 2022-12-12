import {Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, ViewChildren} from '@angular/core';
import {BaseWidget, IWidgetDataProperties, IWidgetInfo} from '../base-widget.class';
import * as numeral from 'numeral';
import {dsw} from '../../../../environments/dsw';
import * as Highcharts from 'highcharts/highstock';
import {Subscription} from 'rxjs';
import {IButtonToggle} from '../../../services/widget.service';
import {ChartConfigComponent} from '../../ui/chart-config/chart-config.component';

interface IScorecardColumn {
    caption: string;
    columnNo: number;
    name: string;
}

@Component({
    selector: 'dsw-scorecard',
    templateUrl: './scorecard-widget.component.html',
    styleUrls: ['./scorecard-widget.component.scss']
})
export class ScorecardWidgetComponent extends BaseWidget implements OnInit, OnDestroy {
    @Input() widget: IWidgetInfo;

    columns: any[] = [];
    rows: any[] = [];
    data: (string | number)[][] = [];
    color: string;
    props: IWidgetDataProperties[];

    hasFooter = false;
    footerValues = [];

    private subColorsConfig: Subscription;
    private originalData: any[];

    ngOnInit(): void {
        super.ngOnInit();

        this.color = Highcharts.getOptions().colors[0] as string;
        if (this.tc && this.tc.hcColors) {
            this.color = this.tc.hcColors[0];
        }

        this.subColorsConfig = this.bs.subscribe('charts:update-colors', (tc) => this.updateColors(tc));

        this.prepareProps();
        if (!this.props?.length) {
            this.props = this.widget.overrides as any;
            const sc = this.widget.overrides.find(ov => ov._type === 'scoreCard');
            if (sc?.columns?.length) {
                this.props = sc.columns;
            }
        }
    }

    ngOnDestroy() {
        this.subColorsConfig.unsubscribe();
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
        this.rows = data.Cols[1].tuples;

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

    private updateColors(tc: any) {
        this.tc = tc;
        this.color = tc?.hcColors[0];
        if (this.originalData) {
            this.prepareData(this.originalData);
        }
        this.cd.detectChanges();
    }

    onHeaderButton(bt: IButtonToggle) {
        super.onHeaderButton(bt);
        switch (bt.name) {
            case 'chartConfig':
                this.showChartConfig();
                break;
        }
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

        this.sbs.sidebarToggle.next({
            component: ChartConfigComponent,
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

    getValue(data: any[], rowIndex: number, prop: IWidgetDataProperties): string | number {
        switch (prop.display) {
            case 'itemNo':
                return (rowIndex + 1).toString();

            case 'label': {
                return this.rows[rowIndex].caption;
            }

            case '':
            case 'value':
            case 'plotBox': {
                const fmt = prop.format;
                const isNumber = !isNaN(parseFloat(prop.dataValue as string));
                let v: string | number = prop.dataValue;
                if (!isNumber) {
                    const colIdx = this.getColumnIndex(prop);
                    if (colIdx === -1) {
                        v = 0;
                    } else {
                        v = data[rowIndex * this.columns.length + colIdx];
                    }
                }

                if (prop.display === 'plotBox') {
                    // Calc in % for plotbox
                    const min = prop.rangeLower as number || 0;
                    const max = prop.rangeUpper as number || 0;
                    if (max - min === 0) {
                        return 0;
                    }
                    return (v as number - min) / (max - min) * 100;
                } else {
                    return this.formatNumber(v, fmt);
                }
            }

            case 'trendLine': {
                const colIdx = this.getColumnIndex(prop);
                let v = '';
                if (colIdx !== -1) {
                    v = data[rowIndex * this.columns.length + colIdx];
                }

                return this.getSvgForTrendLine(prop, v);
            }
        }
        return 0;
    }


    private getColumnIndex(prop: IWidgetDataProperties): number {
        const colIdx = this.columns.findIndex(c => {
            if (c.dimension) {
                return c.dimension === prop.dataValue;
            }
            const regExp = /^Properties\(\"([^)]+)\"\)/;
            const matches = regExp.exec(c.valueID);
            return matches[1] === prop.dataValue;
        });
        return colIdx;
    }

    private prepareData(data: any[]) {
        this.data = [];
        for (let r = 0; r < this.rows.length; r++) {
            if (!this.data[r]) {
                this.data[r] = [];
            }
            for (let p = 0; p < this.props.length; p++) {
                this.data[r][p] = this.getValue(data, r, this.props[p]);
            }
        }
        this.prepareFooter();
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

    private getSvgForTrendLine(prop: IWidgetDataProperties, data: string): string {
        const h = 30;
        let values = [];
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
            console.log('gffd');
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
        const colIdx = this.getColumnIndex(this.props[propIndex]);
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
}
