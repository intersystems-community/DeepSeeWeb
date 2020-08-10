import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';
import * as numeral from 'numeral';
import {YAxisOptions} from 'highcharts';


@Component({
    selector: 'dsw-speedometer-chart',
    template: ''
})
export class SpeedometerChartComponent extends BaseChartClass implements OnInit {

    ngOnInit() {
        super.ngOnInit();

        const ex = {
            tooltip: {
                enabled: false
            },
            chart: {
                plotBackgroundColor: null,
                plotBackgroundImage: null,
                plotBorderWidth: 0,
                plotShadow: false
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        formatter: function(){
                            let v = this.point.y;
                            const fmt = this.series.userOptions.format;
                            if (fmt) { v = numeral(v).format(fmt); }
                            return v;
                        }
                    }
                }
            },
            pane: {
                startAngle: -150,
                endAngle: 150,
                background: [{
                    backgroundColor: {
                        linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, '#FFF'],
                            [1, '#333']
                        ]
                    },
                    borderWidth: 0,
                    outerRadius: '109%'
                }, {
                    backgroundColor: {
                        linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, '#333'],
                            [1, '#FFF']
                        ]
                    },
                    borderWidth: 1,
                    outerRadius: '107%'
                }, {
                    // default background
                }, {
                    backgroundColor: '#DDD',
                    borderWidth: 0,
                    outerRadius: '105%',
                    innerRadius: '103%'
                }]
            }
        };
        this.chartConfig.yAxis = {
            minorTickInterval: 'auto',
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: 'inside',
            minorTickColor: '#666',
            //tickPixelInterval: 100,
            //tickInterval: 1,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666'
        };

        this.us.mergeRecursive(this.chartConfig, ex);
    }

    parseData(data) {
        let idx = 0;
        if (data.Cols[0].tuples.length > 1) idx = 1;
        let v = data.Data[idx];
        if (!v) { v = 0; }
        this.clearSeries();
        const yAxis = this.chartConfig.yAxis as YAxisOptions;
        yAxis.title = {text: data.Cols[0].tuples[idx].caption};
        if (parseInt(v, 10) === 0) {
            yAxis.min = 0;
            yAxis.max = 10;
        } else {
            v = parseInt(v, 10);
            const len = v.toString().length;
            yAxis.max = Math.pow(10, len);
            yAxis.min = 0;//Math.pow(10, len - 1);
            //$scope.chartConfig.yAxis.min = v - parseInt(v / 2);
            //$scope.chartConfig.yAxis.max = v + parseInt(v / 2);
        }
        this.addSeries({
            data: [data.Data[idx] || 0],
            name: data.Cols[0].tuples[idx].caption,
            format: data.Cols[0].tuples[idx].format || ''
        });
        this.updateChart();
    }
}
