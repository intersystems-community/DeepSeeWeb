(function() {
    'use strict';

    function BaseChartFact(Lang, Connector) {

        function BaseChart($scope) {
            this.desc = $scope.item;

            this.requestData = requestData;
            this.addSeries = addSeries;
            this.setType = setType;
            this.getMinValue = getMinValue;
            this.enableStacking = enableStacking;
            this.clearError = clearError;
            this.showError = showError;

            this.parseData = parseMultivalueData;
            this._retrieveData = retrieveData;
            this._onRequestError = onRequestError;

            var _this = this;

            $scope.item.isChart = true;
            $scope.requestData = this.requestData;
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
                size: {
                    width: 296,
                    height: 250
                },
                lang: {
                    loading: "dd"
                },
                //useHighStocks: true
                loading: true
            };

            function requestData() {
                $scope.chartConfig.loading = true;
                _this.clearError();
                Connector.execMDX(_this.desc.basemdx).error(_this._onRequestError).success(_this._retrieveData);
            }

            function retrieveData(result) {
                $scope.chartConfig.loading = false;
                if (result) _this.parseData(result);
            }

            function onRequestError(e, status) {
                $scope.chartConfig.loading = false;
                var msg = Lang.get("errWidgetRequest");
                switch (status) {
                    case 401: msg = Lang.get('errUnauth'); break;
                    case 404: msg = Lang.get('errNotFound'); break;
                }
                _this.showError(msg);
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

            function clearError() {
                $scope.model.isError = false;
                $scope.model.error = "";
            }

            function showError(txt) {
                $scope.model.error = /*Lang.get("err") + ": " +*/ txt;
                $scope.model.isError = true;
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

                if (data.Cols[0].tuples[0].children) {
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
                                format: data.Cols[0].tuples[t].children[c].format
                            });
                        }
                    }
                } else {
                    for(var j = 0; j < data.Cols[0].tuples.length; j++) {
                        tempData = [];
                        for (i = 0; i < data.Cols[1].tuples.length; i++) {
                            tempData.push({
                                y: data.Data[i * data.Cols[0].tuples.length + j],
                                drilldown: true,
                                cube: data.Info.cubeName,
                                path: data.Cols[1].tuples[i].path
                            });
                        }
                        fixData(tempData);
                        _this.addSeries({
                            data: tempData,
                            name: data.Cols[0].tuples[j].caption,
                            format: data.Cols[0].tuples[j].format
                        });
                    }
                }
            }
        }

        return BaseChart;
    }

    angular.module('widgets')
        .factory('BaseChart', ['Lang', 'Connector', BaseChartFact]);

})();