/**
 * Base chart class factory
 */
(function() {
    'use strict';

    function BaseChartFact(Lang, Utils, Connector, $timeout, CONST, Storage) {

        var DEF_ROW_COUNT = 20;
        var DEF_COL_COUNT = 20;

        function BaseChart($scope) {
            this.addSeries           = addSeries;
            this.setType             = setType;
            this.getMinValue         = getMinValue;
            this.enableStacking      = enableStacking;
            this.baseRequestData     = this.requestData;
            this.requestData         = reqestData;
            this.parseData           = parseMultivalueData;
            this.onResize            = onResize;
            this._retrieveData       = retrieveData;
            this.formatNumber        = formatNumber;
            this.initFormatForSeries = initFormatForSeries;
            this.limitSeriesAndData = limitSeriesAndData;
            this.dataInfo            = null;
            this.widgetData          = null;

            var _this    = this;
            var firstRun = true;
            var settings = Storage.getAppSettings();


            $scope.item.isLegend = true;
            var widgetsSettings = Storage.getWidgetsSettings();
            loadToolbarButton(widgetsSettings, "isLegend");
            loadToolbarButton(widgetsSettings, "isTop");
            loadToolbarButton(widgetsSettings, "showZero");
            loadToolbarButton(widgetsSettings, "showValues");
            /*if (widgetsSettings[_this.desc.key]) {
                if (widgetsSettings[_this.desc.key].isLegend !== undefined)  $scope.item.isLegend = widgetsSettings[_this.desc.key].isLegend;
            }
            $scope.item.isTop = false;
            if (widgetsSettings[_this.desc.key]) {
                if (widgetsSettings[_this.desc.key].isTop !== undefined)  $scope.item.isTop = widgetsSettings[_this.desc.key].isTop;
            }
            $scope.item.showZero = false;
            if (widgetsSettings[_this.desc.key]) {
                if (widgetsSettings[_this.desc.key].showZero !== undefined)  $scope.item.showZero = widgetsSettings[_this.desc.key].showZero;
            }*/
            widgetsSettings = null;

            $scope.item.isChart = true;
            $scope.item.displayAsPivot = displayAsPivot;
            $scope.item.toggleLegend = toggleLegend;
            $scope.item.toggleTop = toggleTop;
            $scope.item.toggleValues = toggleValues;
            $scope.item.showZeroOnAxis = showZeroOnAxis;
            $scope.item.isBtnZero = false;
            $scope.item.isBtnValues = false;


            $scope.$on("print:" + $scope.item.$$hashKey, function(){ if (_this.chart) _this.chart.print();});
            $scope.chartConfig = {
                options: {
                    legend: {
                        enabled: $scope.item.isLegend
                    },
                    navigation: {
                        buttonOptions: {
                            align: 'center'
                        }
                    },
                    chart: {
                        type: 'line'
                    },
                    credits: {
                        enabled: false
                    },
                    tooltip: {
                        formatter: defaultFormatter
                    },
                    exporting: {
                        enabled: false
                    },
                    plotOptions: {
                        series: {
                            cursor: "pointer",
                            point: {
                                events: {
                                    click: onPointClick
                                }
                            },
                            dataLabels: {
                                enabled: $scope.item.showValues === true,
                                formatter: labelsFormatter
                            }
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: ""
                    }
                },
                xAxis: {
                    title: {
                        text: ""
                    }
                },
                series: [],
                title: {
                    text: ''
                },
                func: function (chart) {
                    _this.chart = chart;
                    $timeout(function() {
                        if (!_this) return;
                        if (_this.chart) _this.chart.reflow();
                    }, 0);
                },

                loading: true
            };

            if (_this.desc.inline) {
                $scope.chartConfig.options.chart.backgroundColor = null;
                $scope.chartConfig.options.plotOptions ={
                    series: {
                        enableMouseTracking: false
                    }
                };
                $scope.chartConfig.options.legend = {
                    enabled: false
                };

                if (_this.desc.tile) {
                     var opt = {
                        xAxis: {
                            labels: {
                                style: {
                                    color: settings.isMetro ? CONST.fontColorsMetro[_this.desc.tile.fontColor] : CONST.fontColors[_this.desc.tile.fontColor]
                                }
                            }
                        },
                        yAxis: {
                         labels: {
                             style: {
                                 color: settings.isMetro ? CONST.fontColorsMetro[_this.desc.tile.fontColor] : CONST.fontColors[_this.desc.tile.fontColor]
                             }
                         }
                        }
                    };
                    Utils.merge($scope.chartConfig, opt);
                }
            }

            function loadToolbarButton(settings, name) {
                if (settings[_this.desc.key]) {
                    if (settings[_this.desc.key][name] !== undefined)  $scope.item[name] = widgetsSettings[_this.desc.key][name];
                }
            }

            function toggleValues() {
                toggleButton("showValues");
                $scope.chartConfig.options.plotOptions.series.dataLabels.enabled = $scope.item.showValues === true;
            }

            function toggleButton(name) {
                $scope.item[name] = !$scope.item[name];
                var widgetsSettings = Storage.getWidgetsSettings();
                if (!widgetsSettings[_this.desc.key]) widgetsSettings[_this.desc.key] = {};
                widgetsSettings[_this.desc.key][name] = $scope.item[name];
                Storage.setWidgetsSettings(widgetsSettings);
            }

            function setYAxisMinToZero() {
                if ($scope.chartConfig.yAxis instanceof Array) {
                    for (var i = 0; i < $scope.chartConfig.yAxis.length; i++) {
                        $scope.chartConfig.yAxis[i].prevMin = $scope.chartConfig.yAxis[i].currentMin;
                        $scope.chartConfig.yAxis[i].currentMin = 0;
                        //$scope.chartConfig.yAxis[i].min = 0;
                    }
                } else {
                    $scope.chartConfig.yAxis.prevMin = $scope.chartConfig.yAxis.currentMin;
                    $scope.chartConfig.yAxis.currentMin = 0;
                    //$scope.chartConfig.yAxis.min = 0;
                }
            }

            function showZeroOnAxis() {
                /*$scope.item.showZero = !$scope.item.showZero;
                var widgetsSettings = Storage.getWidgetsSettings();
                if (!widgetsSettings[_this.desc.key]) widgetsSettings[_this.desc.key] = {};
                widgetsSettings[_this.desc.key].showZero = $scope.item.showZero;
                Storage.setWidgetsSettings(widgetsSettings);*/
                toggleButton("showZero");

                if ($scope.item.showZero) {
                    setYAxisMinToZero();
                } else {
                    if ($scope.chartConfig.yAxis instanceof Array) {
                        for (var i = 0; i < $scope.chartConfig.yAxis.length; i++) {
                            $scope.chartConfig.yAxis[i].currentMin = $scope.chartConfig.yAxis[i].prevMin;
                            //delete $scope.chartConfig.yAxis[i].min;
                        }
                    } else {
                        $scope.chartConfig.yAxis.currentMin = $scope.chartConfig.yAxis.prevMin;
                        //delete $scope.chartConfig.yAxis.min;
                    }
                }
            }

            function limitSeriesAndData() {
                _this._retrieveData(_this.widgetData);
                return;


                var i, j, c;
                var controls = _this.desc.controls || [];
                var cont = controls.filter(function(el) { return el.action === "setRowCount"; })[0];
                var ser = $scope.chartConfig.series;
                var rowCount = cont ? (cont.value || DEF_ROW_COUNT) : DEF_ROW_COUNT;
                var cont = controls.filter(function(el) { return el.action === "setColumnCount"; })[0];
                var colCount = cont ? (cont.value || DEF_COL_COUNT) : DEF_COL_COUNT;
                rowCount = 4;
                if ($scope.chartConfig.options.plotOptions.series.stacking === "normal" ||
                    !$scope.chartConfig.options.plotOptions.series.stacking) {
                    var cats = $scope.chartConfig.xAxis.categories;
                    if ($scope.item.isTop) {
                        //_this.chart._backupSeries = Utils.merge([], ser);
                        for (c = 0; c < cats.length; c++) {
                            for (i = 0; i < ser.length; i++) {
                                if (ser[i].data[c] instanceof Object) {
                                   if (c + 1 > rowCount) delete ser[i].data[c];
                                }//c < rowCount;
                            }
                        }
                        /*for (i = 0; i < ser.length; i++) {
                            for (j = 0; j < ser[i].data.length; j++) {
                                delete ser[i].data[j];
                            }
                        }*/
                        //_this.chart.xAxis[0].setCategories(cats.slice(0, rowCount));
                    } else {
                        //_this.parseData(_this.widgetData, true);

                    }
                } else {
                    if ($scope.item.isTop) {
                        for (i = 0; i < ser.length; i++) {
                            if (i + 1 > rowCount) ser[i].visible = false;
                            for (j = 0; j < ser[i].data.length; j++) {
                                if (j + 1 > colCount && (ser[i].data[j] instanceof Object)) ser[i].data[j].visible = false;
                            }
                        }
                    } else {
                        for (i = 0; i < ser.length; i++) ser[i].visible = true;
                    }
                }
            }

            function showValues() {
                toggleButton("showValues");
            }

            function toggleTop() {
                /*$scope.item.isTop = !$scope.item.isTop;
                var widgetsSettings = Storage.getWidgetsSettings();
                if (!widgetsSettings[_this.desc.key]) widgetsSettings[_this.desc.key] = {};
                widgetsSettings[_this.desc.key].isTop = $scope.item.isTop;
                Storage.setWidgetsSettings(widgetsSettings);*/
                toggleButton("isTop");

                limitSeriesAndData();
            }

            /**
             * Callback for point click. Used to do drilldown
             * @param {object} e Event
             */
            function onPointClick(e) {
                if (!e.point) return;
                $scope.chartConfig.loading = true;
                _this.doDrill(e.point.path, e.point.name, e.point.category)
                    .then(function() {
                        $scope.chartConfig.loading = false;
                    })
            }

            /**
             * Toggles chart legend and save state in storage
             */
            function toggleLegend() {
                /*$scope.item.isLegend = !$scope.item.isLegend;
                var widgetsSettings = Storage.getWidgetsSettings();
                if (!widgetsSettings[_this.desc.key]) widgetsSettings[_this.desc.key] = {};
                widgetsSettings[_this.desc.key].isLegend = $scope.item.isLegend;
                Storage.setWidgetsSettings(widgetsSettings);*/
                toggleButton("isLegend");
                if (_this.chart) {
                    if ($scope.item.isLegend) _this.chart.legendShow(); else _this.chart.legendHide();
                }
                $scope.chartConfig.legend = {enabled: $scope.item.isLegend};
            }

            /**
             * Displays chart as pivot widget
             */
            function displayAsPivot() {
                if (_this.desc.type === "pivot") {
                    delete $scope.item.pivotMdx;
                    _this.desc.type = _this.desc.oldType;
                    $scope.$broadcast("typeChanged");
                    //$scope.$destroy();
                } else {
                    _this.desc.oldType = _this.desc.type;
                    _this.desc.type = "pivot";
                    $scope.item.pivotMdx = _this.getMDX();
                    $scope.$broadcast("typeChanged");
                    //$scope.$destroy();
                }
            }

            function formatNumber(v, format) {
                var res;
                if (format) res = numeral(v).format(format.replace(/;/g, "")); else res = v.toString();
                if (_this.dataInfo) {
                    res = res.replace(/,/g, _this.dataInfo.numericGroupSeparator)
                             .replace(/\./g, _this.dataInfo.decimalSeparator);
                }
                return res;
            }

            /**
             * Default formatter for chart values
             * @returns {string} Formatted value
             */
            function defaultFormatter() {
                /* jshint ignore:start */
                var t = this;
                /* jshint ignore:end */
                var fmt = t.series.options.format;
                var val = t.y;
                if (fmt) val = _this.formatNumber(val, fmt);
                var a = t.point.name + '<br>' + (t.point.title ? (t.point.title + "<br>") : "")  + t.series.name + ': <b>' + val + "</b><br>";
                if (t.point.percentage) a += parseFloat(t.point.percentage).toFixed(2).toString() + "%";
                return a;
            }

            function labelsFormatter() {
                /* jshint ignore:start */
                var t = this;
                /* jshint ignore:end */
                var fmt = t.series.options.format;
                var val = t.y;
                if (fmt) val = _this.formatNumber(val, fmt);
                return val;
            }

            function initFormatForSeries(d) {
                var series = $scope.chartConfig.series;
                for (var i = 0; i < series.length; i++) {
                    if (!series[i].format) series[i].format = getFormat(d);
                }

                function getFormat(d) {
                    if (!d || !d.Info) return "";
                    var fmt = "";
                    for (var i = 0; i < d.Info.numericGroupSize; i++) fmt += "#";
                    fmt += ",#.##";
                    return fmt;
                }
            }

            /**
             * Requests chart data
             */
            function reqestData() {
                $scope.chartConfig.loading = true;
                _this.baseRequestData();
            }

            /**
             * Callback for chart data request
             * @param {object} result chart data
             */
            function retrieveData(result) {
                if (!_this) return;

                // Store current widget data
                _this.widgetData = {};
                angular.copy(result, _this.widgetData);

                $scope.chartConfig.loading = false;
                if (result.Error) {
                    _this.showError(result.Error);
                    return;
                }
                _this.storedData.push(result);
                if (result) {
                    /*
                     this is fix for incorrect minimum value calculation in bar chart
                     if minimum is 1, highcharts will set it and values are not visible
                     we must set it to zero, to fix this issue
                     */
                    var min = _this.getMinValue(result.Data);
                    if (min > 0 && min <= 10) $scope.chartConfig.yAxis.currentMin = 0;

                    if (!result.Cols) return;

                    if (result.Cols[0].tuples.length === 0) {
                        // cerate default count parameter
                        if (result.Data.length !== 0) result.Cols[0].tuples.push({caption: Lang.get("count")});
                    }
                    _this.parseData(result);
                    if (_this.desc.type.toLowerCase() === "combochart") {
                        $scope.chartConfig.yAxis = [{},{ opposite: true}];
                        $scope.chartConfig.options.yAxis = [{},{}];
                        for (var i = 0; i < $scope.chartConfig.series.length; i++) {
                            switch (i % 3) {
                                case 0: $scope.chartConfig.series[i].type="line";$scope.chartConfig.series[i].zIndex = 2; $scope.chartConfig.series[i].color ="#000000"; break;
                                case 1: $scope.chartConfig.series[i].type="bar"; $scope.chartConfig.series[i].yAxis = 1;$scope.chartConfig.series[i].color = 'rgb(124, 181, 236)';$scope.chartConfig.series[i].zIndex = 0; break;
                                case 2: $scope.chartConfig.series[i].type="area"; break;
                            }
                            $scope.chartConfig.yAxis[i].title = {
                                text: $scope.chartConfig.series[i].name
                            };
                        }
                    }
                    if ($scope.item.showZero) {
                        setYAxisMinToZero();
                        //$scope.chartConfig.yAxis.prevMin = $scope.chartConfig.yAxis.currentMin;
                        //$scope.chartConfig.yAxis.currentMin = 0;
                    }
                    if (firstRun) {
                        firstRun = false;
                        _this.onResize();
                    }
                }
            }

            /**
             * Adds series to chart
             * @param {object} data Series data
             */
            function addSeries(data) {

                if (data && data.data && data.data.length !== 0) {
                    var isEmpty = true;
                    var exists = false;
                    for (var i = 0; i < data.data.length; i++) {
                        var v = data.data[i];
                        if (typeof v !== "object") continue;
                        if (v instanceof Array) continue;
                        exists = true;
                        if (v.y !== 0 && v.y !== "" && v.y !== null && v.y !== undefined) {
                            isEmpty = false;
                            break;
                        }
                    }
                    if (isEmpty && exists) data.showInLegend = false;
                }
                var cols = Highcharts.getOptions().colors;
                data.color = cols[$scope.chartConfig.series.length % cols.length];
                //if (!data.id) data.id = $scope.chartConfig.series.length + 1;
                $scope.chartConfig.series.push(data);
            }

            /**
             * Enables chart stacking
             */
            function enableStacking() {
                var ex = {
                    plotOptions: {
                        series: {
                            stacking: 'normal'
                        }
                    }
                };
                Utils.merge($scope.chartConfig.options, ex);
            }

            /**
             * Set chart type
             * @param {string} type Chart type
             */
            function setType(type) {
                $scope.chartConfig.options.chart.type = type;
            }

            /**
             * Fix data. Removes empty values
             * @param {Array} tempData Data
             */
            function fixData(tempData) {
                for (var g = 0; g < tempData.length; g++) {
                    if (!tempData[g].y) tempData[g].y = null;
                    if (tempData[g].y === "" || tempData[g].y === undefined) tempData[g].y = null;
                }
            }

            /**
             * Returns minimum value of data array
             * @param {Array} data Data
             * @returns {Number} Minimum value
             */
            function getMinValue(data) {
                var min = Infinity;
                for (var i = 0; i < data.length; i++) {
                    if (data[i] < min) min = data[i];
                }
                return min;
            }

            function limitData(d) {
                var i, j, c;
                var controls = _this.desc.controls || [];
                var cont = controls.filter(function(el) { return el.action === "setRowCount"; })[0];
                var rowCount = cont ? (cont.value || DEF_ROW_COUNT) : DEF_ROW_COUNT;
                //rowCount = 20;
                if ($scope.chartConfig.options.plotOptions.series.stacking === "normal" ||
                    !$scope.chartConfig.options.plotOptions.series.stacking ) {
                    var cats = d.Cols[1].tuples;
                    var ser = d.Cols[0].tuples;
                    if ($scope.item.isTop) {
                        cats.splice(rowCount, cats.length - rowCount);
                    }
                }
            }

            /**
             * Parse data and create chart series
             * @param {object} d Data
             */
            function parseMultivalueData(d) {
                var data = d;
                var i;

                limitData(d);

                if (d && d.Info) _this.dataInfo = d.Info;
                $scope.chartConfig.yAxis.min = getMinValue(data.Data);
                $scope.chartConfig.series = [];
                $scope.chartConfig.xAxis.categories = [];
                if (data.Cols[1].tuples.length === 0) {
                    //TODO: lang
                    data.Cols[1].tuples.push({caption: Lang.get("count")});
                }
                for (i = 0; i < data.Cols[1].tuples.length; i++) {
                    $scope.chartConfig.xAxis.categories.push(data.Cols[1].tuples[i].caption.toString());
                }
                var tempData = [];
                var hasChildren = false;
                if (data.Cols[0].tuples.length !== 0) if (data.Cols[0].tuples[0].children && data.Cols[0].tuples[0].children.length !== 0) hasChildren = true;
                if (hasChildren) {
                    var k = 0;
                    for(var t = 0; t < data.Cols[0].tuples.length; t++) {
                        for (var c = 0; c < data.Cols[0].tuples[t].children.length; c++) {
                            tempData = [];
                            for (var g = 0; g < data.Cols[1].tuples.length; g++) {
                                tempData.push({
                                    y: data.Data[data.Cols[0].tuples.length * data.Cols[0].tuples[t].children.length * g + t * data.Cols[0].tuples[t].children.length + c],
                                    cube: data.Info.cubeName,
                                    drilldown: true,
                                    path: data.Cols[1].tuples[g].path,
                                    title: data.Cols[1].tuples[g].title
                                });
                                k++;
                            }
                            fixData(tempData);
                            _this.addSeries({
                                data: tempData,
                                name: data.Cols[0].tuples[t].caption + "/" + data.Cols[0].tuples[t].children[c].caption,
                                format: data.Cols[0].tuples[t].children[c].format || getFormat(data)
                            });
                        }
                    }
                    /*for(var t = 0; t < data.Cols[0].tuples.length; t++) {
                        for (var c = 0; c < data.Cols[0].tuples[t].children.length; c++) {
                            tempData = [];
                            for (var da = 0; da < data.Cols[1].tuples.length; da++) {
                                tempData.push({
                                    y: data.Data[data.Cols[0].tuples.length * data.Cols[0].tuples[t].children.length * da + t * data.Cols[0].tuples[t].children.length + c],
                                    cube: data.Info.cubeName,
                                    path: data.Cols[0].tuples[t].path
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
                    }*/
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
                                name: data.Cols[1].tuples[i].caption,
                                title: data.Cols[1].tuples[i].title,
                            });
                        }
                        fixData(tempData);
                        var name = Lang.get("count");
                        var format = "";
                        if (data.Cols[0].tuples[j]) {
                            name = data.Cols[0].tuples[j].caption;
                            format = data.Cols[0].tuples[j].format;
                        }

                        _this.addSeries({
                            data: tempData,
                            name: name,
                            format: format || getFormat(data)
                        });
                    }
                }
                //_this.chart._backupSeries = [];
                //angular.copy($scope.chartConfig.series, _this.chart._backupSeries);

                //if (ignoreRowLimit !== true) limitSeriesAndData();
            }

            function getFormat(data) {
                if (!data.Info) return "";
                return
            }

            /**
             * Callback for resize event
             */
            function onResize() {
                if (_this.chart) if (_this.chart.container) if (_this.chart.container.parentNode) _this.chart.setSize(_this.chart.container.parentNode.offsetWidth, _this.chart.container.parentNode.offsetHeight, false);
            }
        }

        return BaseChart;
    }

    angular.module('widgets')
        .factory('BaseChart', ['Lang', 'Utils', 'Connector', '$timeout', 'CONST', 'Storage', BaseChartFact]);

})();