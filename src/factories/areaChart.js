/**
 * Area chart class factory
 */
(function() {
    'use strict';

    function AreaChartFact(BaseChart, Utils) {

        function AreaChart($scope) {
            BaseChart.apply(this, [$scope]);
            this.setType('area');
            $scope.item.isBtnZero = true;
            $scope.item.isBtnValues = true;
            var ex = {
                plotOptions: {
                    series: {
                        colorByPoint: false,
                        cursor: null,
                        point: {
                            events: {
                                click: null
                            }
                        }
                    },
                    area: {
                        //stacking: 'percent',
                        stacking: 'normal',
                        marker: {
                            enabled: false
                        }
                    }
                }
            };

           Utils.merge($scope.chartConfig.options, ex);
            //for(var k in ex) $scope.chartConfig[k]=firstObject[k];


            //$scope.chartConfig.plotOptions.series.stacking = 'stack';
            /*Object.extend($scope.chartConfig.plotOptions, {
                series : {
                    marker: {
                        enabled: false
                    }
                }
            });*/
            /*$scope.chartConfig.plotOptions.series.marker =
                         {
                        enabled: false
                    };
*/

            this.requestData();
        }

        return AreaChart;
    }

    angular.module('widgets')
        .factory('AreaChart', ['BaseChart', 'Utils', AreaChartFact]);

})();