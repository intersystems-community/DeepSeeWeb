import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';
import * as numeral from 'numeral';
import {IButtonToggle} from '../../../services/widget.service';

@Component({
    selector: 'dsw-tree-map',
    template: ''
})
export class TreeMapComponent extends BaseChartClass implements OnInit {
    private isPercent = true;
    private totalSum = 0;

    ngOnInit() {
        super.ngOnInit();
        this.totalSum = 0;

        // Check for percentage
        if (this.widget.overrides && this.widget.overrides[0] && this.widget.overrides[0].showPercentage === 0) this.isPercent = false;

        // Load isLegend option if exists
        if (this.hasOption("isLegend")) {
            this.isPercent = this.widget.isLegend;
        }
        const _this = this;
        const ex = {
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    animation: false
                },
                treemap: {
                    colorByPoint: true,
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            // Define custom label formatter
                            if (_this.isPercent && _this.totalSum) {
                                let percent = (this.point.value / _this.totalSum * 100).toFixed(2);
                                return `${this.point.caption} - ${percent}%`;
                            } else {
                                return `${this.point.caption}`;
                            }

                        }
                    }
                }
            },
            tooltip: {
                formatter: function () {
                    const cap = this.series.userOptions.caption;
                    const fmt = this.series.userOptions.format;
                    let v = this.point.value;
                    if (fmt) {
                        v = numeral(v).format(fmt);
                    }
                    return this.point.caption + "<br>" + cap + ": <b>" + v + '</b>';
                }
            }
        };

        this.us.mergeRecursive(this.chartConfig, ex);

        delete this.chartConfig.plotOptions?.series?.dataLabels;
    }


    onHeaderButton(bt: IButtonToggle) {
        if (bt.name === 'isLegend') {
            this.isPercent = bt.state;
            this.chart.redraw(false);
        } else {
            super.onHeaderButton(bt);
        }
    }

    parseData(data) {
        // this.chartConfig.series = [];
        let tempData = [];
        if (!data.Cols[0].tuples.length) return;

        if (data.Cols[0].tuples[0].children) {
            console.error("Data converter for this treemap chart not implemented!");
        } else {
            tempData = [];
            let total = 0;
            for (let i = 0; i < data.Data.length; i++) {
                total += parseFloat(data.Data[i]);
            }
            for (let i = 0; i < data.Cols[1].tuples.length; i++) {
                tempData.push({
                    caption: data.Cols[1].tuples[i].caption,
                    id: data.Cols[1].tuples[i].caption + "<br>" + parseFloat((parseFloat(data.Data[i] as any) / total * 100) as any).toFixed(2).toString() + "%",
                    value: parseFloat(data.Data[i]),
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
            this.addSeries({
                type: 'treemap',
                data: tempData,
                layoutAlgorithm: 'squarified',
                caption: cap,
                format: fmt,
                //layoutAlgorithm: 'strip',
                dataLabels: {
                    enabled: true
                }
            });
        }
        // this.updateChart();
    }
}
