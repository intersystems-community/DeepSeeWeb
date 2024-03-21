import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';
import * as numeral from 'numeral';
import {YAxisOptions} from 'highcharts';
import {SpeedometerChartComponent} from './speedometer-chart.component';


@Component({
    template: ''
})
export class FuelGaugeChartComponent extends SpeedometerChartComponent implements OnInit {

    ngOnInit() {
        super.ngOnInit();

        const ex = {
            pane: [{
                startAngle: -45,
                endAngle: 45,
                background: null,
                center: ['50%', '90%'],
                size: 300
            }],
            plotOptions: {
                gauge: {
                    dial: {
                        baseLength: '0%',
                        baseWidth: 5,
                        radius: '110%'
                    }
                }
            },
            tooltip: {
                formatter: function (this: any) {
                    let v = this.point.y;
                    const fmt = this.series.userOptions.format;
                    if (fmt) { v = numeral(v).format(fmt); }
                    return v;
                }
            }
        };
        this.chartConfig.yAxis = {
            minorTickPosition: 'outside',
            tickPosition: 'outside',
            labels: {
                distance: 20
            }

        };

        this.us.mergeRecursive(this.chartConfig, ex);
    }

    // parseData(data) {
    //     let idx = 0;
    //     if (data.Cols[0].tuples.length > 1) { idx = 1; }
    //     let v = data.Data[idx];
    //     if (!v) { v = 0; }
    //     this.clearSeries();
    //     const yAxis = this.chartConfig.yAxis as YAxisOptions;
    //     yAxis.title = {text: data.Cols[0].tuples[idx].caption};
    //     if (parseInt(v) === 0) {
    //         yAxis.min = 0;
    //         yAxis.max = 10;
    //     } else {
    //         v = parseInt(v);
    //         const len = v.toString().length;
    //         yAxis.max = Math.pow(10, len);
    //         yAxis.min = 0;//Math.pow(10, len - 1);
    //         //$scope.chartConfig.yAxis.min = v - parseInt(v / 2);
    //         //$scope.chartConfig.yAxis.max = v + parseInt(v / 2);
    //     }
    //     this.addSeries({
    //         data: [data.Data[idx] || 0],
    //         name: data.Cols[0].tuples[idx].caption,
    //         dataLabels: {enabled: false},
    //         format: data.Cols[0].tuples[idx].format || ""
    //     });
    //     this.updateChart();
    // }
}
