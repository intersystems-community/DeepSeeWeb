/**
 * Pie chart class factory
 */
(function() {
    'use strict';

    function PieChartFact(BaseChart, Utils) {

        function PieChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;

            $scope.item.toggleLegend = toggleLegend;
            $scope.item.toggleValues = toggleValues;
            $scope.item.isBtnValues = true;
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
                            enabled: $scope.item.showValues
                        }
                    }
                }
            };
            Utils.merge($scope.chartConfig.options, po);

            if (!$scope.chartConfig.options.plotOptions.series.dataLabels) {
                $scope.chartConfig.options.plotOptions.series.dataLabels = {};
            }
            $scope.chartConfig.options.plotOptions.series.dataLabels.enabled = $scope.item.isLegend;

            if (!$scope.item.showValues) {
                delete $scope.chartConfig.options.plotOptions.series.dataLabels.formatter;
                delete $scope.chartConfig.options.plotOptions.pie.dataLabels.formatter;
            }
            /*if ($scope.chartConfig.options.plotOptions.pie.dataLabels.enabled)
            {
                $scope.chartConfig.options.plotOptions.series.dataLabels.enabled = false;
            }
*/

            this.setType('pie');
            this.requestData();

            /**
             * Toggles legend of pie chart
             */
            function toggleLegend() {
                _this.toggleButton("isLegend");
                if (_this.chart) {
                    $scope.chartConfig.options.plotOptions.series.dataLabels = {
                        enabled: $scope.item.isLegend
                    };
                }
            }

            function toggleValues() {
                _this.toggleButton("showValues");
                $scope.chartConfig.options.plotOptions.pie.dataLabels = {
                    enabled: $scope.item.showValues,
                    formatter: _this.labelsFormatter
                };
                if (!$scope.item.showValues) {
                    delete $scope.chartConfig.options.plotOptions.series.dataLabels.formatter;
                    delete $scope.chartConfig.options.plotOptions.pie.dataLabels.formatter;
                }
            }

        }

        return PieChart;
    }

    angular.module('widgets')
        .factory('PieChart', ['BaseChart', 'Utils', PieChartFact]);

})();