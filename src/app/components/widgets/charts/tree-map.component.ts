import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';
import * as numeral from 'numeral';
import {IButtonToggle} from '../../../services/widget.service';
import {XAxisOptions} from "highcharts";

@Component({
    selector: 'dsw-tree-map',
    template: ''
})
export class TreeMapComponent extends BaseChartClass implements OnInit {
    private isPercent = true;
    private totalSum = 0;
    private prevData = null;

    ngOnInit() {
        super.ngOnInit();
        this.totalSum = 0;

        // Check for percentage
        if (this.widget.overrides && this.widget.overrides[0] && this.widget.overrides[0].showPercentage === 0) { this.isPercent = false; }

        // Load isLegend option if exists
        /*if (this.hasOption('isLegend')) {
            this.isPercent = this.widget.isLegend;
        }*/
        const _this = this;
        const ex = {
            categories: ['fds'],
            legend: {
                enabled: this.widget.isLegend
            },
            plotOptions: {
                series: {
                    animation: false,
                    colorByPoint: true,
                    legendType: 'point'
                },
                treemap: {
                    // colorByPoint: true,
                    dataLabels: {
                        enabled: true,
                        // useHTML: true,
                        formatter() {
                            // Define custom label formatter
                            // if (_this.widget['btn.ShowPercents'] && _this.totalSum) {
                            if ( _this.totalSum) {
                                let percent = (this.point.value / _this.totalSum * 100);
                                percent = _this.formatNumber(percent, _this.getDataPropValue('percentageFormat') || '#.##');
                                return `${this.point.caption}<br>${percent}%`;
                            } else {
                                // const v = _this.formatNumber(this.point.value, '');
                                // return `${this.point.caption}<br>${v}`;
                                return `${this.point.caption}`;
                            }
                        }
                    }
                }
            },
            tooltip: {
                formatter() {
                    const cap = this.series.userOptions.caption;
                    const fmt = this.series.userOptions.format;
                    let v = this.point.value;
                    v = _this.formatNumber(v, fmt);
                    /*if (fmt) {
                        v = numeral(v).format(fmt);
                    }*/
                    return this.point.caption + '<br>' + cap + ': <b>' + v + '</b>';
                }
            }
        };

        this.us.mergeRecursive(this.chartConfig, ex);

        delete this.chartConfig.plotOptions?.series?.dataLabels;
    }


/*    onHeaderButton(bt: IButtonToggle) {
        if (bt.name === 'isLegend') {
            this.isPercent = bt.state;
            this.chart.redraw(false);
        } else {
            super.onHeaderButton(bt);
        }
    }*/

    async parseData(data) {
        this.prevData = data;

        if (data && data.Info) {
            this.dataInfo = data.Info;
        }

        // this.chartConfig.series = [];
        let tempData = [];
        if (!data.Cols[0].tuples.length) { return; }

        if (data.Cols[0].tuples[0].children) {
            console.error('Data converter for this treemap chart not implemented!');
        } else {
            // Make drilldown if there is only one item after filtering
            if (await this.checkForAutoDrill(data)) {
                return;
            }

            tempData = [];
            let total = 0;
            for (let i = 0; i < data.Data.length; i++) {
                total += parseFloat(data.Data[i]);
            }
            for (let i = 0; i < data.Cols[1].tuples.length; i++) {
                tempData.push({
                    caption: data.Cols[1].tuples[i].caption,
                    id: data.Cols[1].tuples[i].caption + '<br>' + parseFloat((parseFloat(data.Data[i] as any) / total * 100) as any).toFixed(2).toString() + '%',
                    value: parseFloat(data.Data[i]),
                    y: parseFloat(data.Data[i]),
                    path: data.Cols[1].tuples[i].path,
                    name: data.Cols[1].tuples[i].caption
                });
            }

            let cap = '';
            let fmt = '';
            if (data.Cols[0].tuples[0]) {
                cap = data.Cols[0].tuples[0].caption;
                fmt = data.Cols[0].tuples[0].format;
            }
            this.totalSum = data.Data.map(d => parseFloat(d) || 0).reduce((a, b) => a + b, 0);

            // const xAxis = this.chartConfig.xAxis as XAxisOptions;
            // xAxis.categories = ['fdsfds', 'fdsdfs'];

            this.addSeries({
                // type: 'treemap',
                data: tempData,
                name: '',
                layoutAlgorithm: 'squarified',
                caption: cap,
                format: fmt,
                // layoutAlgorithm: 'strip',
                dataLabels: {
                    enabled: true
                }
            }, undefined, undefined, true);
        }
        //this.updateChart(true);
    }

    setType(type) {
        this.clearSeries();
        /*this.chartConfig.chart.type = type;
        this.updateChart();*/
        super.setType(type);

        this.parseData(this.prevData);
    }
}
