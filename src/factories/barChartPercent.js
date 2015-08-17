/**
 * Custom chart for KKB to display stacked bar chart with percents and additional data
 */
(function() {
    'use strict';

    function BarChartPercentFact(BaseChart, Utils) {

        function BarChartPercent($scope) {
            BaseChart.apply(this, [$scope]);
            var _this            = this;
            _this.oldParseData   = this.parseData;
            _this.parseData      = parseData;
            _this.basePointClick = $scope.chartConfig.options.plotOptions.series.point.events.click;

            this.setType('bar');
            this.enableStacking();

            var ex = {
                options: {
                    legend: {
                        reversed: true
                    },
                    tooltip: {
                        formatter: customFormatter
                    },
                    plotOptions: {
                        series: {
                            point: {
                                events: {
                                    click: onPointClick
                                }
                            }
                        }
                    }
                },
                xAxis: {
                    labels: {
                        formatter: function () {
                            if (this.value === "ИТОГО") {
                                return '<span style="font-weight: bold; color: black">' + this.value + '<span>';
                            }
                            return this.value;
                        }
                    }
                },
                yAxis: {
                    plotLines: [{
                        color: 'red',
                        value: 1,
                        width: 2,
                        zIndex: 3
                    }],
                    labels: {
                        formatter: function () {
                            if (this.value === 1) {
                                return '<span style="font-size: 110%;font-weight:bold;color: red">100%</span>';
                            }
                            return this.value * 100 + "%";
                        }
                    }
                }
            };

            Utils.merge($scope.chartConfig, ex);

            /**
             * Highchart bar click event handler
             * @param {object} e Highcharts click event
             */
            function onPointClick(e) {
                if (e.point.name === "ИТОГО") return;
                _this.basePointClick(e);
            }

            /**
             * Custom tooltip formatter for chart
             */
            function customFormatter() {
                /* jshint ignore:start */
                var t = this;
                /* jshint ignore:end */
                var a = '<b>' + t.point.name + '</b><br>';
                for (var i = 4; i >= 0; i--) {
                    var v = _this.chart.series[i].processedYData[t.point.index];
                    if (!v) v = 0;
                    a += _this.chart.series[i].name + ": " + v.toString() + "<br>";
                }
                return a;
            }

            /**
             * Parses data received from server
             * @param {object} data MDX result
             */
            function parseData(data) {
                _this.oldParseData(data);
                var cols = [];Highcharts.getOptions().colors.slice();
                cols[3] = "#7fa645";
                cols[3] = "#9fd84b";
                cols[2] = "#00b9ff";
                cols[1] = "#f7a35c";
                cols[0] = "#aaaaaa";
                for (var i = 0; i < $scope.chartConfig.series.length; i++) {
                    $scope.chartConfig.series[i].color = cols[(i-1) % cols.length];
                    if (i < 5) {
                        $scope.chartConfig.series[i].visible = false;
                        $scope.chartConfig.series[i].showInLegend = false;
                    }
                }
            }

            this.requestData();
        }

        return BarChartPercent;
    }

    angular.module('widgets')
        .factory('BarChartPercent', ['BaseChart', 'Utils', BarChartPercentFact]);

})();