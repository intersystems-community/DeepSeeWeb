(function() {
    'use strict';

    function HiLowFact(BaseChart, Utils) {

        function HiLowChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;
            this.parseData = hiLowDataConverter;
            this.setType('boxplot');
            this.requestData();

            var ex = {
                series: {
                    fillColor: '#dddddF'
                },
                plotOptions: {
                    boxplot: {
                        fillColor: '#fafafF',
                        whiskerLength: 0,
                        colorByPoint: true,
                        lineWidth: 3,
                        stemWidth: 0
                    }
                },
                tooltip: {
                    formatter: function () {
                        //TODO: Lang support
                        var cap1 = this.series.userOptions.caption1 || "Minimum";
                        var cap2 = this.series.userOptions.caption2 || "Maximum";
                        var fmt1 = this.series.userOptions.format1;
                        var fmt2 = this.series.userOptions.format2;

                        var v1 = this.point.low;
                        var v2 = this.point.high;

                        if (fmt1) v1 = numeral(v1).format(fmt1);
                        if (fmt2) v2 = numeral(v2).format(fmt2);

                        return this.key + '<br/>'+cap2+':<b>' + v2 + '</b><br/>'+cap1+':<b>' + v1 + '</b>';
                    }
                }
            };
            Utils.merge($scope.chartConfig.options, ex);

            function hiLowDataConverter(data) {
                var i;
                $scope.chartConfig.xAxis.categories = [];
                for (i = 0; i < data.Cols[1].tuples.length; i++) {
                    $scope.chartConfig.xAxis.categories.push(data.Cols[1].tuples[i].caption.toString());
                }
                $scope.chartConfig.series = [];
                var tempData = [];

                if (data.Cols[0].tuples[0].children) {
                    //TODO: lang support
                    _this.showError("Data converter for this hi-low chart not implemented!");
                } else {
                    tempData = [];
                    for (i = 0; i < data.Cols[1].tuples.length; i++) {
                        tempData.push({
                            q1: data.Data[i * 2],
                            q3: data.Data[i * 2 + 1],
                            low: data.Data[i * 2],
                            high: data.Data[i * 2 + 1],
                            cube: data.Info.cubeName,
                            path: data.Cols[1].tuples[i].path
                        });
                    }
                    //this.fixData(tempData);

                    var cap1 = "";
                    var cap2 = "";
                    var fmt1 = "";
                    var fmt2 = "";
                    if (data.Cols[0].tuples[0]) {
                        cap1 = data.Cols[0].tuples[0].caption;
                        fmt1 = data.Cols[0].tuples[0].format;
                    }
                    if (data.Cols[0].tuples[1]) {
                        cap2 = data.Cols[0].tuples[1].caption;
                        fmt2 = data.Cols[0].tuples[1].format;
                    }

                    _this.addSeries({data: tempData, caption1: cap1, caption2: cap2, format1: fmt1, format2: fmt2});
                }
            }

        }

        return HiLowChart;
    }

    angular.module('widgets')
        .factory('HiLowChart', ['BaseChart', 'Utils', HiLowFact]);

})();