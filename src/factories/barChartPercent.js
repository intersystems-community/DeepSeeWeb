/**
 * Custom chart for KKB to display stacked bar chart with percents and additional data
 */
(function() {
    'use strict';

    function BarChartPercentFact(BaseChart, Utils) {

        function BarChartPercent($scope) {
            BaseChart.apply(this, [$scope]);

            $scope.item.menuDisabled = true;

            var _this            = this;
            _this.oldParseData   = this.parseData;
            _this.parseData      = parseData;
            _this.basePointClick = $scope.chartConfig.options.plotOptions.series.point.events.click;
            _this.baseDrillup    = $scope.item.drillUp;
            _this.noPlanCats     = []; // Stores categories that have no planed value. Used to make it red
            _this.getDrillMDX    = getDrillMDX;
            _this.onResize       = onResize;
            var baseTitle        = $scope.item.title;
            var titles           = [];
            $scope.item.drillUp  = onDrillup;


            // Remove NOW from filters
            // TODO: check this
            if ($scope.model.filters) for (var i = 0; i < $scope.model.filters.length; i++) {
                var f = this.getFilter(i);
                if (f.values) for (var k = 0; k < f.values.length; k++) {
                    if (f.values[k].name && (f.values[k].name.toUpperCase() === "СЕЙЧАС" || f.values[k].name.toUpperCase() === "NOW")) {
                        f.values.splice(k, 1);
                        break;
                    }
                }
            }

            this.setType('bar');
            this.enableStacking();
            var ex = {
                options: {
                    chart: {
                        events: {
                            redraw: onRedraw
                        }
                    },
                    legend: {
                        reversed: true
                    },
                    tooltip: {
                        useHTML: true,
                        formatter: customFormatter
                    },
                    plotOptions: {
                        series: {
                            point: {
                                events: {
                                    click: onPointClick
                                }
                            }
                        }
                    }
                },
                xAxis: {
                    labels: {
                        formatter: formatXAxis,
                        step: 1,
                        style: {
                            //textOverflow: 'none',
                            ///color: "blue",
                            padding: '0px',
                            margin: '0px'
                        }
                    }
                },
                yAxis: {
                    //minRange: 1,
                    plotLines: [{
                        color: 'red',
                        value: 1,
                        width: 2,
                        zIndex: 3
                    }],
                    labels: {
                        formatter: formatYAxis,
                        step: 1
                    }
                }
            };

            Utils.merge($scope.chartConfig, ex);


            function onResize() {
                if (_this.chart) if (_this.chart.container) if (_this.chart.container.parentNode) {
                    if (_this.chart.container.parentNode.offsetHeight < 450) {
                        $scope.chartConfig.xAxis.labels.style["font-size"] = 6;
                    } else {
                        $scope.chartConfig.xAxis.labels.style["font-size"] = 11;
                    }
                    _this.chart.setSize(_this.chart.container.parentNode.offsetWidth, _this.chart.container.parentNode.offsetHeight, false);
                }
            }

            function onDrillup() {
                _this.baseDrillup();
                titles.pop();
                var tit = titles.pop();
                if (!tit) $scope.item.title = baseTitle; else $scope.item.title = baseTitle + " - " + tit;
            }

            /**
             * Returns MDX for drilldown
             * @param {string} path Drilldown path
             * @returns {string} Drilldown MDX
             */
            function getDrillMDX(path) {
                var pos = path.indexOf("&");
                var p = path.substr(0, pos) + "Members";
                var mdx = _this.getMDX();

                var customDrill = "";
                if (_this.pivotData) {
                    var drilldownSpec = "";
                    if (_this.pivotData.rowAxisOptions) if (_this.pivotData.rowAxisOptions.drilldownSpec) drilldownSpec = _this.pivotData.rowAxisOptions.drilldownSpec;
                    if (drilldownSpec) {
                        var drills = drilldownSpec.split("^");
                        if (drills.length !== 0) {
                            if (drills[_this.drillLevel]) customDrill = drills[_this.drillLevel];
                            for (var i = 0; i < _this.drills.length; i++) {
                                if (drills[i]) mdx += " %Filter " + _this.drills[i];
                            }
                        }
                    }
                }
                if (customDrill) {
                    if (customDrill.indexOf('"ИТОГО"') === -1) customDrill = "{" + customDrill + ',%LABEL([podrReal].[All podrReal],"ИТОГО","")}';
                    var match = mdx.match(/ON 0,(.*)ON 1/);
                    if (match.length === 2) {
                        var str = match[1];
                        var isNonEmpty = str.indexOf("NON EMPTY") !== -1;
                        mdx = mdx.replace(str, (isNonEmpty ? "NON EMPTY " : " ") + p + " ");
                    }
                    mdx = mdx.replace(p, customDrill);
                } else {
                    if (mdx.indexOf(p) === -1) {
                        match =  mdx.match(/SELECT(.*)ON 1/);
                        if (match && match.length === 2) {
                            var str = match[1];
                            var isNonEmpty = str.indexOf("NON EMPTY") !== -1;
                            mdx = mdx.replace(str, (isNonEmpty ? " NON EMPTY " : " ") + path + ".Children" + " ");
                        }
                    } else mdx = mdx.replace(p, path + ".Children");
                }
                mdx = mdx + " %FILTER " + path;

                console.log(mdx);

                return mdx;
            }


            /**
             * Used to format Y axis labels
             * @returns {string} Formatted label text
             */
            function formatYAxis() {
                /* jshint ignore:start */
                var t = this;
                /* jshint ignore:end */
                if (t.value === 1) {
                    return '<span style="font-size: 110%;font-weight:bold;color: red">100%</span>';
                }
                return parseFloat(t.value * 100).toFixed(0) + "%";
            }

            /**
             * Used to format X axis labels
             * @returns {string} Formatted label text
             */
            function formatXAxis() {
                /* jshint ignore:start */
                var t = this;
                /* jshint ignore:end */
                if (t.value === "ИТОГО") {
                    return '<span style="font-weight: bold; color: black">' + t.value + '<span>';
                }
                if (_this.noPlanCats.indexOf(t.value) !== -1) {
                    return '<span style="color: red">' + t.value + '<span>';
                }
                return t.value;
            }

            /**
             * Fires after chart have been redrawn
             * Used to add class to summary bar, that will make it bigger
             */
            function onRedraw() {
                if (_this.chart) {
                    if (_this.chart.series.length > 4) {
                        for (var i = 5; i < _this.chart.series.length; i++)
                            if (_this.chart.series[i].data.length !== 0 && _this.chart.series[i].data[0].graphic && _this.chart.series[i].data[0].graphic.element)
                                _this.chart.series[i].data[0].graphic.element.setAttribute("class", "bar-summary");
                    }
                }
            }

            /**
             * Highchart bar click event handler
             * @param {object} e Highcharts click event
             */
            function onPointClick(e) {
                if (e.point.name === "ИТОГО") return;
                _this.basePointClick(e);
                titles.push(e.point.name);
                $scope.item.title = baseTitle + " - " + e.point.name;
            }

            /**
             * Custom tooltip formatter for chart
             */
            function customFormatter() {
                /* jshint ignore:start */
                var t = this;
                /* jshint ignore:end */
                var planned = _this.chart.series[0].processedYData[t.point.index] || 0;
                var nepr = _this.chart.series[3].processedYData[t.point.index] || 0;
                var opl = _this.chart.series[4].processedYData[t.point.index] || 0;
                var sta = _this.chart.series[2].processedYData[t.point.index] || 0;
                var och = _this.chart.series[1].processedYData[t.point.index] || 0;
                var total = och + sta + nepr + opl;
               /* var isPlan = true;
                if (planned === 0) {
                    isPlan = false;
                    planned = total;
                }*/
                var a = '<b>' + t.point.name + '</b><br>';
                if (_this.noPlanCats.indexOf(t.point.name) !== -1) {
                    a += "Запланировано: план отсутствует<br/>";
                } else a += "Запланировано: " + planned + "<br/>";
                a += "<span>&nbsp;</span><br/>";
                a += "Всего пролечено: " +  (opl + nepr);
                if (planned !== 0) a+= " (" + Math.round((opl + nepr) / planned * 100).toFixed(0) +  "%)"; //else a += " (0%)";
                a+= "<br/>";
                a += "из них:<br/>";
                a += "<span>&nbsp;</span><span>&nbsp;</span><span>&nbsp;</span><span>принято к оплате: " + opl;
                if (planned !== 0) a+= " (" + Math.round(opl / planned * 100).toFixed(0) +  "%)</span>"; //else a += " (0%)";
                a+= "<br/>";
                a += "<span>&nbsp;</span><span>&nbsp;</span><span>&nbsp;</span><span>не принято к оплате: " + parseInt(nepr);
                if (planned !== 0) a+= " (" + Math.round(nepr / planned * 100).toFixed(0) +  "%)</span>"; //else a += " (0%)";
                a+= "<br/>";
                a += "<span>&nbsp;</span><br/>";
                a += "Пребывает в стационаре: " + sta;
                if (planned !== 0) a+= " (" + Math.round(sta / planned * 100).toFixed(0) + "%)"; //else a += " (0%)";
                a+= "<br/>";
                a += "В очереди: " + och;
                if (planned !== 0) a+= " (" + Math.round(och / planned * 100).toFixed(0) + "%)"; //else a += " (0%)";
                a+= "<br/>";
                a += "<span>&nbsp;</span><br/>";
                a += "Проноз выполнения плана: " + (opl + nepr + sta + och);
                if (planned !== 0) a+= " (" +  Math.round((opl + nepr + sta + och) / planned * 100).toFixed(0) + "%)"; else {
                    //if (_this.noPlanCats.indexOf(t.point.name) !== -1) a += "(100%)"; else a += " (0%)";
                }
                return a;
            }

            /**
             * Parses data received from server
             * @param {object} data MDX result
             */
            function parseData(data) {
                while(_this.chart.series.length > 0) _this.chart.series[0].remove(false);
                _this.noPlanCats     = [];
                _this.oldParseData(data);
                var maxValue = 0;
                var i, j;
                var l;
                var temp;
                var max, val;

                //Set Y axis min to 100 if data values is lower 100
                max = 0;
                if ($scope.chartConfig.series.length > 4) {
                    for (j = 0; j < $scope.chartConfig.series[0].data.length; j++) {
                        val = 0;
                        for (i = 5; i < $scope.chartConfig.series.length; i++) {
                            val += $scope.chartConfig.series[i].data[j].y;
                        }
                        if (val > max) max = val;
                    }
                }
                if (max < 1) max = 1.1;
                $scope.chartConfig.yAxis.max = max;

                // Find categories without planned values
                for (i = 0, l = $scope.chartConfig.series[0].data.length; i < l; i++) {
                    if ($scope.chartConfig.series[0].data[i].y === null ||
                        $scope.chartConfig.series[0].data[i].y === undefined ||
                        $scope.chartConfig.series[0].data[i].y === "" ||
                        $scope.chartConfig.series[0].data[i].y === 0) {

                            var total = ($scope.chartConfig.series[1].data[i].y || 0) +
                                        ($scope.chartConfig.series[2].data[i].y || 0) +
                                        ($scope.chartConfig.series[3].data[i].y || 0) +
                                        ($scope.chartConfig.series[4].data[i].y || 0);
                            if (total !== 0) {
                                if ($scope.chartConfig.series[1].data[i].y) $scope.chartConfig.series[5].data[i].y = $scope.chartConfig.series[1].data[i].y / total;
                                if ($scope.chartConfig.series[2].data[i].y) $scope.chartConfig.series[6].data[i].y = $scope.chartConfig.series[2].data[i].y / total;
                                if ($scope.chartConfig.series[3].data[i].y) $scope.chartConfig.series[7].data[i].y = $scope.chartConfig.series[3].data[i].y / total;
                                if ($scope.chartConfig.series[4].data[i].y) $scope.chartConfig.series[8].data[i].y = $scope.chartConfig.series[4].data[i].y / total;
                            } else $scope.chartConfig.series[8].data[i].y = 1;

                        _this.noPlanCats.push($scope.chartConfig.series[8].data[i].name);
                        }
                }

                // Setup custom colors for series
                var cols = [];
                cols[3] = "#7fa645";
                cols[3] = "#9fd84b";
                cols[2] = "#00b9ff";
                cols[1] = "#f7a35c";
                cols[0] = "#aaaaaa";
                for (i = 0; i < $scope.chartConfig.series.length; i++) {
                    $scope.chartConfig.series[i].color = cols[(i-1) % cols.length];
                    if (i < 5) {
                        $scope.chartConfig.series[i].visible = false;
                        $scope.chartConfig.series[i].showInLegend = false;
                    }
                }

                // Move summary on top
                var k = $scope.chartConfig.xAxis.categories.length;
                if (k > 1) {
                    temp = $scope.chartConfig.xAxis.categories[0];
                    $scope.chartConfig.xAxis.categories[0] = $scope.chartConfig.xAxis.categories[k - 1];
                    $scope.chartConfig.xAxis.categories[k - 1] = temp;

                    for (var n = 0, ls = $scope.chartConfig.series.length; n < ls; n++) {
                        k = $scope.chartConfig.series[n].data.length;
                        if (k > 1) {
                            temp = $scope.chartConfig.series[n].data[0];
                            $scope.chartConfig.series[n].data[0] = $scope.chartConfig.series[n].data[k - 1];
                            $scope.chartConfig.series[n].data[k - 1] = temp;
                        }
                    }
                }
            }

            this.requestData();
        }

        return BarChartPercent;
    }

    angular.module('widgets')
        .factory('BarChartPercent', ['BaseChart', 'Utils', BarChartPercentFact]);

})();