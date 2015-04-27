(function() {
    'use strict';

    function SpeedometerChartFact(BaseChart, Utils) {

        function SpeedometerChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;
            this.parseData = speedometerDataConverter;
            this.setType('gauge');

            var ex = {
                tooltip: {
                    enabled: false,
                },
                chart: {
                    plotBackgroundColor: null,
                    plotBackgroundImage: null,
                    plotBorderWidth: 0,
                    plotShadow: false
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            formatter: function(){
                                var v = this.point.y;
                                var fmt = this.series.userOptions.format;
                                if (fmt) v = numeral(v).format(fmt);
                                return v;
                            }
                        }
                    }
                },
                pane: {
                    startAngle: -150,
                    endAngle: 150,
                    background: [{
                        backgroundColor: {
                            linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                            stops: [
                                [0, '#FFF'],
                                [1, '#333']
                            ]
                        },
                        borderWidth: 0,
                        outerRadius: '109%'
                    }, {
                        backgroundColor: {
                            linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                            stops: [
                                [0, '#333'],
                                [1, '#FFF']
                            ]
                        },
                        borderWidth: 1,
                        outerRadius: '107%'
                    }, {
                        // default background
                    }, {
                        backgroundColor: '#DDD',
                        borderWidth: 0,
                        outerRadius: '105%',
                        innerRadius: '103%'
                    }]
                }
            };

            Utils.merge($scope.chartConfig.options, ex);

            $scope.chartConfig.yAxis = {

                minorTickInterval: 'auto',
                minorTickWidth: 1,
                minorTickLength: 10,
                minorTickPosition: 'inside',
                minorTickColor: '#666',
                //tickPixelInterval: 100,
                //tickInterval: 1,
                tickWidth: 2,
                tickPosition: 'inside',
                tickLength: 10,
                tickColor: '#666'
            };

           function speedometerDataConverter(data) {
               var values = [];
               var idx = 0;
               if (data.Cols[0].tuples.length > 1) idx = 1;
               var v = data.Data[idx];
               if (!v) v = 0;
               $scope.chartConfig.series = [];
               $scope.chartConfig.yAxis.title = {text: data.Cols[0].tuples[idx].caption};
               if (parseInt(v) === 0) {
                   $scope.chartConfig.yAxis.min = 0;
                   $scope.chartConfig.yAxis.max = 10;
               } else {
                   v = parseInt(v);
                   var len = v.toString().length;
                   $scope.chartConfig.yAxis.max = Math.pow(10, len);
                   $scope.chartConfig.yAxis.min = 0;//Math.pow(10, len - 1);
                   //$scope.chartConfig.yAxis.min = v - parseInt(v / 2);
                   //$scope.chartConfig.yAxis.max = v + parseInt(v / 2);
               }
               _this.addSeries({
                   data: [data.Data[idx] || 0],
                   name: data.Cols[0].tuples[idx].caption,
                   format: data.Cols[0].tuples[idx].format || ""
               });
           }

            this.requestData();
        }

        return SpeedometerChart;
    }

    angular.module('widgets')
        .factory('SpeedometerChart', ['BaseChart', 'Utils', SpeedometerChartFact]);

})();