/**
 * Base chart class factory
 */
(function () {
    'use strict';

    function BaseChartFact(Lang, Utils, Connector, $timeout, CONST, Storage, ngDialog, $window, $routeParams) {

        var DEF_ROW_COUNT = 20;
        var DEF_COL_COUNT = 20;

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
            this.formatNumber = formatNumber;
            this.initFormatForSeries = initFormatForSeries;
            this.limitSeriesAndData = limitSeriesAndData;
            this.toggleButton = toggleButton;
            this.hasOption = hasOption;
            this.dataInfo = null;
            this.widgetData = null;
            this.labelsFormatter = labelsFormatter;
            // Selected point for mobile version to make drill after second tap
            this._selectedPoint = null;
            this.seriesTypes = [];
            var _this = this;
            var firstRun = true;
            var settings = Storage.getAppSettings();

            $scope.item.isLegend = true;
            var widgetsSettings = Storage.getWidgetsSettings(_this.desc.dashboard, Connector.getNamespace()) || {};

            let tc = settings.themeColors[settings.theme] || {};

            // Override theme colors by widget custom colors
            if (widgetsSettings[_this.desc.name] && widgetsSettings[_this.desc.name].themeColors && widgetsSettings[_this.desc.name].themeColors[settings.theme]) tc = widgetsSettings[_this.desc.name].themeColors[settings.theme];

            loadToolbarButton(widgetsSettings, "isLegend");
            loadToolbarButton(widgetsSettings, "isTop");
            loadToolbarButton(widgetsSettings, "showZero");
            loadToolbarButton(widgetsSettings, "showValues");

            // Check for series types
            if (this.desc.overrides && this.desc.overrides[0] && this.desc.overrides[0].seriesTypes) this.seriesTypes = this.desc.overrides[0].seriesTypes.split(',');

            $scope.item.isChart = true;
            $scope.item.displayAsPivot = displayAsPivot;
            $scope.item.toggleLegend = toggleLegend;
            $scope.item.toggleTop = toggleTop;
            $scope.item.toggleValues = toggleValues;
            $scope.item.showZeroOnAxis = showZeroOnAxis;
            $scope.item.showSettings = showSettings;
            $scope.item.isBtnZero = false;
            $scope.item.isBtnValues = false;


            $scope.$on("print:" + $scope.item.$$hashKey, function () {
                if (_this.chart) _this.chart.print();
            });
            $scope.chartConfig = {
                options: {
                    labels: {
                        style: {
                            color: tc.hcTextColor
                        }
                    },
                    drilldown: {
                        activeAxisLabelStyle: {
                                color: tc.hcTextColor
                        },
                        activeDataLabelStyle: {
                                color: tc.hcTextColor
                        }
                    },
                    legend: {
                        enabled: $scope.item.isLegend,
                        itemStyle: {
                            color: tc.hcTextColor
                        }
                    },
                    navigation: {
                        buttonOptions: {
                            align: 'center'
                        }
                    },
                    chart: {
                        type: 'line',
                        backgroundColor: tc.hcBackground
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
                        column: {
                            borderColor: tc.hcBorderColor
                        },
                        bar: {
                            borderColor: tc.hcBorderColor
                        },
                        pie: {
                            borderColor: tc.hcBorderColor
                        },
                        treemap: {
                            borderColor: tc.hcBorderColor
                        },
                        series: {
                            fillOpacity: tc.hcOpacity,
                            cursor: "pointer",
                            point: {
                                events: {
                                    click: onPointClick
                                }
                            },
                            dataLabels: {
                                enabled: $scope.item.showValues === true,
                                formatter: labelsFormatter
                            },
                            events: {
                                legendItemClick: function (event) {
                                    toggleSeries(this.index, !this.visible);
                                }
                            }
                        }
                    }
                },
                yAxis: {
                    events: {},
                    title: {
                        text: ""
                    },
                    labels: {
                        style: {
                            color: tc.hcTextColor
                        }
                    },
                    minorGridLineColor: tc.hcLineColor,
                    gridLineColor: tc.hcLineColor,
                    lineColor: tc.hcLineColor,
                    tickColor: tc.hcLineColor
                },
                xAxis: {
                    events: {},
                    title: {
                        text: ""
                    },
                    labels: {
                        style: {
                            color: tc.hcTextColor
                        }
                    },
                    minorGridLineColor: tc.hcLineColor,
                    gridLineColor: tc.hcLineColor,
                    lineColor: tc.hcLineColor,
                    tickColor: tc.hcLineColor
                },
                series: [],
                title: {
                    text: ''
                },
                func: function (chart) {
                    if (!_this.chart) _this.chart = chart;

                    $timeout(function() {
                        if (!chart) return;
                         chart.reflow();
                    }, 0);
                },

                loading: true
            };

            // Set navigator style
            $scope.chartConfig.options.navigator = {
                outlineColor: tc.hcLineColor,
                xAxis: {
                    gridLineColor: tc.hcLineColor
                },
                yAxis: {
                    gridLineColor: tc.hcLineColor
                }
            };


            // Check for combo chart
            if (_this.desc.type.toLowerCase() === "combochart") {
                $scope.chartConfig.yAxis = [{
                    events: {},
                    gridLineColor: tc.hcLineColor,
                    lineColor: tc.hcLineColor,
                    tickColor: tc.hcLineColor,
                    labels: {
                        style: {
                            color: tc.hcTextColor
                        }
                    }
                }, {
                    events: {},
                    opposite: true,
                    gridLineColor: tc.hcLineColor,
                    lineColor: tc.hcLineColor,
                    tickColor: tc.hcLineColor,
                    labels: {
                        style: {
                            color: tc.hcTextColor
                        }
                    }
                }];
                if (this.desc.overrides && this.desc.overrides[0] && this.desc.overrides[0]._type === 'comboChart') {
                    var combo = this.desc.overrides[0];
                    var l = combo.yAxisList;
                    if (l && l.length) {
                        for (var k = 0; k < l.length; k++) {
                            if (l[k].title) $scope.chartConfig.yAxis[k].title = l[k].title;
                            $scope.chartConfig.yAxis[k].axisType = l[k].axisType;
                            if (l[k].axisType === "percent") {
                                $scope.chartConfig.yAxis[k].labels = {
                                    formatter: function () {
                                        return this.value * 100 + "%";
                                    }
                                };
                            }
                        }
                    }

                }
            }

            if (_this.desc.inline) {
                $scope.chartConfig.options.chart.backgroundColor = null;
                $scope.chartConfig.options.plotOptions = {
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
                            events: {},
                            labels: {
                                style: {
                                    color: $('.' + CONST.fontColors[_this.desc.tile.fontColor]).css('color')
                                }
                            }
                        },
                        yAxis: {
                            events: {},
                            labels: {
                                style: {
                                    color: $('.' + CONST.fontColors[_this.desc.tile.fontColor]).css('color')
                                }
                            }
                        }
                    };
                    Utils.merge($scope.chartConfig, opt);
                }
            }

            /**
             * Shows widget settings(actually color theme)
             */
            function showSettings() {
                let save = () => {
                    Storage.setWidgetsSettings(widgetsSettings, _this.desc.dashboard, Connector.getNamespace());
                    $window.location.reload();
                };
                // Create settings if not exists
                if (!widgetsSettings[_this.desc.name]) {
                    widgetsSettings[_this.desc.name] = {};
                }
                // Create theme if not exists
                if (!widgetsSettings[_this.desc.name].themeColors) {
                    widgetsSettings[_this.desc.name].themeColors = {};
                }
                ngDialog.open({template: 'src/views/settings.html', data: {isWidgetSettings: true, widgetSettings: widgetsSettings[_this.desc.name], saveWidgetSettings: save}, controller: "settings", disableAnimation: dsw.mobile, showClose: true, className: "ngdialog-theme-default wnd-settings" });
            }

            function loadToolbarButton(settings, name) {
                // For embedded widgets firstly try to settings param from URL
                if (Utils.isEmbedded()) {
                    if ($routeParams[name]) {
                        let v = $routeParams[name];
                        if (v.toLowerCase() === 'true') v = true;
                            else
                            if (v.toLowerCase() === 'false') v = false;
                        $scope.item[name] = v;
                        return;
                    }
                }
                if (settings[_this.desc.name]) {
                    if (settings[_this.desc.name][name] !== undefined)  $scope.item[name] = widgetsSettings[_this.desc.name][name];
                }
            }

            function toggleValues() {
                toggleButton("showValues");
                $scope.chartConfig.options.plotOptions.series.dataLabels.enabled = $scope.item.showValues === true;
            }

            function toggleButton(name) {
                $scope.item[name] = !$scope.item[name];
                var widgetsSettings = Storage.getWidgetsSettings(_this.desc.dashboard, Connector.getNamespace());
                if (!widgetsSettings[_this.desc.name]) widgetsSettings[_this.desc.name] = {};
                widgetsSettings[_this.desc.name][name] = $scope.item[name];
                Storage.setWidgetsSettings(widgetsSettings, _this.desc.dashboard, Connector.getNamespace());
            }

            function hasOption(name) {
                var widgetsSettings = Storage.getWidgetsSettings(_this.desc.dashboard, Connector.getNamespace());
                if (!widgetsSettings[_this.desc.name]) return false;
                if (widgetsSettings[_this.desc.name][name] === undefined) return false;
                return true;
            }

            function toggleSeries(index, visiblility) {
                $scope.item[name] = !$scope.item[name];
                var widgetsSettings = Storage.getWidgetsSettings(_this.desc.dashboard, Connector.getNamespace());
                if (!widgetsSettings[_this.desc.name]) widgetsSettings[_this.desc.name] = {};
                if (!widgetsSettings[_this.desc.name].series) widgetsSettings[_this.desc.name].series = {};
                if (!visiblility) {
                    widgetsSettings[_this.desc.name].series[index] = false;
                } else {
                    delete widgetsSettings[_this.desc.name].series[index];
                }
                Storage.setWidgetsSettings(widgetsSettings, _this.desc.dashboard, Connector.getNamespace());
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
                _this.requestData();
            }

            function showValues() {
                toggleButton("showValues");
            }

            function toggleTop() {
                toggleButton("isTop");
                limitSeriesAndData();
            }

            /**
             * Callback for point click. Used to do drilldown
             * @param {object} e Event
             */
            function onPointClick(e) {
                if (!e.point) return;
                if (dsw.mobile) {
                    if (_this._selectedPoint !== e.point) {
                        _this._selectedPoint = e.point;
                        return;
                    }
                }
                $scope.chartConfig.loading = true;
                _this.doDrill(e.point.path, e.point.name, e.point.category)
                    .then(function () {
                        $scope.chartConfig.loading = false;
                    });
            }

            /**
             * Toggles chart legend and save state in storage
             */
            function toggleLegend() {
                toggleButton("isLegend");
                if (_this.chart) {
                    try {
                        if ($scope.item.isLegend) _this.chart.legendShow(); else _this.chart.legendHide();
                    } catch (ex) {
                    }
                }
                $scope.chartConfig.legend = {enabled: $scope.item.isLegend};
            }

            /**
             * Displays chart as pivot widget
             */
            function displayAsPivot(customMdx) {
                if (_this.desc.type === "pivot") {
                    $scope.item.isDrillthrough = null;
                    _this.restoreWidgetType();
                } else {
                    $scope.item.pivotMdx = customMdx || _this.getMDX();
                    _this.changeWidgetType("pivot");
                    //_this.desc.oldType = _this.desc.type;
                    //_this.desc.type = "pivot";

                    ///$scope.$broadcast("typeChanged");
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
                var a = (t.point.name || t.x || '') + '<br>' + (t.point.title ? (t.point.title + "<br>") : "") + t.series.name + ': <b>' + val + "</b><br>";
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
                var i;
                // Store current widget data
                _this.widgetData = {};
                angular.copy(result, _this.widgetData);

                $scope.chartConfig.loading = false;
                if (result.Error) {
                    _this.showError(result.Error);
                    return;
                }
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

                    //buildAxisTitles(result);
                    if (_this.desc.type.toLowerCase() === "combochart") {
                        for (i = 0; i < $scope.chartConfig.series.length; i++) {
                            if ($scope.chartConfig.series[i].type) continue;
                            switch (i % 3) {
                                case 0:
                                    $scope.chartConfig.series[i].type = this.seriesTypes[i] || "bar";
                                    $scope.chartConfig.series[i].zIndex = 2;
                                    $scope.chartConfig.series[i].color = Highcharts.getOptions().colors[1];
                                    break;
                                case 1:
                                    $scope.chartConfig.series[i].type = this.seriesTypes[i] || "line";
                                    $scope.chartConfig.series[i].yAxis = 1;
                                    $scope.chartConfig.series[i].color = Highcharts.getOptions().colors[2];
                                    $scope.chartConfig.series[i].zIndex = 0;
                                    break;
                                case 2:
                                    $scope.chartConfig.series[i].type = this.seriesTypes[i] || "area";
                                    break;
                            }
                            $scope.chartConfig.yAxis[i].title = {
                                text: $scope.chartConfig.series[i].name
                            };
                        }
                    }
                    if ($scope.item.showZero) {
                        setYAxisMinToZero();
                    }
                    if (firstRun) {

                        // Load series toggle from settings
                        var widgetsSettings = Storage.getWidgetsSettings(_this.desc.dashboard, Connector.getNamespace());
                        if (!Utils.isEmbedded()) {
                            if (widgetsSettings[_this.desc.name] && widgetsSettings[_this.desc.name].series) {
                                for (i = 0; i < $scope.chartConfig.series.length; i++) {
                                    if (widgetsSettings[_this.desc.name].series[i] === false) {
                                        $scope.chartConfig.series[i].visible = false;
                                    }
                                }
                            }
                        } else {
                            // For shared widgets hide series via hiddenSeries query param
                            const hidden = $routeParams.hiddenSeries;
                            let ser = [];
                            if (hidden) { ser = hidden.split(','); }
                            ser.forEach(i => {
                                if (!$scope.chartConfig.series[i]) { return; }
                                $scope.chartConfig.series[i].visible = false;
                            });
                        }
                        widgetsSettings = null;

                        firstRun = false;
                        _this.onResize();
                    }
                }
            }

            /**
             * Builds axis titles for chart
             * @param {object} result MDX response from mdx2json
             */
            function buildAxisTitles(result) {
                // if ($scope.chartConfig.options.chart.type === 'line') {
                //     if ($scope.chartConfig.yAxis && result.Cols[0] && result.Cols[0].tuples && result.Cols[0].tuples.length) {
                //         $scope.chartConfig.yAxis.title = {text: result.Cols[0].tuples[0].dimension};
                //     }
                //     if ($scope.chartConfig.xAxis && result.Cols[1] && result.Cols[1].tuples && result.Cols[1].tuples.length) {
                //         $scope.chartConfig.xAxis.title = {text: result.Cols[1].tuples[0].dimension};
                //     }
                //
                // }
                if ($scope.chartConfig.options.chart.type !== 'column') return;


                let isDimensionX = false;
                let isDimensionY = false;
                let mdx = _this.getMDX();
                let idx = mdx.indexOf('ON');
                let idx2 = -1;
                if (idx !== -1) {
                    idx2 = mdx.indexOf('FROM', idx);
                    if (idx2 !== -1) {
                        let part = mdx.substring(idx, idx2);
                        isDimensionY = part.toLowerCase().lastIndexOf('.members') !== -1;
                    }
                }
                if (idx2 !== -1) {
                    idx = idx2;
                    idx2 = mdx.indexOf('FROM', idx);
                    let part = mdx.substring(idx, idx2);
                    isDimensionX = part.toLowerCase().lastIndexOf('.members') !== -1;
                }

                // $scope.chartConfig.yAxis.title = {text: '' };
                // if (isDimensionY) {
                //     if (result.Cols[1] && result.Cols[1].tuples && result.Cols[1].tuples[0] && result.Cols[1].tuples[0].dimension) {
                //         $scope.chartConfig.xAxis.title = {text: result.Cols[1].tuples[0].dimension};
                //     }
                // } else {
                if ($scope.chartConfig.yAxis && result.Cols[0] && result.Cols[0].tuples && result.Cols[0].tuples.length) {
                    $scope.chartConfig.yAxis.title = {text: result.Cols[0].tuples.map(t => t.caption || '').join(' & ')};
                }
                //}

                // $scope.chartConfig.xAxis.title = {text: '' };
                // if (isDimensionX) {
                //     if (result.Cols[0] && result.Cols[0].tuples && result.Cols[0].tuples[0] && result.Cols[0].tuples[0].dimension) {
                //         $scope.chartConfig.yAxis.title = {text: result.Cols[0].tuples[0].dimension};
                //     }
                // } else {
                if ($scope.chartConfig.xAxis && result.Cols[1] && result.Cols[1].tuples && result.Cols[1].tuples.length) {
                    $scope.chartConfig.xAxis.title = {text: result.Cols[1].tuples.map(t => t.caption || '').join(' & ')};
                }
                //}
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
                var cols = tc.hcColors || Highcharts.getOptions().colors;
                data.color = cols[$scope.chartConfig.series.length % cols.length];
                //if (!data.id) data.id = $scope.chartConfig.series.length + 1;

                // Check chart type
                let curIdx = $scope.chartConfig.series.length;
                if (this.seriesTypes && this.seriesTypes[curIdx]) data.type = this.seriesTypes[curIdx];
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
                    if (!tempData[g].y && tempData[g].y !== 0) tempData[g].y = null;
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
                var cont = controls.filter(function (el) {
                    return el.action === "setRowCount";
                })[0];
                var rowCount = cont ? (cont.value || DEF_ROW_COUNT) : DEF_ROW_COUNT;
                //rowCount = 20;
                if ($scope.chartConfig.options.plotOptions.series.stacking === "normal" || !$scope.chartConfig.options.plotOptions.series.stacking) {
                    var cats = d.Cols[1].tuples;
                    var ser = d.Cols[0].tuples;
                    if ($scope.item.isTop) {
                        if (ser.length === 1) {
                            var found = true;
                            while (found) {
                                found = false;
                                var k;
                                for (k = 0; k < d.Data.length - 1; k++) {
                                    if (d.Data[k] < d.Data[k + 1]) {
                                        found = true;
                                        var tmp = d.Data[k];
                                        d.Data[k] = d.Data[k + 1];
                                        d.Data[k + 1] = tmp;
                                        tmp = d.Cols[1].tuples[k];
                                        d.Cols[1].tuples[k] = d.Cols[1].tuples[k + 1];
                                        d.Cols[1].tuples[k + 1] = tmp;
                                    }
                                }
                            }
                            d.Cols[1].tuples.splice(rowCount, d.Cols[1].tuples.length - rowCount);
                            /*var values = d.Data.map(function(el, idx) {
                             return { idx: idx, value: el}
                             });
                             values = values.sort(function(a, b) { return a.value > b.value ? -1 : 1; })
                             var sortedCats = cats.sort(function(a, b) {
                             var cidx1 = cats.indexOf(a);
                             var cidx2 = cats.indexOf(b);
                             var idx1 = values.find(function(v) {return v.idx == cidx1}).idx;
                             var idx2 = values.find(function(v) {return v.idx == cidx2}).idx;
                             return idx1 < idx2 ? 1: -1;
                             });
                             sortedCats.splice(rowCount, cats.length - rowCount);
                             d.Cols[1].tuples = sortedCats;
                             d.Data = values.map(function(v) { return v.value; });*/
                        } else {
                            // As discussed with Shvarov, only reduction of categories
                            // should be performed without sorting
                            // So now this code will look like this
                            d.Cols[1].tuples.splice(rowCount, d.Cols[1].tuples.length - rowCount);
                            return;

                            // var value = ser.length;
                            // var found = true;
                            // while (found) {
                            //     found = false;
                            //     var k;
                            //     var tmpData=[];
                            //     var counter = 0;
                            //
                            //     for(k=0;k<d.Data.length-1;k=k++){
                            //         var tmbObjOne =[];
                            //         for(var t = 0;t<value;t++){
                            //             tmbObjOne.push(d.Data[k]);
                            //             k++;
                            //         }
                            //
                            //         var count = 0;
                            //         for(t = 0; t < tmbObjOne.length; t++)
                            //         {
                            //             count = count + +tmbObjOne[t];
                            //         }
                            //         tmbObjOne.push(count);
                            //         tmbObjOne.push(d.Cols[1].tuples[counter]);
                            //         counter++;
                            //         tmpData.push(
                            //             tmbObjOne
                            //         );
                            //     }
                            //
                            //     for (k = 0; k < tmpData.length - 1; k++) {
                            //         if(tmpData[k][value]<tmpData[k+1][value]){
                            //             found = true;
                            //             var tmp1 = tmpData[k];
                            //             tmpData[k] =  tmpData[k + 1];
                            //             tmpData[k + 1] = tmp1;
                            //         }
                            //     }
                            //     counter = 0;
                            //     for(k = 0; counter < tmpData.length; k=k++){
                            //         for(t =0;t<value;t++){
                            //             d.Data[k] = tmpData[counter][t];
                            //             k++;
                            //         }
                            //         d.Cols[1].tuples[counter] = tmpData[counter][value+1];
                            //         counter++;
                            //     }
                            // }
                        }
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
                var currentAxis = 0;
                // Add non exists axis as count
                if (!data.Cols[1]) {
                    data.Cols[1] = {tuples: []};
                }
                if (data.Cols[1].tuples.length === 0) {
                    //TODO: lang
                    data.Cols[1].tuples.push({caption: Lang.get("count")});
                }

                limitData(d);

                if (d && d.Info) _this.dataInfo = d.Info;
                $scope.chartConfig.yAxis.min = getMinValue(data.Data);
                $scope.chartConfig.series = [];
                $scope.chartConfig.xAxis.categories = [];
                for (i = 0; i < data.Cols[1].tuples.length; i++) {
                    $scope.chartConfig.xAxis.categories.push(data.Cols[1].tuples[i].caption.toString());
                }
                var tempData = [];
                var hasChildren = false;
                var colCountControl = _this.desc.controls.find(c => c.action.toLowerCase() === "setcolumncount");
                if (data.Cols[0].tuples.length !== 0) if (data.Cols[0].tuples[0].children && data.Cols[0].tuples[0].children.length !== 0) hasChildren = true;
                if (hasChildren) {
                    var k = 0;
                    for (var t = 0; t < data.Cols[0].tuples.length; t++) {
                        var len = data.Cols[0].tuples[t].children ? data.Cols[0].tuples[t].children.length : 1;
                        for (var c = 0; c < len; c++) {
                            tempData = [];
                            for (var g = 0; g < data.Cols[1].tuples.length; g++) {
                                tempData.push({
                                    y: +data.Data[data.Cols[0].tuples.length * len * g + t * len + c],
                                    cube: data.Info.cubeName,
                                    drilldown: true,
                                    path: data.Cols[1].tuples[g].path,
                                    title: data.Cols[1].tuples[g].title
                                });
                                k++;
                            }
                            fixData(tempData);
                            if (data.Cols[0].tuples[t].children) {
                                _this.addSeries({
                                    data: tempData,
                                    name: data.Cols[0].tuples[t].caption + "/" + data.Cols[0].tuples[t].children[c].caption,
                                    format: data.Cols[0].tuples[t].children[c].format || getFormat(data)
                                });
                            } else {
                                _this.addSeries({
                                    data: tempData,
                                    name: data.Cols[0].tuples[t].caption,
                                    format: data.Cols[0].tuples[t].format || getFormat(data)
                                });
                            }
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
                    for (var j = data.Cols[0].tuples.length - 1; j >= 0; j--) {

                        if (colCountControl) {
                            if (j >= colCountControl.value) { continue; }
                        }

                        tempData = [];
                        for (i = 0; i < data.Cols[1].tuples.length; i++) {
                            tempData.push({
                                y: +data.Data[i * data.Cols[0].tuples.length + j],
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

                // Set axis for combo chart
                if (_this.desc.type.toLowerCase() === "combochart") {
                    var series = $scope.chartConfig.series;
                    for (var k = 0; k < series.length; k++) {
                        series[k].yAxis = series.length - 1 - k;
                        // Convert to percents if axis show percentage
                        /*if ($scope.chartConfig.yAxis[series.length - 1 - k].axisType === "percent" && series[k].data && series[k].data.length) {
                         for (var n = 0; n < series[k].data.length; n++) {
                         if (series[k].data[n].y !== undefined && !isNaN(series[k].data[n].y)) {
                         series[k].data[n].y *= 100;
                         }
                         }
                         }*/
                    }
                }

            }

            function getFormat(data) {
                if (!data.Info) return "";
                return;
            }

            /**
             * Callback for resize event
             */
            function onResize() {
                //if (_this.chart) if (_this.chart.container) if (_this.chart.container.parentNode) _this.chart.setSize(_this.chart.container.parentNode.offsetWidth, _this.chart.container.parentNode.offsetHeight, false);
                if (_this.chart) _this.chart.reflow();
            }
        }

        return BaseChart;
    }

    angular.module('widgets')
        .factory('BaseChart', ['Lang', 'Utils', 'Connector', '$timeout', 'CONST', 'Storage', 'ngDialog', '$window', '$routeParams', BaseChartFact]);

})();
