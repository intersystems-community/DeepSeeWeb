import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';
import {SeriesPieDataLabelsOptionsObject} from 'highcharts';
import {IButtonToggle} from '../../../services/widget.service';
import * as Highcharts from "highcharts/highstock";

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
        let opt = {
            series: {
                allowPointSelect: true, stickyTracking: false,
            }
        } as any;
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

                            let percent = _this.formatNumber(this.point.percentage, _this.getDataPropByDataValue(this.series?.userOptions?.name)?.format || '#.##') + '%';
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
                            const fmt = t.series.options.format;
                            let val = t.y;

                            if (fmt) { val = _this.formatNumber(val, fmt); }
                            return t.key + ', ' + val;
                        }
                    },
                    point: {
                        events: {
                            legendItemClick: function() {
                                const path = this.path;
                                const name = this.name;
                                const isVisible = this.visible;

                                _this.chart.series.forEach(s => {
                                    s.data.forEach((point: any) => {
                                        if ((path && (point.path === path)) || (name && (point.name === name))) {
                                            if (point !== this) {
                                                point.update({
                                                    visible: !isVisible
                                                } as any);
                                            }
                                            if (isVisible) {
                                                point.setState('normal');
                                            } /*else {
                                                point.setState('hover');
                                            }*/
                                        }
                                    });
                                });
                            },
                            mouseOut: function() {
                                const relatedPoints = [];
                                const series = this.series;
                                const pIndex = this.index;

                                series.chart.series.forEach(s => {
                                    if (s !== series) {
                                        relatedPoints.push(s.points[pIndex]);
                                    }
                                });

                                relatedPoints.forEach(p => {
                                    p.setState('');
                                });
                            },
                            mouseOver: function() {
                                const relatedPoints = [];
                                const series = this.series;
                                const pIndex = this.index;

                                series.chart.series.forEach(s => {
                                    if (s !== series) {
                                        relatedPoints.push(s.points[pIndex]);
                                    }
                                });

                                relatedPoints.forEach(p => {
                                    p.setState('hover');
                                });
                            }
                        }
                    },

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

            // Highcharts issue with doubled legend. Need legend refresh after hidding datalables
            this.chart?.series.forEach((s, idx) => {
                if (idx !== 0) {
                    s.options.showInLegend = false;
                }
            });
            if (this.chart?.series.length > 1) {
                this.chart.legend.update(this.chartConfig.legend, true);
            }
        }
        super.onHeaderButton(bt);
    }

    addSeries(data, chart?: Highcharts.Chart, conf?: Highcharts.Options, redraw = false) {
        /*
          let count = 1;
        const totalSeries = this._currentData?.Cols[1]?.tuples?.length || this._currentData?.Cols[0]?.tuples?.length || 1;
        if (this._currentData?.Cols.length > 1) {
            count = this._currentData?.Cols[0]?.tuples?.length || 1;
        }
         */
        const count = this._currentData?.Cols[0]?.tuples?.length || 1;
        const totalSeries = this._currentData?.Cols[1]?.tuples?.length || 1;
        if (count !== 1) {
            const step = 100 / (count);
            const idx = this.chart.series.length;
            data.center = [(step / 2 + idx * step).toString() + '%', '50%'];
            if (idx > totalSeries) {
                data.showInLegend = false;
            }
           // data.size = (100 / count * 0.8).toString() + '%';
        }

        super.addSeries(data, chart, conf, redraw);
        if (this.chart.series.length > 1) {
            this.chart.series[this.chart.series.length - 1].options.showInLegend = false;
        }
    }

    onLegendItemHover(e: any) {
        super.onLegendItemHover(e);
        if (this.chart?.series?.length > 1) {
            this.chart?.series.forEach(s => {
                if (s !== e.series) {
                    s.setState('inactive', true);
                }
            });
        }

        this.chartConfig.plotOptions.series.point.events.mouseOver.call(e);
    }

    onLegendItemOut(e: any) {
        super.onLegendItemOut(e);
        if (this.chart?.series?.length > 1) {
            this.chart?.series.forEach(s => {
                if (s !== e.series) {
                    s.setState('normal', true);
                }
            });
        }
        this.chartConfig.plotOptions.series.point.events.mouseOut.call(e);
    }

    async parseData(data) {
        const d = await super.parseData(data);
        // TODO: temporary workaround. check after updating lib
        this.toggleLegend(this.widget.isLegend);
        return d;
    }
}
