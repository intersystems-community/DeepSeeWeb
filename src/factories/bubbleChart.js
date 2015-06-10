(function() {
    'use strict';

    function BuubleChartFact(BaseChart, Utils) {

        function BuubleChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;
            this.setType('bubble');
            this.parseData = bubbleDataConvertor;
            this.requestData();

            var ex = {
                plotOptions: {
                    series: {
                        cursor: null,
                        point: {
                            events: {
                                click: null
                            }
                        }
                    }
                },
                chart: {
                    zoomType: 'xy'
                },
                /*legend: {
                    enabled: false
                },*/
                xAxis: {
                    tickWidth: 10
                },
                tooltip: {
                    formatter: function () {
                        var fmt1 = this.series.userOptions.format1;
                        var fmt2 = this.series.userOptions.format2;
                        var v1 = this.x;
                        var v2 = this.y;
                        if (fmt1) v1 = numeral(v1).format(fmt1);
                        if (fmt2) v2 = numeral(v2).format(fmt2);
                        return this.series.name + '<br/>'+  $scope.chartConfig.xAxis.title.text + ':<b>' + v1 + '</b><br/>'+  $scope.chartConfig.yAxis.title.text + ':<b>' + v2 + '</b>';
                    }
                }
            };
            Utils.merge($scope.chartConfig.options, ex);

            function bubbleDataConvertor(data) {
                $scope.chartConfig.series = [];
                if (data.Cols[0].tuples.length >= 1) $scope.chartConfig.xAxis.title.text = data.Cols[0].tuples[0].caption;
                if (data.Cols[0].tuples.length >= 2) $scope.chartConfig.yAxis.title.text = data.Cols[0].tuples[1].caption;
                var tempData = [];

                if (data.Cols[0].tuples[0].children) {
                    // TODO: Lang support
                    _this.showError("Data converter for this bubble chart not implemented!");
                } else {
                    var fmt1 = "";
                    var fmt2 = "";
                    if (data.Cols[0].tuples[0]) fmt1 = data.Cols[0].tuples[0].format;
                    if (data.Cols[0].tuples[1]) fmt1 = data.Cols[0].tuples[1].format;

                    for (var i = 0; i < data.Cols[1].tuples.length; i++) {
                        tempData = [];
                        tempData.push([data.Data[i * 2], data.Data[i * 2 + 1], 1]);
                        //cb.fixData(tempData);

                        _this.addSeries({
                            data: tempData,
                            name: data.Cols[1].tuples[i].caption,
                            format1: fmt1,
                            format2: fmt2
                        });
                    }
                    //}
                }
            }
        }

        return BuubleChart;
    }

    angular.module('widgets')
        .factory('BubbleChart', ['BaseChart', 'Utils', BuubleChartFact]);

})();