/**
 * Treemap chart class factory
 */
(function() {
    'use strict';

    function TreeMapFact(BaseChart, Utils) {

        function TreeMapChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;
            this.setType('treemap');
            this.parseData = treeMapDataConverter;
            this.requestData();
            this.isPercent = true;
            this.totalSum = 0;

            // Check for percentage
            if (this.desc.overrides && this.desc.overrides[0] && this.desc.overrides[0].showPercentage === 0) this.isPercent = false;

            // Load isLegend option if exists
            if (this.hasOption("isLegend")) {
                this.isPercent = $scope.item.isLegend;
            }

            // Setup chart
            var ex = {
                legend: {
                    enabled: true
                },
                plotOptions: {
                    treemap: {
                        colorByPoint: true,
                        dataLabels: {
                            enabled: true,
                            formatter: function () {
                                // Define custom label formatter
                                if (_this.isPercent && _this.totalSum) {
                                    let percent = (this.point.value / _this.totalSum * 100).toFixed(2);
                                    return `${this.point.caption} - ${percent}%`;
                                } else {
                                    return `${this.point.caption}`;
                                }

                            }
                        }
                    }
                },
                tooltip: {
                    formatter: function () {
                        var cap = this.series.userOptions.caption;
                        var fmt = this.series.userOptions.format;
                        var v = this.point.value;
                        if (fmt) v = numeral(v).format(fmt);
                        return this.point.caption + "<br>" + cap + ": <b>" + v + '</b>';
                    }
                }
            };
            Utils.merge($scope.chartConfig.options, ex);
            delete $scope.chartConfig.options.plotOptions.series.dataLabels;

            $scope.item.toggleLegend = toggleLegend;


            /**
             * Override toggle legend to turn on/off percents in labels
             */
            function toggleLegend() {
                _this.toggleButton("isLegend");
                _this.isPercent = $scope.item.isLegend;
                _this.requestData();
            }

            /**
             * Treemap chart data parser function. Creates series for treemap chart from data
             * @param {object} data Data
             */
            function treeMapDataConverter(data) {
                var i;
                $scope.chartConfig.series = [];
                var tempData = [];
                if (!data.Cols[0].tuples.length) return;

                if (data.Cols[0].tuples[0].children) {
                    console.error("Data converter for this treemap chart not implemented!");
                } else {
                    tempData = [];
                    var total = 0;
                    for (i = 0; i < data.Data.length; i++) total += parseFloat(data.Data[i]);
                    for (i = 0; i < data.Cols[1].tuples.length; i++) {
                        tempData.push({
                            caption: data.Cols[1].tuples[i].caption,
                            id: data.Cols[1].tuples[i].caption + "<br>" + parseFloat(parseFloat(data.Data[i]) / total * 100).toFixed(2).toString() + "%",
                            value: parseFloat(data.Data[i]),
                            path: data.Cols[1].tuples[i].path,
                            name: data.Cols[1].tuples[i].caption
                        });
                    }

                    var cap = "";
                    var fmt = "";
                    if ( data.Cols[0].tuples[0]) {
                        cap =  data.Cols[0].tuples[0].caption;
                        fmt =  data.Cols[0].tuples[0].format;
                    }
                    _this.totalSum = data.Data.map(d => parseFloat(d) || 0).reduce((a,b) => a+b, 0);
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
                }
            }
        }

        return TreeMapChart;
    }

    angular.module('widgets')
        .factory('TreeMapChart', ['BaseChart', 'Utils', TreeMapFact]);

})();