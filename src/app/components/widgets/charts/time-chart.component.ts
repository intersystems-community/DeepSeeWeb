import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';
import {YAxisOptions} from 'highcharts';


@Component({
    selector: 'dsw-line-chart',
    template: ''
})
export class TimeChartComponent extends BaseChartClass implements OnInit {

    ngOnInit() {
        super.ngOnInit();
        this.widget.isBtnValues = true;

        const _this = this;

        /**
         * Time chart tooltip formatter
         * @returns {string} formatted value
         */
        function defaultTimechartTooltipFormatter() {
            let a;
            let fmt;
            let val;
            /* jshint ignore:start */
            const t = this;
            /* jshint ignore:end */

            const date = new Date(t.x);
            let dateStr = date.toLocaleDateString();
            if (date.getHours() !== 0 && date.getMinutes() !== 0 && date.getSeconds() !== 0) {
                dateStr += ' ' + date.toLocaleTimeString();
            }

            if (t.series) {
                fmt = t.series.options.format;
                val = t.y;
                //if (fmt) val = numeral(val).format(fmt);
                val = _this.formatNumber(val, fmt);
                a = '<b>' + dateStr + '</b><br><span style="color:' + t.series.color + '">\u25CF</span>' + t.series.name + ':<b> ' + val;
                return a;
            } else {
                a = '<b>' + dateStr + '</b><br>';
                for (let i = t.points.length - 1; i > -1; i--) {
                    fmt = t.points[i].series.options.format;
                    val = t.points[i].y;
                    //if (fmt) val = numeral(val).format(fmt);
                    val = _this.formatNumber(val, fmt);
                    a += '<span style="color:' + t.points[i].series.color + '">\u25CF</span>' + t.points[i].series.name + ':<b> ' + val + '<br>';
                }
                return a;
            }
        }

        const opt = {
            options: {
                chart: {
                    zoomType: 'x'
                },
                tooltip: {
                    formatter: defaultTimechartTooltipFormatter
                },
                navigator: {
                    enabled: true
                },
                scrollbar: {
                    enabled: false
                }
            },
            series: [],
            useHighStocks: true,
            loading: true
        };

        this.us.mergeRecursive(this.chartConfig, opt);
    }


    parseData(data) {
        if (data && data.Info) {
            this.dataInfo = data.Info;
        }
        //if (_this.chart) _this.chart.xAxis[0].setExtremes(null, null, null, null, null);
        //if (_this.chart) _this.chart.xAxis[1].setExtremes(null, null, null, null, null);
        (this.chartConfig.yAxis as YAxisOptions).min = this.getMinValue(data.Data);
        //config.yAxis.max = ChartBase.getMaxValue(data.Data);
        this.clearSeries();
        let tempData = [];
        //var minDate = Number.POSITIVE_INFINITY;
        //var maxDate = Number.NEGATIVE_INFINITY;
        let da;
        let i;

        if (data.Cols[0].tuples[0].children) {
            let k = 0;
            for (let t = 0; t < data.Cols[0].tuples.length; t++) {
                for (let c = 0; c < data.Cols[0].tuples[t].children.length; c++) {
                    tempData = [];
                    for (let d = 0; d < data.Cols[1].tuples.length; d++) {
                        da = this.convertDateFromCache(this.extractValue(data.Cols[1].tuples[d].path));//this.getDate(data.Cols[1].tuples[i].caption);
                        tempData.push([
                            da,
                            +data.Data[data.Cols[0].tuples.length * data.Cols[0].tuples[t].children.length * d + t * data.Cols[0].tuples[t].children.length + c] || 0
                        ]);
                        if (tempData[tempData.length - 1][1] === '') {
                            tempData[tempData.length - 1][1] = null;
                        }
                        k++;
                    }
                    this.addSeries({
                        data: tempData,
                        name: data.Cols[0].tuples[t].caption + '/' + data.Cols[0].tuples[t].children[c].caption,
                        format: data.Cols[0].tuples[t].format
                    });
                }
            }
        } else {
            for (let j = data.Cols[0].tuples.length - 1; j >= 0; j--) {
                tempData = [];
                for (i = 0; i < data.Cols[1].tuples.length; i++) {
                    da = this.convertDateFromCache(this.extractValue(data.Cols[1].tuples[i].path));//this.getDate(data.Cols[1].tuples[i].caption);
                    let value = +data.Data[i * data.Cols[0].tuples.length + j];
                    if (value !== undefined) {
                        tempData.push([da, value || 0]);
                    }
                }

                this.addSeries({
                    data: tempData,
                    name: data.Cols[0].tuples[j].caption,
                    format: data.Cols[0].tuples[j].format
                });
            }
        }

        // Due bug in timechart we need manually update navigator and axis extremes after data refresh
        // if ((this.chart) && (this.chartConfig.series.length !== 0) && (this.chart.xAxis)) {
        //     for (i = 0; i < this.chart.xAxis.length; i++) {
        //         this.chart.xAxis[i].setExtremes();
        //     }
        //     let nav: any = this.chart.get('highcharts-navigator-series');
        //     if (nav) {
        //         // nav.setData(this.chartConfig.series[0].data);
        //         nav.setData(this.chart.series[0].data);
        //     }
        // }

        this.initFormatForSeries(data);

        this.updateChart(true);
    }


