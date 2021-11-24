import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';
import * as numeral from 'numeral';
import {XAxisOptions, YAxisOptions} from 'highcharts';

@Component({
    selector: 'dsw-line-chart',
    template: ''
})
export class XyChartComponent extends BaseChartClass implements OnInit {

    ngOnInit() {
        super.ngOnInit();
        this.chartConfig.chart.zoomType = 'xy';
        this.chartConfig.plotOptions = {
            series: {
                lineWidth: 3,
                marker: {
                    enabled: true
                }
            }
        };
        const _this = this;
        this.chartConfig.tooltip = {
            formatter() {
                const opt =  this.series.userOptions as any;
                const fmt1 = opt.format1;
                const fmt2 = opt.format2;
                let v1 = this.y;
                let v2 = this.x;
                if (fmt1) {
                    v1 = numeral(v1).format(fmt1);
                }
                if (fmt2) {
                    v2 = numeral(v2).format(fmt2);
                }
                const yAxis = (_this.chartConfig.yAxis as YAxisOptions);
                const xAxis = (_this.chartConfig.xAxis as XAxisOptions);
                return yAxis.title.text + ':<b>' + v1 + '</b><br/>' + xAxis.title.text + ':<b>' + v2 + '</b>';
            }
        };
        this.updateChart();
    }

    async parseData(data) {
        let fmt1 = '';
        let fmt2 = '';

        if (data.Cols[0].tuples.length >= 1) {
            (this.chartConfig.xAxis as YAxisOptions).title.text = data.Cols[0].tuples[0].caption;
            fmt1 = data.Cols[0].tuples[0].format;
        }
        if (data.Cols[0].tuples.length >= 2) {
            (this.chartConfig.yAxis as XAxisOptions).title.text = data.Cols[0].tuples[1].caption;
            fmt1 = data.Cols[0].tuples[1].format;
        }
        this.chartConfig.series = [];
        const tempData = [];

        if (data.Cols[0].tuples[0].children) {
            this.showError('Data converter for this xy chart not implemented!');
        } else {
            for (let i = 0; i < data.Cols[1].tuples.length; i++) {
                tempData.push([parseFloat(data.Data[i * 2]), parseFloat(data.Data[i * 2 + 1])]);
            }
            this.addSeries({
                data: tempData,
                name: '',
                format1: fmt1,
                fotmat2: fmt2
            });

            (this.chartConfig.xAxis as XAxisOptions).tickInterval = Math.round((tempData[tempData.length - 1][0] - tempData[0][0]) / 10);
        }
        this.updateChart(true);
    }
}
