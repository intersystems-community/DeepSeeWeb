(function() {
    'use strict';

    function TreeMapFact(BaseChart, Utils) {

        function TreeMapChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;
            this.setType('treemap');
            this.parseData = treeMapDataConverter;
            this.requestData();

            var ex = {
                legend: {
                    enabled: false
                },
                plotOptions: {
                    treemap: {
                        colorByPoint: true
                    }
                },
                tooltip: {
                    formatter: function () {
                        var cap = this.series.userOptions.caption;
                        var fmt = this.series.userOptions.format;
                        var v = this.point.value;
                        if (fmt) v = numeral(v).format(fmt);
                        return this.point.caption + "<br>" + cap + ": <b>" + v + '</b>';
                        //return this.point.id + "<br>"+ cap + ": <b>" + v + '</b>';
                    }
                }
            };
            Utils.merge($scope.chartConfig.options, ex);


            $scope.chartConfig.options.legend = {enabled: false};

            function treeMapDataConverter(data) {
                var i;
                $scope.chartConfig.series = [];
                /* this.config.xAxis.categories = [];
                 if (data.Cols[0].tuples.length >= 1) this.config.xAxis.title.text = data.Cols[0].tuples[0].caption;
                 if (data.Cols[0].tuples.length >= 2) this.config.yAxis.title.text = data.Cols[0].tuples[1].caption;
                 for (var i = 0; i < data.Cols[1].tuples.length; i++) {
                 this.config.xAxis.categories.push(data.Cols[1].tuples[i].caption.toString());
                 }*;*/
                var tempData = [];

                if (data.Cols[0].tuples[0].children) {
                    console.error("Data converter for this treemap chart not implemented!");
                } else {
                    //for(var j = 0; j < data.Cols[0].tuples.length; j++) {
                    tempData = [];
                    var total = 0;
                    for (i = 0; i < data.Data.length; i++) total += parseFloat(data.Data[i]);

                    for (i = 0; i < data.Cols[1].tuples.length; i++) {

                        tempData.push({
                            caption: data.Cols[1].tuples[i].caption,
                            id: data.Cols[1].tuples[i].caption + "<br>" + parseFloat(parseFloat(data.Data[i]) / total * 100).toFixed(2).toString() + "%",
                            value: parseFloat(data.Data[i])
                        });
                        //cb.fixData(tempData);
                    }

                    var cap = "";
                    var fmt = "";
                    if ( data.Cols[0].tuples[0]) {
                        cap =  data.Cols[0].tuples[0].caption;
                        fmt =  data.Cols[0].tuples[0].format;
                    }
                    _this.addSeries({
                        data: tempData,
                        layoutAlgorithm: 'squarified',
                        caption: cap,
                        format: fmt,
                        //layoutAlgorithm: 'strip',
                        dataLabels: {
                            enabled: true
                        }
                    });

                    //this.config.xAxis.tickInterval = Math.round((tempData[tempData.length - 1][0] - tempData[0][0]) / 10);
                    //this.config.xAxis.minorTickInterval = this.config.xAxis.tickInterval / 2;
                    //}
                }
            }
            //Utils.merge($scope.chartConfig.options, ex);


        }

        return TreeMapChart;
    }

    angular.module('widgets')
        .factory('TreeMapChart', ['BaseChart', 'Utils', TreeMapFact]);

})();