(function() {
    'use strict';

    function LineChartFact(BaseChart) {

        function LineChart($scope) {
            BaseChart.apply(this, [$scope]);
            this.setType('line');
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

            this.requestData();
        }

        return LineChart;
    }

    angular.module('widgets')
        .factory('LineChart', ['BaseChart', LineChartFact]);

})();