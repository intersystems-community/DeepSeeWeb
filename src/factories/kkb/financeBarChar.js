/**
 * Bar chart class factory
 */
(function() {
    'use strict';

    function FinanceBarChartFact(BarChartKKB, Utils) {

        // Number of bars when valueas are shown(if less than this)
        var SHOW_VALUES_COUNT = 20;


        function FinanceBarChartKKB($scope) {
            BarChartKKB.apply(this, [$scope]);
            var _this = this;
            var oldParse = _this.parseData;
            _this.parseData = parseData;
            _this.getDrillTitle = getDrillTitle;

            var ex = {
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                }
            };

            Utils.merge($scope.chartConfig.options, ex);

            function getDrillTitle(path, name, category) {
                var tit = $scope.item.title;
                return (tit ? (tit + " - ") : "") + category;
            }

            function parseData(d) {
                var i;
                oldParse(d);
                if ($scope.chartConfig.series.length === 0) return;

                // Calculate total
                var total = 0;
                for (i = 0; i < $scope.chartConfig.series[0].data.length; i++) if ($scope.chartConfig.series[0].data[i].y > 0) total += $scope.chartConfig.series[0].data[i].y;

                // Sort date in increasing order
                var datas = $scope.chartConfig.series[0].data.slice(0);
                $scope.chartConfig.series[0].data.sort(function(a, b) { if (a.y < b.y) return 1; else return -1; });
                var cats = $scope.chartConfig.xAxis.categories.slice(0);
                for (i = 0; i < $scope.chartConfig.series[0].data.length; i++) {
                    var item = $scope.chartConfig.series[0].data[i];
                    var idx = datas.indexOf(item);
                    $scope.chartConfig.xAxis.categories[i] = cats[idx];
                }
                datas = null;
                cats = null;

                // Color first 80%
                var t = 0;
                for (i = 0; i < $scope.chartConfig.series[0].data.length; i++) {
                    if (t < total * 0.8) $scope.chartConfig.series[0].data[i].color = "green";
                    if ($scope.chartConfig.series[0].data[i].y < 0) $scope.chartConfig.series[0].data[i].color = "red"; else
                    t += $scope.chartConfig.series[0].data[i].y;
                }

                    //$scope.chartConfig.xAxis.categories = [];
                //for (var i = 0; i < $scope.chartConfig.series[0].data.length; i++) $scope.chartConfig.xAxis.categories.push($scope.chartConfig.series[0].data[i].name);
                $scope.chartConfig.options.plotOptions.bar.dataLabels.enabled =  $scope.chartConfig.series[0].data.length <= SHOW_VALUES_COUNT;
            }
            /*var ex = {
                tooltip: {
                    positioner: function (w, h, p) {
                        var barWidth = 0;
                        if (_this.chart.series[0] && _this.chart.series[0].data[0]) {
                            barWidth = _this.chart.series[0].data[0].graphic.attr("width");
                        }
                        var x = p.plotX + _this.chart.plotLeft;
                        var y = p.plotY + _this.chart.plotTop + barWidth / 2 + 4;
                        if (x + w - _this.chart.plotLeft > _this.chart.plotWidth) x = _this.chart.plotWidth - w + _this.chart.plotLeft;
                        return {x: x, y: y};
                    }
                }
            };
            Utils.merge($scope.chartConfig.options, ex);*/


        }

        return FinanceBarChartKKB;
    }

    angular.module('widgets')
        .factory('FinanceBarChartKKB', ['BarChartKKB', 'Utils', FinanceBarChartFact]);

})();