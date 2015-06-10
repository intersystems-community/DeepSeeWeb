(function() {
    'use strict';

    function PieChartFact(BaseChart, Utils) {

        function PieChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;

            $scope.item.toggleLegend = toggleLegend;

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


            var po = {
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: localStorage["widget:" + _this.desc.key + ":legend"] === "true"
                        }
                    }
                }
            };
            Utils.merge($scope.chartConfig.options, po);

            this.setType('pie');
            this.requestData();


            function toggleLegend() {
                $scope.item.isLegend = !$scope.item.isLegend;
                localStorage["widget:" + _this.desc.key + ":legend"] = $scope.item.isLegend;
                if (_this.chart) {
                    $scope.chartConfig.options.plotOptions.pie.dataLabels.enabled = $scope.item.isLegend;
                }
            }

        }

        return PieChart;
    }

    angular.module('widgets')
        .factory('PieChart', ['BaseChart', 'Utils', PieChartFact]);

})();