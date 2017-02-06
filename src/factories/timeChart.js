/**
 * time chart class factory
 */
(function() {
    'use strict';

    function TimeChartFact(BaseChart, Utils) {

        function TimeChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;
            $scope.item.isBtnValues = true;
            var opt = {
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

            Utils.merge($scope.chartConfig, opt);

            /*
            function customFormatter() {
                var t = this;
                if (!_this.chart) return t.value;
                var from = Math.floor(_this.chart.xAxis[0].getExtremes().min);
                var to = Math.ceil(_this.chart.xAxis[0].getExtremes().max);
                var days = daysBetween(new Date(from), new Date(to));
                if (days <= 1) return Highcharts.dateFormat('%H:%M', t.value);
                if (days < 5) return Highcharts.dateFormat('%e %b %H:%M', t.value);
                if (days < 30) return Highcharts.dateFormat('%e %b', t.value);
                if (days < 360 * 2) return Highcharts.dateFormat('%b %Y', t.value);
                return Highcharts.dateFormat('%Y', t.value);
            }*/

            /**
             * Time chart data parser function. Creates series for time chart from data
             * @param {object} data Data
             */
            this.parseData = function(data) {
                if (data && data.Info) _this.dataInfo = data.Info;
                //if (_this.chart) _this.chart.xAxis[0].setExtremes(null, null, null, null, null);
                //if (_this.chart) _this.chart.xAxis[1].setExtremes(null, null, null, null, null);
                $scope.chartConfig.yAxis.min = _this.getMinValue(data.Data);
                //config.yAxis.max = ChartBase.getMaxValue(data.Data);
                $scope.chartConfig.series = [];
                var tempData = [];
                //var minDate = Number.POSITIVE_INFINITY;
                //var maxDate = Number.NEGATIVE_INFINITY;
                var da;
                var i;

                if (data.Cols[0].tuples[0].children) {
                    var k = 0;
                    for(var t = 0; t < data.Cols[0].tuples.length; t++) {
                        for (var c = 0; c < data.Cols[0].tuples[t].children.length; c++) {
                            tempData = [];
                            for (var d = 0; d < data.Cols[1].tuples.length; d++) {
                                da = convertDateFromCache(extractValue(data.Cols[1].tuples[d].path));//this.getDate(data.Cols[1].tuples[i].caption);
                                tempData.push([
                                    da,
                                    +data.Data[data.Cols[0].tuples.length * data.Cols[0].tuples[t].children.length * d + t * data.Cols[0].tuples[t].children.length + c] || 0
                                ]);
                                if (tempData[tempData.length - 1][1] === "") tempData[tempData.length - 1][1] = null;
                                k++;
                            }
                            _this.addSeries({
                                data: tempData,
                                name: data.Cols[0].tuples[t].caption + "/" + data.Cols[0].tuples[t].children[c].caption,
                                format: data.Cols[0].tuples[t].format
                            });
                        }
                    }
                } else {
                    for(var j = data.Cols[0].tuples.length - 1; j >= 0; j--) {
                        tempData = [];
                        for (i = 0; i < data.Cols[1].tuples.length; i++) {
                            da = convertDateFromCache(extractValue(data.Cols[1].tuples[i].path));//this.getDate(data.Cols[1].tuples[i].caption);
                            var value = +data.Data[i * data.Cols[0].tuples.length + j];
                            if (value !== "") tempData.push([da, value || 0]);
                        }

                        _this.addSeries({
                            data: tempData,
                            name: data.Cols[0].tuples[j].caption,
                            format: data.Cols[0].tuples[j].format
                        });
                    }
                }

                // Due bug in timechart we need manually update navigator and axis extremes after data refresh
                if ((_this.chart) && ($scope.chartConfig.series.length !== 0) && (_this.chart.xAxis)) {
                    for (i = 0; i < _this.chart.xAxis.length; i++) _this.chart.xAxis[i].setExtremes();
                    var nav = _this.chart.get('highcharts-navigator-series');
                    if (nav) nav.setData($scope.chartConfig.series[0].data);
                }

                _this.initFormatForSeries(data);
            };

            /**
             * Time chart tooltip formatter
             * @returns {string} formatted value
             */
            function defaultTimechartTooltipFormatter() {
                var a;
                var fmt;
                var val;
                /* jshint ignore:start */
                var t = this;
                /* jshint ignore:end */

                var date = new Date(t.x);
                var dateStr = date.toLocaleDateString();
                if (date.getHours() !== 0 && date.getMinutes() !== 0 && date.getSeconds() !== 0) dateStr += " " + date.toLocaleTimeString();

                if (t.series) {
                    fmt = t.series.options.format;
                    val = t.y;
                    //if (fmt) val = numeral(val).format(fmt);
                    val = _this.formatNumber(val, fmt);
                    a = '<b>' + dateStr + '</b><br><span style="color:' + t.series.color + '">\u25CF</span>' + t.series.name + ':<b> ' + val;
                    return a;
                } else {
                    a = '<b>' + dateStr + '</b><br>';
                    for (var i = t.points.length - 1; i > -1; i--) {
                        fmt = t.points[i].series.options.format;
                        val = t.points[i].y;
                        //if (fmt) val = numeral(val).format(fmt);
                        val = _this.formatNumber(val, fmt);
                        a += '<span style="color:' + t.points[i].series.color + '">\u25CF</span>' + t.points[i].series.name + ':<b> ' + val + '<br>';
                    }
                    return a;
                }
            }

            /**
             * Adds days to date
             * @param {Date} date Date
             * @param {number} days Days to att
             * @returns {Date} Resulting date
             */
            function addDays(date, days) {
                var result = new Date(date);
                result.setDate(date.getDate() + days);
                return result;
            }

            /**
             * Extract value from path
             * @param {string} path Path like "&[324]"
             * @returns {string} Extracted value like "324"
             */
            function extractValue(path) {
                var idx = path.indexOf("&[");
                if (idx == -1) return "";
                return path.substring(idx + 2, path.length - 1);
            }

            /**
             * Converts retrieved from mdx2json date to JS date format. Used as utility by convertDateFromCache
             * @param {string} str Date as string
             * @returns {number} Date as number
             */
            function getDate(str) {
                var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

                var d = Date.parse(str);
                if (!isNaN(d)) return d;
                if (str.split("-").length == 2) {
                    var parts = str.split("-");
                    var idx = months.indexOf(parts[0].toLowerCase());
                    if (idx != -1) {
                        return Date.parse((idx+1).toString() + "/01/" + parts[1]);
                    }
                } else
                if (str.split(" ").length == 2) {
                    //like 2015-01-07 05
                    var timeParts = str.split(" ")[1].split(":").length;
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
            function convertDateFromCache(s) {
                var y, d;
                if (s === "" && s === undefined || s === null) return null;
                var str = s.toString();

                // Week format - 2016W01, 2016W02,  etc.
                if ((s.length === 7) && (s.charAt(4) === "W")) {
                    var w = parseInt(s.substring(5, 7));
                    d = (1 + (w - 1) * 7);
                    y = parseInt(s.substring(0, 4));
                    return Date.parse(new Date(y, 0, d));
                }
                if (str.length == 4) return getDate(s);
                if (str.indexOf("-") != -1) return getDate(s);
                if (str.indexOf(" ") != -1) return getDate(s);
                if (str.length == 6) {
                    y = str.substr(0, 4);
                    var m = str.substr(4, 2);
                    return Date.parse(new Date(parseInt(y), parseInt(m)-1, 1));
                }
                if (str.length == 5 && !isNaN(parseInt(str))) {
                    var base = new Date(1840, 11, 31);
                    var p = str.toString().split(",");
                    d = parseInt(p[0]);
                    var t = null;
                    if (p.length > 1) t = parseInt(p[1]);
                    base = addDays(base, parseInt(d));
                    if (t) base.setSeconds(t);
                    return Date.parse(base);
                } else return getDate(s);
            }

            /**
             * Returns days between two dates
             * @param {Date} first First date
             * @param {Date} second Second date
             * @returns {number} Days between
             */
            /*function daysBetween(first, second) {
                var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
                var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());
                var millisecondsPerDay = 1000 * 60 * 60 * 24;
                var millisBetween = two.getTime() - one.getTime();
                var days = millisBetween / millisecondsPerDay;
                return Math.floor(days);
            }*/

            this.requestData();
        }

        return TimeChart;
    }

    angular.module('widgets')
        .factory('TimeChart', ['BaseChart', 'Utils', '$timeout', TimeChartFact]);

})();