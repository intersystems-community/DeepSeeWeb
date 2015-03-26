(function() {
    'use strict';

    function XyChartFact(BaseChart) {

        function XyChart($scope) {
            BaseChart.apply(this, [$scope]);

            this.setType('scatter');
            $scope.chartConfig.options.chart.zoomType = 'xy';
            $scope.chartConfig.options.plotOptions = {
                series: {
                    lineWidth: 3,
                        marker: {
                        enabled: true
                    }
                }
            };

            this.parseData = function(data) {
                if (data.Cols[0].tuples.length >= 1) $scope.chartConfig.xAxis.title.text = data.Cols[0].tuples[0].caption;
                if (data.Cols[0].tuples.length >= 2) $scope.chartConfig.yAxis.title.text = data.Cols[0].tuples[1].caption;
                $scope.chartConfig.series = [];
                var tempData = [];

                if (data.Cols[0].tuples[0].children) {
                    this.showError("Data converter for this xy chart not implemented!")
                } else {
                    tempData = [];
                    for (var i = 0; i < data.Cols[1].tuples.length; i++) {
                        tempData.push([parseFloat(data.Data[i * 2]), parseFloat(data.Data[i * 2 + 1])]);
                    }
                    this.addSeries({
                        data: tempData,
                        name: ""
                    });

                    $scope.chartConfig.xAxis.tickInterval = Math.round((tempData[tempData.length - 1][0] - tempData[0][0]) / 10);
                }

            };

            this.requestData();
        }

        return XyChart;
    }

    angular.module('widgets')
        .factory('XyChart', ['BaseChart', XyChartFact]);

})();