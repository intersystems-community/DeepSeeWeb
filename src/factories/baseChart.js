(function() {
    'use strict';

    function BaseChartFact(Lang, gridsterConfig, $element) {

        function BaseChart($scope) {
            this.addSeries = addSeries;
            this.setType = setType;
            this.getMinValue = getMinValue;
            this.enableStacking = enableStacking;
            this.baseRequestData = this.requestData;
            this.requestData = reqestData;
            this.parseData = parseMultivalueData;
            this.onResize = onResize;
            this._retrieveData = retrieveData;

            var _this = this;
            var firstRun = true;

            $scope.chartConfig = {
                options: {
                    chart: {
                        type: 'line'
                    }
                },
                yAxis: {
                    title:{
                        text:""
                    }
                },
                xAxis: {
                    title:{
                        text:""
                    }
                },
                series: [],
                title: {
                    text: ''
                },
              /*  size: {
                    width: $scope.item.sizeX * gridsterConfig.itemSize + ($scope.item.sizeX - 1)*12,
                    height: $scope.item.sizeY * gridsterConfig.itemSize + ($scope.item.sizeY - 1)*12 - 50
                },*/
                //useHighStocks: true
                func: function (chart) {
                    _this.chart = chart;
                    //_this.onResize();
                },
                loading: true
            };

            function reqestData() {
                $scope.chartConfig.loading = true;
                _this.baseRequestData();
            }

            function retrieveData(result) {
                $scope.chartConfig.loading = false;
                if (result) {
                    _this.parseData(result);
                    if (firstRun) {
                        firstRun = false;
                        _this.onResize();
                    }
                }
            }

            function addSeries(data) {
                $scope.chartConfig.series.push(data);
            }

            function enableStacking() {
                if (!$scope.chartConfig.plotOptions) {
                    $scope.chartConfig.plotOptions = {
                        series: {
                            stacking: 'normal'
                        }
                    };
                    return;
                }
                if (!$scope.chartConfig.plotOptions.series) {
                    $scope.chartConfig.plotOptions.series = {
                        stacking: 'normal'
                    };
                    return;
                }
                $scope.chartConfig.plotOptions.series.stacking = 'normal';
            }

            function setType(type) {
                $scope.chartConfig.options.chart.type = type;
            }

            function fixData(tempData) {
                for (var g = 0; g < tempData.length; g++) {
                    if (!tempData[g].y) tempData[g].y = null;
                    if (tempData[g].y === "" || tempData[g].y === undefined) tempData[g].y = null;
                }
            }

            function getMinValue(data) {
                var min = Infinity;
                for (var i = 0; i < data.length; i++) {
                    if (data[i] < min) min = data[i];
                }
                return min;
            }

            function parseMultivalueData(d) {
                var data = d;
                var i;
                $scope.chartConfig.yAxis.min = getMinValue(data.Data);
                $scope.chartConfig.series = [];
                $scope.chartConfig.xAxis.categories = [];
                for (i = 0; i < data.Cols[1].tuples.length; i++) {
                    $scope.chartConfig.xAxis.categories.push(data.Cols[1].tuples[i].caption.toString());
                }
                var tempData = [];
                var hasChildren = false;
                if (data.Cols[0].tuples.length !== 0) if (data.Cols[0].tuples[0].children) hasChildren = true;
                if (hasChildren) {
                    var k = 0;
                    for(var t = 0; t < data.Cols[0].tuples.length; t++) {
                        for (var c = 0; c < data.Cols[0].tuples[t].children.length; c++) {
                            tempData = [];
                            for (var da = 0; da < data.Cols[1].tuples.length; da++) {
                                tempData.push({
                                    y: data.Data[data.Cols[0].tuples.length * data.Cols[0].tuples[t].children.length * da + t * data.Cols[0].tuples[t].children.length + c],
                                    cube: data.Info.cubeName,
                                    path: data.Cols[1].tuples[t].path
                                });
                                k++;
                            }
                            fixData(tempData);
                            _this.addSeries({
                                data: tempData,
                                name: data.Cols[0].tuples[t].caption + "/" + data.Cols[0].tuples[t].children[c].caption,
                                format: data.Cols[0].tuples[t].children[c].format,
                            });
                        }
                    }
                } else {
                    //for(var j = 0; j < data.Cols[0].tuples.length; j++) {
                    for(var j = data.Cols[0].tuples.length - 1; j>=0; j--) {
                        tempData = [];
                        for (i = 0; i < data.Cols[1].tuples.length; i++) {
                            tempData.push({
                                y: data.Data[i * data.Cols[0].tuples.length + j],
                                drilldown: true,
                                cube: data.Info.cubeName,
                                path: data.Cols[1].tuples[i].path,
                                name: data.Cols[1].tuples[i].caption
                            });
                        }
                        fixData(tempData);
                        var name = "Count";
                        var format = "";
                        if (data.Cols[0].tuples[j]) {
                            name = data.Cols[0].tuples[j].caption;
                            format = data.Cols[0].tuples[j].format;
                        }

                        _this.addSeries({
                            data: tempData,
                            name: name,
                            format: format,
                        });
                    }
                }
            }

            function onResize() {
                if (_this.chart) if (_this.chart.container) if (_this.chart.container.parentNode) _this.chart.setSize(_this.chart.container.parentNode.offsetWidth, _this.chart.container.parentNode.offsetHeight, false);
            }
        }

        return BaseChart;
    }

    angular.module('widgets')
        .factory('BaseChart', ['Lang', 'gridsterConfig', BaseChartFact]);

})();