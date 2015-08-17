/**
 * XY chart class factory
 */
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

            $scope.chartConfig.options.tooltip = {
                formatter: function () {
                    var fmt1 = this.series.userOptions.format1;
                    var fmt2 = this.series.userOptions.format2;
                    var v1 = this.y;
                    var v2 = this.x;
                    if (fmt1) v1 = numeral(v1).format(fmt1);
                    if (fmt2) v2 = numeral(v2).format(fmt2);
                    return $scope.chartConfig.yAxis.title.text + ':<b>' + v1 + '</b><br/>' + $scope.chartConfig.xAxis.title.text + ':<b>' + v2 + '</b>';
                }
            };

            /**
             * XY chart data parser function. Creates series for XY chart from data
             * @param {object} data Data
             */
            this.parseData = function(data) {
                var fmt1 = "";
                var fmt2 = "";

                if (data.Cols[0].tuples.length >= 1) {
                    $scope.chartConfig.xAxis.title.text = data.Cols[0].tuples[0].caption;
                    fmt1 = data.Cols[0].tuples[0].format;
                }
                if (data.Cols[0].tuples.length >= 2) {
                    $scope.chartConfig.yAxis.title.text = data.Cols[0].tuples[1].caption;
                    fmt1 = data.Cols[0].tuples[1].format;
                }
                $scope.chartConfig.series = [];
                var tempData = [];

                if (data.Cols[0].tuples[0].children) {
                    this.showError("Data converter for this xy chart not implemented!");
                } else {
                    tempData = [];
                    for (var i = 0; i < data.Cols[1].tuples.length; i++) {
                        tempData.push([parseFloat(data.Data[i * 2]), parseFloat(data.Data[i * 2 + 1])]);
                    }
                    this.addSeries({
                        data: tempData,
                        name: "",
                        format1: fmt1,
                        fotmat2: fmt2
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