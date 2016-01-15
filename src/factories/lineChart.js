/**
 * Line chart class factory
 */
(function() {
    'use strict';

    function LineChartFact(BaseChart, Utils) {



        function LineChart($scope) {
            BaseChart.apply(this, [$scope]);
            this.setType('line');
            $scope.item.isBtnZero = true;
            $scope.item.isBtnValues = true;
            var ex = {};
            if (this.desc.type.toLowerCase() != "combochart") {
                ex = {
                    series: {
                        lineWidth: 3,
                        marker: {
                            enabled: false
                        }
                    }
                };
            }

            if (this.desc.type.toLowerCase() === "linechartmarkers") {
                ex = {
                    series: {
                        marker: {
                            enabled: true
                        }
                    }
                };
            }
            Utils.merge($scope.chartConfig.options.plotOptions, ex);
            this.requestData();
        }

        return LineChart;
    }

    angular.module('widgets')
        .factory('LineChart', ['BaseChart', 'Utils', LineChartFact]);

})();