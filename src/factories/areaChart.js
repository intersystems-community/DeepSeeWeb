(function() {
    'use strict';

    function AreaChartFact(BaseChart) {

        function AreaChart($scope) {
            BaseChart.apply(this, [$scope]);
            this.setType('area');

            var ex = {
                plotOptions: {
                    series: {
                        colorByPoint: false
                    },
                    area: {
                        //stacking: 'percent',
                        marker: {
                            enabled: false
                        }
                    }
                }
            };

            function MergeRecursive(obj1, obj2) {

                for (var p in obj2) {
                    try {
                        // Property in destination object set; update its value.
                        if ( obj2[p].constructor==Object ) {
                            obj1[p] = MergeRecursive(obj1[p], obj2[p]);

                        } else {
                            obj1[p] = obj2[p];

                        }

                    } catch(e) {
                        // Property in destination object not set; create it and set its value.
                        obj1[p] = obj2[p];

                    }
                }

                return obj1;
            }


            MergeRecursive($scope.chartConfig.options, ex);
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
        .factory('AreaChart', ['BaseChart', AreaChartFact]);

})();