    /**
     * Adds days to date
     * @param {Date} date Date
     * @param {number} days Days to att
     * @returns {Date} Resulting date
     */
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(date.getDate() + days);
        return result;
    }

    /**
     * Extract value from path
     * @param {string} path Path like "&[324]"
     * @returns {string} Extracted value like "324"
     */
    extractValue(path) {
        const idx = path.indexOf("&[");
        if (idx == -1) return "";
        return path.substring(idx + 2, path.length - 1);
    }

    /**
     * Converts retrieved from mdx2json date to JS date format. Used as utility by convertDateFromCache
     * @param {string} str Date as string
     * @returns {number} Date as number
     */
    getDate(str) {
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

        let d = Date.parse(str);
        if (!isNaN(d)) return d;
        if (str.split("-").length == 2) {
            const parts = str.split("-");
            const idx = months.indexOf(parts[0].toLowerCase());
            if (idx != -1) {
                return Date.parse((idx+1).toString() + "/01/" + parts[1]);
            }
        } else
        if (str.split(" ").length == 2) {
            //like 2015-01-07 05
            const timeParts = str.split(" ")[1].split(":").length;
            if (timeParts === 0) str += ":00";
            d = Date.parse(str.replace(/-/g, "/"));
            if (!isNaN(d)) return d;
        }
        return 0;
    }

    /**
     * Converts retrieved from mdx2json date to JS date format
     * @param {string} s Date as string
     * @returns {number} Date as number
     */
    convertDateFromCache(s) {
        // TODO: make timechart working
        let y, d;
        if (s === "" && s === undefined || s === null) return null;
        const str = s.toString();

        // Week format - 2016W01, 2016W02,  etc.
        if ((s.length === 7) && (s.charAt(4) === "W")) {
            const w = parseInt(s.substring(5, 7));
            d = (1 + (w - 1) * 7);
            y = parseInt(s.substring(0, 4));
            return Date.parse(new Date(y, 0, d) as any);
        }
        if (str.length == 4) return this.getDate(s);
        if (str.indexOf("-") != -1) return this.getDate(s);
        if (str.indexOf(" ") != -1) return this.getDate(s);
        if (str.length == 6) {
            y = str.substr(0, 4);
            const m = str.substr(4, 2);
            return Date.parse(new Date(parseInt(y), parseInt(m)-1, 1) as any);
        }
        if (str.length == 5 && !isNaN(parseInt(str))) {
            let base = new Date(1840, 11, 31);
            const p = str.toString().split(",");
            d = parseInt(p[0]);
            let t = null;
            if (p.length > 1) { t = parseInt(p[1]); }
            base = this.addDays(base, parseInt(d));
            if (t) base.setSeconds(t);
            return Date.parse(base as any);
        } else return this.getDate(s);
    }
}
