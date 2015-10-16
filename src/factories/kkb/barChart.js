/**
 * Bar chart class factory
 */
(function() {
    'use strict';

    function BarChartKKBFact(BarChart, Utils) {

        function BarChartKKB($scope) {
            BarChart.apply(this, [$scope]);
            var _this = this;
            var ex = {
                tooltip: {
                    positioner: function (w, h, p) {
                        var barWidth = 0;
                        if (_this.chart.series[0] && _this.chart.series[0].data[0]) {
                            if (_this.chart.series[0].data[0].graphic) barWidth = _this.chart.series[0].data[0].graphic.attr("width");
                        }
                        var x = p.plotX + _this.chart.plotLeft;
                        var y = p.plotY + _this.chart.plotTop + barWidth / 2 + 4;
                        if (x + w - _this.chart.plotLeft > _this.chart.plotWidth) x = _this.chart.plotWidth - w + _this.chart.plotLeft;
                        return {x: x, y: y};
                    }
                }
            };
            Utils.merge($scope.chartConfig.options, ex);



            var oldParse = _this.parseData;

            _this.parseData = parseData;
            function parseData(d) {
                oldParse(d);
                var series = $scope.chartConfig.series;
                for (var i = 0; i < series.length; i++) {
                    if (!series[i].format) series[i].format = getFormat(d);
                }
            }

            function getFormat(d) {
                if (!d || !d.Info) return "";
                var fmt = "";
                for (var i = 0; i < d.Info.numericGroupSize; i++) fmt += "#";
                fmt += ",#.##";
                return fmt;
            }
        }

        return BarChartKKB;
    }

    angular.module('widgets')
        .factory('BarChartKKB', ['BarChart', 'Utils', BarChartKKBFact]);

})();