(function() {
    'use strict';

    function PieChartFact(BaseChart, Utils) {

        function PieChart($scope) {
            BaseChart.apply(this, [$scope]);

            var opt = {series: {allowPointSelect: true, stickyTracking: false}};
            if (!$scope.chartConfig.options.plotOptions) $scope.chartConfig.options.plotOptions = {};
            Utils.merge($scope.chartConfig.options.plotOptions, opt);

            if (this.desc.type === "donutChart" || this.desc.type === "donutChart3D") {
                opt = {
                    plotOptions: {
                        pie: {
                            innerSize: "20%"
                        }
                    }
                };
                Utils.merge($scope.chartConfig.options, opt);
            }
            if (this.desc.type === "pieChart3D" || this.desc.type === "donutChart3D") {
                opt = {
                    chart: {
                        options3d: {
                            enabled: true,
                            alpha: 55,
                            beta: 0
                        }
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            depth: 35
                        }
                    }
                };
                Utils.merge($scope.chartConfig.options, opt);

            }
            this.setType('pie');
            this.requestData();
        }

        return PieChart;
    }

    angular.module('widgets')
        .factory('PieChart', ['BaseChart', 'Utils', PieChartFact]);

})();