(function() {
    'use strict';

    function TimeChartFact(BaseChart, Utils, $timeout) {

        function TimeChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;

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
                    //rangeSelector: {
                        /*inputEnabled: true,
                        buttons: [{
                            type: 'hour',
                            count: 1,
                            text: '1h'
                        }, {
                            type: 'day',
                            count: 1,
                            text: '1D'
                        }, {
                            type: 'all',
                            count: 1,
                            text: 'All'
                        }],*/
                        //selected: 5
                    //},
                    scrollbar: {
                        enabled: false
                    }
                    /* yAxis: {
                        min: 0,
                        title: {
                            text: ''
                        }
                    },*/
                    /*plotOptions: {
                        series: {
                            lineWidth: 3,
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    legend: {
                        enabled: true
                    }*/
                },
               /* title: {
                    text: ''
                },*/

                series: [],
                useHighStocks: true,
                loading: true
            };

            Utils.merge($scope.chartConfig, opt);

            function customFormatter() {
                /* jshint ignore:start */
                var t = this;
                /* jshint ignore:end */
                if (!_this.chart) return t.value;
                var from = Math.floor(_this.chart.xAxis[0].getExtremes().min);
                var to = Math.ceil(_this.chart.xAxis[0].getExtremes().max);
                var days = daysBetween(new Date(from), new Date(to));
                if (days <= 1) return Highcharts.dateFormat('%H:%M', t.value);
                if (days < 5) return Highcharts.dateFormat('%e %b %H:%M', t.value);
                if (days < 30) return Highcharts.dateFormat('%e %b', t.value);
                if (days < 360 * 2) return Highcharts.dateFormat('%b %Y', t.value);
                return Highcharts.dateFormat('%Y', t.value);
            }

            this.parseData = function(data) {
                //if (_this.chart) _this.chart.xAxis[0].setExtremes(null, null, null, null, null);
                //if (_this.chart) _this.chart.xAxis[1].setExtremes(null, null, null, null, null);
                $scope.chartConfig.yAxis.min = _this.getMinValue(data.Data);
                //config.yAxis.max = ChartBase.getMaxValue(data.Data);
                $scope.chartConfig.series = [];
                var tempData = [];
                var minDate = Number.POSITIVE_INFINITY;
                var maxDate = Number.NEGATIVE_INFINITY;
                var da;
                var i;

                if (data.Cols[0].tuples[0].children) {
                    var k = 0;
                    for(var t = 0; t < data.Cols[0].tuples.length; t++) {
                        for (var c = 0; c < data.Cols[0].tuples[t].children.length; c++) {
                            tempData = [];
                            for (var d = 0; d < data.Cols[1].tuples.length; d++) {
                                da = convertDateFromCache(extractValue(data.Cols[1].tuples[i].path));//this.getDate(data.Cols[1].tuples[i].caption);
                                tempData.push([
                                    da,
                                    data.Data[data.Cols[0].tuples.length * data.Cols[0].tuples[t].children.length * d + t * data.Cols[0].tuples[t].children.length + c] || 0
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
                            var value = data.Data[i * data.Cols[0].tuples.length + j];
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
                /*var minValue;
                var maxValue;
                for (i = 0; i <  $scope.chartConfig.series.length; i++) {
                    //var k = 0;
                    //while ($scope.chartConfig.series[i].data[k][1])
                    minValue = $scope.chartConfig.series[i].data[0][0];
                    maxValue = $scope.chartConfig.series[i].data[$scope.chartConfig.series[i].data.length - 1][0];

                    if (minValue < minDate) minDate = minValue;
                    if (maxValue > maxDate) maxDate = maxValue;
                }
                var days = daysBetween(new Date(minValue), new Date(maxValue));*/
                /*if (days <= 2) {
                    $scope.chartConfig.options.rangeSelector.buttons =
                        [{
                            type : 'minute',
                            count : 1,
                            text : '1m'
                        }, {
                            type : 'hour',
                            count : 1,
                            text : '1h'
                        }, {
                            type : 'all',
                            count : 1,
                            text : 'All'
                        }];
                } else if (days <= 30) {
                    $scope.chartConfig.options.rangeSelector.buttons =
                        [{
                            type : 'hour',
                            count : 1,
                            text : '1h'
                        }, {
                            type : 'day',
                            count : 1,
                            text : '1D'
                        }, {
                            type : 'all',
                            count : 1,
                            text : 'All'
                        }];
                } else if (days <= 360) {
                    $scope.chartConfig.options.rangeSelector.buttons =
                        [{
                            type : 'day',
                            count : 1,
                            text : '1D'
                        }, {
                            type : 'month',
                            count : 1,
                            text : '1M'
                        }, {
                            type : 'all',
                            count : 1,
                            text : 'All'
                        }];

                } else {
                    $scope.chartConfig.options.rangeSelector.buttons =
                        [{
                            type : 'day',
                            count : 1,
                            text : '1D'
                        }, {
                            type : 'month',
                            count : 1,
                            text : '1M'
                        }, {
                            type : 'year',
                            count : 1,
                            text : '1Y'
                        }, {
                            type : 'all',
                            count : 1,
                            text : 'All'
                        }];
                    $scope.chartConfig.options.rangeSelector.selected = 3;
                }*/
            };


            function defaultTimechartTooltipFormatter() {
                var a;
                var fmt;
                var val;
                /* jshint ignore:start */
                var t = this;
                /* jshint ignore:end */
                if (t.series) {
                    fmt = t.series.options.format;
                    val = t.y;
                    if (fmt) val = numeral(val).format(fmt);
                    a = '<span style="color:' + t.series.color + '">\u25CF</span>' + t.series.name + ':<b> ' + val;
                    return a;
                } else {
                    a = "";
                    for (var i = t.points.length - 1; i > -1; i--) {
                        fmt = t.points[i].series.options.format;
                        val = t.points[i].y;
                        if (fmt) val = numeral(val).format(fmt);
                        a += '<span style="color:' + t.points[i].series.color + '">\u25CF</span>' + t.points[i].series.name + ':<b> ' + val + '<br>';
                    }
                    return a;
                }
            }

            function addDays(date, days) {
                var result = new Date(date);
                result.setDate(date.getDate() + days);
                return result;
            }

            function extractValue(path) {
                var idx = path.indexOf("&[");
                if (idx == -1) return "";
                return path.substring(idx + 2, path.length - 1);
            }

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

            function convertDateFromCache(s) {
                if (s === "" && s === undefined || s === null) return null;
                var str = s.toString();
                if (str.length == 4) return getDate(s);
                if (str.indexOf("-") != -1) return getDate(s);
                if (str.indexOf(" ") != -1) return getDate(s);
                if (str.length == 6) {
                    var y = str.substr(0, 4);
                    var m = str.substr(4, 2);
                    return Date.parse(new Date(parseInt(y), parseInt(m)-1, 1));
                }
                if (str.length == 5 && !isNaN(parseInt(str))) {
                    var base = new Date(1840, 11, 31);
                    var p = str.toString().split(",");
                    var d = parseInt(p[0]);
                    var t = null;
                    if (p.length > 1) t = parseInt(p[1]);
                    base = addDays(base, parseInt(d));
                    if (t) base.setSeconds(t);
                    return Date.parse(base);
                } else return getDate(s);
            }

            function daysBetween(first, second) {
                var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
                var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());
                var millisecondsPerDay = 1000 * 60 * 60 * 24;
                var millisBetween = two.getTime() - one.getTime();
                var days = millisBetween / millisecondsPerDay;
                return Math.floor(days);
            }



            this.requestData();
        }

        return TimeChart;
    }

    angular.module('widgets')
        .factory('TimeChart', ['BaseChart', 'Utils', '$timeout', TimeChartFact]);

})();