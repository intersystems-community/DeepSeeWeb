import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {BaseChartClass} from './base-chart.class';
import * as numeral from 'numeral';
import {YAxisOptions} from 'highcharts';
import * as Highcharts from "highcharts/highstock";


@Component({
    selector: 'dsw-speedometer-chart',
    template: '<div #charts *ngFor="let c of confs"></div>',
    styles: [`
        :host {
            display: flex;
        }

        div {
            flex: 1 1 100%;
        }
    `]
})
export class SpeedometerChartComponent extends BaseChartClass implements OnInit {
    @ViewChildren('charts') chartsEl: QueryList<ElementRef>;
    confs: Highcharts.Options[] = [];
    private charts: Highcharts.Chart[] = [];

    ngOnInit() {
        super.ngOnInit();

        const ex = {
            title: {
                verticalAlign: 'bottom',
                style: {
                    fontFamily: 'Roboto Condensed'
                }
            },
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
                legend: {
                    enabled: false
                },
                series: {
                    dataLabels: {
                        enabled: true,
                        formatter: function(){
                            let v = this.point.y;
                            const fmt = this.series.userOptions.format || '#.##';
                            if (fmt) {
                                v = numeral(v).format(fmt.replace(',', '.'));
                            }
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

    ngAfterViewInit() {

    }

    createChart() {
        const els = this.chartsEl.toArray().map(e => e.nativeElement);
        this.charts = [];
        this.confs.forEach((conf, idx) => {
            conf.chart.renderTo = els[idx];
            this.charts.push(Highcharts.chart(conf));
        });
    }

    /**
     * Callback for chart data request
     * @param {object} result chart data
     */
    retrieveData(result) {
        let i;
        this.hideLoading();

        // Clean up previous data
        this.charts.forEach(chart => {
            while (chart.series.length > 0) {
                chart.series[0].remove();
            }
        });

        // Store current widget data
        this.widgetData = JSON.parse(JSON.stringify(result));

        if (result.Error) {
            this.showError(result.Error);
            return;
        }
        if (result) {
            if (!result.Cols) {
                return;
            }

            if (result.Cols[0].tuples.length === 0) {
                // cerate default count parameter
                if (result.Data.length !== 0) {
                    result.Cols[0].tuples.push({caption: this.i18n.get('count')});
                }
            }
            this.parseData(result);
        }
    }

    async parseData(data) {
        if (this.confs.length === 0) {
            for (let t = 0; t < data.Cols[0].tuples.length; t++) {
                this.confs.push(this.us.mergeRecursive({}, this.chartConfig));
                let caption = data.Cols[0].tuples[t].caption;
                const dp = this.widget.dataProperties[t];
                if (dp && dp.label && dp.label !== '$auto') {
                    caption = dp.label;
                }
                this.confs[t].title.text = caption;
            }
            this.cd.detectChanges();

            setTimeout(() => {
                this.createChart();
                this.parseData(data);
            });
            return;
        }

        for (let idx = 0; idx < data.Cols[0].tuples.length; idx++) {
            let v = data.Data[idx];
            if (!v) {
                v = 0;
            }
            this.clearSeries(this.charts[idx]);
            const yAxis = this.confs[idx].yAxis as YAxisOptions;
           /* yAxis.title = {
                text: data.Cols[0].tuples[idx].caption
            };*/
            if (parseFloat(v) < 1) {
                yAxis.min = 0;
                yAxis.max = 1;
            } else {
                if (parseInt(v, 10) === 0) {
                    yAxis.min = 0;
                    yAxis.max = 10;
                } else {
                    v = parseInt(v, 10);
                    const len = v.toString().length;
                    yAxis.max = Math.pow(10, len);
                    yAxis.min = 0;
                }
            }
            const dp = this.widget.dataProperties[idx];
            if (dp) {
                const min = parseFloat(dp.rangeLower as string);
                const max = parseFloat(dp.rangeUpper as string);
                if (!isNaN(min)) { yAxis.min = min; }
                if (!isNaN(max)) { yAxis.max = max; }

                let tmin = parseFloat(dp.thresholdLower as string);
                let tmax = parseFloat(dp.thresholdUpper as string);
                if (isNaN(tmin)) {
                    tmin = yAxis.min || 0;
                }
                if (isNaN(tmax)) {
                    tmax = yAxis.max || 0;
                }
                if (tmin < yAxis.min) {
                    tmin = yAxis.min;
                }
                if (tmax > yAxis.max) {
                    tmax = yAxis.max;
                }

                yAxis.plotBands = [];
                if (tmin !== yAxis.min) {
                    yAxis.plotBands.push({
                        from: yAxis.min,
                        to: tmin,
                        color: 'rgba(255, 0, 0, 0.4)',
                        /*thickness: '4%',
                        outerRadius: '100%',*/
                        zIndex: 5
                    });
                }
                if (tmax !== yAxis.max) {
                    yAxis.plotBands.push({
                        from: tmax,
                        to: yAxis.max,
                        color: 'rgba(255, 0, 0, 0.4)',
                        /*thickness: '4%',
                        outerRadius: '100%',*/
                        zIndex: 5
                    });
                }

                if (dp.targetValue) {
                    const tv = parseFloat(dp.targetValue as string);
                    yAxis.plotLines = [{
                        value: tv,
                        color: 'rgba(0, 180, 0, 0.4)',
                        width: 3,
                        // outerRadius: '100%',
                        zIndex: 5
                    }];
                }
                /*if (tmin !== yAxis.min || tmax !== yAxis.max) {

                }*/
            }

            let fmt = '';
            if (this.widget.properties && this.widget.properties.format) {
                fmt = this.widget.properties.format;
            }
            if (data.Cols[0].tuples[idx].format) {
                fmt = data.Cols[0].tuples[idx].format;
            }
            let caption = data.Cols[0].tuples[idx].caption;
            if (dp && dp.label && dp.label !== '$auto') {
                caption = dp.label;
            }
            this.addSeries({
                data: [data.Data[idx] || 0],
                name: caption,
                format: fmt
            }, this.charts[idx], this.confs[idx]);

            this.charts[idx].update(this.confs[idx]);
        }
    }

    /**
     * Callback for resize event
     */
    onResize() {
        super.onResize();
        this.charts.forEach(c => c.reflow());
    }
}


