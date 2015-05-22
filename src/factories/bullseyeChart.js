(function() {
    'use strict';

    function BullseyeChartFact(BaseChart, Utils) {

        function BullseyeChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;
            //$scope.chartConfig.options.plotOptions = {series: {allowPointSelect: true, stickyTracking: false}};
            this.setType('pie');

            var ex = {
                plotOptions: {
                    series: {
                        cursor: null,
                        point: {
                            events: {
                                click: null
                            }
                        }
                    },
                    pie: {
                        allowPointSelect: false,
                        dataLabels: {
                            enabled: true,
                            color: '#000000',
                            connectorColor: '#000000',
                            formatter: function() {
                                return '<b>'+ this.point.name +'</b>: '+ this.series.options.size;
                            }
                        }
                    }
                },
                tooltip: {
                    formatter: function() {
                        return this.key + ': <b>' + this.y + '</b><br/>';
                    }
                }
            };
            Utils.merge($scope.chartConfig.options, ex);

            this.parseData = function(data) {
                var values = [];

                $scope.chartConfig.series = [];
                var maxValue =  Math.max.apply(null, data.Data);
                //$scope.chartConfig.series[0].name = data.Cols[0].caption;
                for (var d = 0; d < data.Cols[1].tuples.length; d++) {
                    values.push([data.Cols[1].tuples[d].caption, data.Data[d]]);

                    _this.addSeries({
                        innerSize: '0%',
                        size: Math.floor(data.Data[d] / maxValue * 100).toString() + '%',
                        data: [[data.Cols[1].tuples[d].caption, data.Data[d]]],
                        borderWidth: 2
                        //name: data.Cols[0].tuples[0].caption,
                        //format:  data.Cols[0].tuples[0].format,
                    });
                }

                //$scope.chartConfig.series[0].data = values;
                //$scope.chartConfig.series[0].name = data.Cols[0].tuples[0].caption;
                //$scope.chartConfig.series[0].format = data.Cols[0].tuples[0].format;
            };

            this.requestData();
        }

        return BullseyeChart;
    }

    angular.module('widgets')
        .factory('BullseyeChart', ['BaseChart', 'Utils', BullseyeChartFact]);

})();