import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';

@Component({
    selector: 'dsw-area-chart',
    template: ''
})
export class BullseyeChartComponent extends BaseChartClass implements OnInit {

    ngOnInit(): void {
        super.ngOnInit();
        this.widget.isBtnZero = true;
        this.widget.isBtnValues = true;

        const ex = {
            plotOptions: {
                series: {
                    cursor: null,
                    point: {
                        events: {
                            click: null
                        }
                    }
                },
                pie: {
                    allowPointSelect: false,
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        connectorColor: '#000000',
                        formatter: function() {
                            return '<b>' + this.point.name + '</b>: ' + this.series.options.size;
                        }
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    return this.key + ': <b>' + this.y + '</b><br/>';
                }
            }
        };
        this.us.mergeRecursive(this.chartConfig, ex);
    }

    parseData(data) {
        const values = [];

        this.clearSeries();
        let maxValue =  Math.max.apply(null, data.Data);
        for (let d = 0; d < data.Cols[1].tuples.length; d++) {
            values.push([data.Cols[1].tuples[d].caption, data.Data[d]]);

            this.addSeries({
                innerSize: '0%',
                size: Math.floor(data.Data[d] / maxValue * 100).toString() + '%',
                data: [[data.Cols[1].tuples[d].caption, data.Data[d]]],
                borderWidth: 2
            });
        }
        this.updateChart();
    }

}
