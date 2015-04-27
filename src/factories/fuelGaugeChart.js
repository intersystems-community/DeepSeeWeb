(function() {
    'use strict';

    function FuelGaugeChartFact(BaseChart, Utils) {

        function FuelGaugeChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;
            this.parseData = fuelGaugeDataConverter;
            this.setType('gauge');

            var ex = {
                pane: [{
                    startAngle: -45,
                    endAngle: 45,
                    background: null,
                    center: ['50%', '90%'],
                    size: 300
                }],
                plotOptions: {
                    gauge: {
                        dial: {
                            baseLength: '0%',
                            baseWidth: 5,
                            radius: '110%'
                        }
                    }
                },
                tooltip: {
                    formatter: function() {
                        var v = this.point.y;
                        var fmt = this.series.userOptions.format;
                        if (fmt) v = numeral(v).format(fmt);
                        return v;
                    }
                }
            };

            Utils.merge($scope.chartConfig.options, ex);

            $scope.chartConfig.yAxis = {
                minorTickPosition: 'outside',
                tickPosition: 'outside',
                labels: {
                    rotation: 'auto',
                    distance: 20
                }

            };

           function fuelGaugeDataConverter(data) {
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
                   dataLabels: {enabled: false},
                   format: data.Cols[0].tuples[idx].format || ""
               });
           }

            this.requestData();
        }

        /*
         function FuelGaugeChart($scope) {
         BaseChart.apply(this, [$scope]);
         var _this = this;
         this.parseData = fuelGaugeDataConverter;
         this.setType('solidgauge');

         var ex = {
         pane: {
         center: ['50%', '85%'],
         size: '120%',
         startAngle: -90,
         endAngle: 90,
         background: {
         backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
         innerRadius: '60%',
         outerRadius: '100%',
         shape: 'arc'
         }
         }
         };

         Utils.merge($scope.chartConfig.options, ex);

         $scope.chartConfig.yAxis = {
         title: {
         y: 20
         },
         lineWidth: 0
         //minorTickInterval: null,
         //tickPixelInterval: 400,
         //tickWidth: 0
         };

         function fuelGaugeDataConverter(data) {
         var values = [];
         var v = data.Data[0];
         var idx = 0;
         $scope.chartConfig.series = [];
         $scope.chartConfig.yAxis.title = {text: data.Cols[0].tuples[idx].caption};
         if (parseInt(v) === 0) {
         $scope.chartConfig.yAxis.min = 0;
         $scope.chartConfig.yAxis.max = 10;
         } else {
         v = parseInt(v);
         $scope.chartConfig.yAxis.min = v - parseInt(v / 2);
         $scope.chartConfig.yAxis.max = v + parseInt(v / 2);
         }
         this.addSeries({
         data: [data.Data[idx]],
         name: data.Cols[0].tuples[idx].caption
         });
         }

         this.requestData();
         }
         */

        return FuelGaugeChart;
    }

    angular.module('widgets')
        .factory('FuelGaugeChart', ['BaseChart', 'Utils', FuelGaugeChartFact]);

})();