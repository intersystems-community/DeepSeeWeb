/**
 * Line chart class factory
 */
(function() {
    'use strict';

    function LineChartFact(BaseChart) {



        function LineChart($scope) {
            BaseChart.apply(this, [$scope]);
            this.setType('line');
            $scope.item.isBtnZero = true;
            if (this.desc.type.toLowerCase() != "combochart") {
                $scope.chartConfig.options.plotOptions = {
                    series: {
                        lineWidth: 3,
                        marker: {
                            enabled: false
                        }
                    }
                };
            }

            if (this.desc.type.toLowerCase() === "linechartmarkers") {
                $scope.chartConfig.options.plotOptions = {
                    series: {
                        marker: {
                            enabled: true
                        }
                    }
                };
            }

            this.requestData();
        }

        return LineChart;
    }

    angular.module('widgets')
        .factory('LineChart', ['BaseChart', LineChartFact]);

})();