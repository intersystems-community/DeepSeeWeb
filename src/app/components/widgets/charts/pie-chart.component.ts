import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';
import {SeriesPieDataLabelsOptionsObject} from 'highcharts';
import {IButtonToggle} from '../../../services/widget.service';

@Component({
    selector: 'dsw-line-chart',
    template: ''
})
export class PieChartComponent extends BaseChartClass implements OnInit {


    ngOnInit() {
        super.ngOnInit();
        // $scope.item.toggleLegend = toggleLegend;
        // $scope.item.toggleValues = toggleValues;
        this.widget.isBtnValues = true;
        //this.widget.noToggleLegend = true;
        let opt = {series: {allowPointSelect: true, stickyTracking: false}} as any;
        if (!this.chartConfig.plotOptions) {
            this.chartConfig.plotOptions = {};
        }
        this.us.mergeRecursive(this.chartConfig.plotOptions, opt);

        if (this.widget.type === 'donutChart' || this.widget.type === 'donutChart3D') {
            opt = {
                plotOptions: {
                    pie: {
                        innerSize: '20%'
                    }
                }
            };
            this.us.mergeRecursive(this.chartConfig, opt);
        }
        if (this.widget.type === 'pieChart3D' || this.widget.type === 'donutChart3D') {
            opt = {
                chart: {
                    options3d: {
                        enabled: true,
                        alpha: 55,
                        beta: 0
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        depth: 35
                    }
                }
            };

            this.us.mergeRecursive(this.chartConfig, opt);
        }

        const _this = this;
        const po = {
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        formatter: function() {
                            const ov = _this.override;
                            /* jshint ignore:start */
                            const t: any = this;
                            /* jshint ignore:end */
                            const fmt = ov?.valueLabelFormat || (t.series.options as any).format;

                            let name = this.point.name;
                            let value = _this.formatNumber(this.y, fmt);
                            if (!_this.widget.showValues) {
                                value = '';
                            }

                            if (_this.widget['btn.ShowAnnotations'] === false) {
                                name = '';
                            }

                            let percent = _this.formatNumber(this.point.percentage, _this.getDataPropValue('percentageFormat') || '#.##') + '%';
                            if (!_this.widget['btn.ShowPercents']) {
                                percent = '';
                            }


                            return [name, value, percent].filter(i => i).join(', ');
                        }
                    },
                    showInLegend: true
                },
                series: {
                    dataLabels: {
                        formatter: function() {
                            /* jshint ignore:start */
                            const t = this;
                            /* jshint ignore:end */
                            let fmt = t.series.options.format;
                            let val = t.y;

                            if (fmt) { val = _this.formatNumber(val, fmt); }
                            return t.key + ", " + val;
                        }
                    }
                }
            }
        };
        this.us.mergeRecursive(this.chartConfig, po);

        if (!this.chartConfig.plotOptions.series.dataLabels) {
            this.chartConfig.plotOptions.series.dataLabels = {};
        }
        (this.chartConfig.plotOptions.pie.dataLabels as SeriesPieDataLabelsOptionsObject).enabled = this.isValuesVisible();
        // (this.chartConfig.plotOptions.pie.dataLabels as SeriesPieDataLabelsOptionsObject).enabled = this.widget.isLegend;
        // this.chartConfig.plotOptions.series.dataLabels.enabled = this.widget.isLegend;

        if (!this.widget.showValues) {
           //  delete this.chartConfig.plotOptions.series.dataLabels.formatter;
            // delete this.chartConfig.plotOptions.pie.dataLabels.formatter;
        }
        this.updateChart(true, true);
    }

    isValuesVisible(): boolean {
        return this.widget.showValues || this.widget['btn.ShowAnnotations'];
    }

    // toggleLegend(state: boolean) {
    //     if (this.chart) {
    //         this.chartConfig.plotOptions.series.dataLabels = {
    //             enabled: this.widget.isLegend
    //         };
    //         this.updateChart();
    //     }
    // }

    onHeaderButton(bt: IButtonToggle) {
        if (bt.name === 'ShowValues' || bt.name === 'btn.ShowAnnotations' || bt.name === 'btn.ShowPercents') {
            (this.chartConfig.plotOptions.pie.dataLabels as SeriesPieDataLabelsOptionsObject).enabled = this.isValuesVisible();
            this.updateChart(true);
        }
        super.onHeaderButton(bt);
    }
}
