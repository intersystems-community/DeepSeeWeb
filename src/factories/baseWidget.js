/**
 * Base widget class factory
 */
(function() {
    'use strict';

    function BaseWidgetFact(
        $rootScope,
        Lang,
        Connector,
        Filters,
        Utils,
        $q,
        Storage,
        $routeParams,
        Variables,
        $location) {

        function BaseWidget($scope) {
            var _this = this;
            //this.drillLevel      = 0;
            // Restore drills. stored in scope to be able change widget type without lose of drills
            this.drills = [];
            if ($scope.item && $scope.item.drills) this.drills = $scope.item.drills;

            if ($scope.item && $scope.item.baseTitle === undefined) $scope.item.baseTitle = $scope.item ? $scope.item.title : $scope.$parent.title;
            this.drillFilter     = "";
            this.drillFilterDrills     = [];
            this.pivotVariables = null;
            this.showLoading     = showLoading;
            this.hideLoading     = hideLoading;
            this.restoreWidgetType = restoreWidgetType;
            this.changeWidgetType = changeWidgetType;
            // Array of widget names that shall be filtered during drill down
            this.drillFilterWidgets = null;
            this._currentData = null;
            this._kpiData = null;

            if ($scope.tile) {
                $scope.item = {};
                Utils.merge($scope.item, $scope.tile);
            }
            if ($scope.item) this.desc = $scope.getDesc($scope.item.idx);
            var firstRun = true;
            this.supported = true;

            // Setup for actions
            $scope.item.acItems = [];

            // Pivot variables items
            $scope.item.pvItems = [];

            // Setup for datasource choser
            $scope.item.dsItems = [];
            $scope.item.dsLabel = "";
            $scope.item.dsSelected = "";
            if (_this.desc && _this.desc.dataSource) $scope.item.dsSelected = Utils.removeExt(_this.desc.dataSource.split("/").pop());
            $scope.onDataSourceChange = onDataSourceChange;
            $scope.emitVarChange = emitVarChange;
            $scope.item.drillUp = doDrillUp;
            $scope.performAction = performAction;

            $scope.item.doExport = doExport;
            this.customColSpec = "";
            this.customRowSpec = "";
            this.customDataSource = "";
            this.pivotData = null;
            this.linkedMdx = "";
            this.hasDatasourceChoser = false;
            this.hasActions = false;
            //this.getDrillMDX = getDrillMDX;
            this._onRequestError = onRequestError;
            this._retrieveData = function(){};
            this._retriveDataSource = onDataSourceReceived;
            this._retriveKPI = onDataKPIReceived;
            this.doDrill = doDrill;
            //this.onDrilldownReceived = onDrilldownReceived;
            this.onInit = function(){};
            this.getMDX = getMDX;
            this.clearError = clearError;
            this.showError = showError;
            this.hideToolbar = hideToolbar;
            this.showToolbar = showToolbar;
            this.requestData = requestData;
            this.updateFiltersText = updateFiltersText;
            this.getFilter = getFilter;
            this.isLinked = isLinked;
            this.hasDependents = hasDependents;
            this.broadcastDependents = broadcastDependents;
            this.destroy = destroy;
            this.getDrillTitle = getDrillTitle;
            this.drillUp = doDrillUp;
            this.doDrillFilter = doDrillFilter;
            this.getDataByColumnName = getDataByColumnName;
            this.getDrillthroughMdx = getDrillthroughMdx;
            this.liveUpdateInterval = null;
            this.onResize = function(){};
            this.canDoDrillthrough = false;

            if (_this.desc.controls && _this.desc.controls.length) {
                this.canDoDrillthrough = _this.desc.controls.find(function (c) {
                        return c.action === "showListing";
                    }) !== undefined;
            }

            //this.liveUpdateInterval = setInterval(_this.requestData, 5000);
            // Find refresh controls with timeout
            if (_this.desc && _this.desc.controls) {

                var colSpec = _this.desc.controls.filter(function (ctrl) {
                    return ctrl.action === "setColumnSpec";
                });
                if (colSpec.length !== 0) _this.customColSpec = colSpec[0].targetProperty;

                var refreshers = _this.desc.controls.filter(function (ctrl) {
                    return ctrl.action === "refresh" && parseInt(ctrl.timeout) > 0;
                });
                if (refreshers.length !== 0) {
                    // Use only one
                    this.liveUpdateInterval = setInterval(_this.requestData, parseInt(refreshers[0].timeout) * 1000);
                }
            }

            $scope.item.toolbarView = 'src/views/filters.html';
            var filterListener = $scope.$on('drillFilter:' + _this.desc.name, onDrillFilter);
            var filterAllListener = $scope.$on('drillFilter:*', onDrillFilter);

            var colSpecListener = $scope.$on('setColSpec:' + _this.desc.name, onColSpecChanged);
            var colSpecAllListener = $scope.$on('setColSpec:*', onColSpecChanged);
            var pivotVarListener = $scope.$on('updatePivotVar:' + _this.desc.name, onPivotVarChanged);
            var pivotVarAllListener = $scope.$on('updatePivotVar:*', onPivotVarChanged);

            var changeDataSourceListener = $scope.$on('changeDataSource:' + _this.desc.name, function(sc, pivot) { changeDataSource(pivot);});

            $scope.$on('$destroy', function () {
                filterListener();
                filterAllListener();
                colSpecListener();
                colSpecAllListener();
                pivotVarListener();
                pivotVarAllListener();
                changeDataSourceListener();
                _this.destroy();
            });

            if (this.filterCount === undefined) {
                Object.defineProperty(this, "filterCount", {
                    get: function () {
                        return $scope.model.filters.length;
                    }
                });
            }
            if (this.isLinked()) $scope.$on("setLinkedMDX:" + _this.desc.key, onSetLinkedMdx);
            if (this.hasDependents()) $scope.$on("widget:" + _this.desc.key + ":refreshDependents", onRefreshDependents);
            
            setupDrillFilter();
            setupChoseDataSource();
            setupActions();
            setupPivotVariables();
            requestPivotData();

            /**
             * Initializes pivot variables
             */
            function setupPivotVariables() {
                var isEmptyWidget = _this.desc.type === "mdx2json.emptyportlet";

                var items = [];
                if (!Variables.isExists()) return;

                items = Variables.items.filter(
                    function (c) {
                        return isEmptyWidget ? (c.location === 'dashboard') : (
                            (c.location !== 'dashboard') &&
                            (c.location === '*' || c.location === _this.desc.name)
                        );
                    }
                );

                $scope.item.pvItems = items;
                showToolbar();
                //if (items.length !== 0) showToolbar();
            }

            /**
             * Callback for pivot variable change
             */
            function emitVarChange(v) {
                var target = v.target;
                $rootScope.$broadcast("updatePivotVar:" + target);
            }

            /**
             * Callback for pivot variable changes
             */
            function onPivotVarChanged() {
               _this.requestData();
            }


            function doExport(type) {
                var opt = {
                    sourceWidth: Math.floor(screen.width/2),
                    sourceHeight: Math.floor(screen.height/2),
                    filename: $scope.item.title || "chart"
                };
                switch (type) {
                    //case 'png':  _this.chart.exportChart(opt); break;
                    case 'svg': opt.type = 'image/svg+xml'; break;
                    case 'jpg': opt.type = 'image/jpeg'; break;
                    case 'pdf': opt.type = 'application/pdf'; break;
                    case 'xls': {
                        var mdx = _this.getMDX();
                        if (_this.lpt) {
                            //mdx = _this.lpt.getActualMDX();
                            var lpt = _this.lpt;
                            mdx = lpt._dataSourcesStack[lpt._dataSourcesStack.length - 1].BASIC_MDX + lpt.dataSource.FILTERS;
                        }
                        var folder = Storage.serverSettings.DefaultApp || "/csp/" + Connector.getNamespace();
                        var url = folder + "/_DeepSee.UI.MDXExcel.zen?MDX=" + encodeURIComponent(mdx);
                        window.open(url);
                        return;
                    }
                    case 'csv': {
                        exportToCsv();
                        return;
                    }
                }
                if (_this.chart) _this.chart.exportChart(opt);
            }

            function exportToCsv() {
                var d = _this._currentData;
                if (!_this.lpt && !d) return;
                var cats, ser, data;
                if (_this.lpt) {
                    ser = _this.lpt.dataController.getData().dimensions[0];
                    cats = _this.lpt.dataController.getData().dimensions[1];
                    data = _this.lpt.dataController.getData().dataArray;
                } else {
                    cats = d.Cols[1].tuples;
                    ser = d.Cols[0].tuples;
                    data = d.Data;
                }
                var nl = "\r\n";
                var sep = "|";
                var csvFile = '"sep=' + sep + '"' + nl;
                var i, j;
                // if (ser.length === 1) {
                //
                // } else {
                    // Build header
                    if (cats[0] && cats[0].dimension) csvFile += cats[0].dimension + sep;
                    for (j = 0; j < ser.length; j++) {
                        csvFile +=ser[j].caption;
                        if (j !== ser.length - 1) csvFile += sep;
                    }
                    csvFile += nl;

                    // Build data
                    for (i = 0; i < (cats.length || (data.length / ser.length)); i++) {
                        if (cats[i] && cats[i].caption) csvFile += cats[i].caption + sep;
                        for (j = 0; j < ser.length; j++) {
                            csvFile += data[i * ser.length + j] || '0';
                            if (j !== ser.length - 1) csvFile += sep;
                        }
                        csvFile += nl;
                    }
               // }

                var filename = (_this.desc.title || 'data') + '.csv';
                var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) { // IE 10+
                    navigator.msSaveBlob(blob, filename);
                } else {
                    var link = document.createElement("a");
                    if (link.download !== undefined) { // feature detection
                        // Browsers that support HTML5 download attribute
                        var url = URL.createObjectURL(blob);
                        link.setAttribute("href", url);
                        link.setAttribute("download", filename);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        setTimeout(function() {
                            link.click();
                            document.body.removeChild(link);
                        }, 10);
                    }
                }

            }

            function getDataByColumnName(data, columnName, dataIndex) {
                if (!data || !data.Data || !data.Cols || !data.Cols[0] || !data.Cols[0].tuples) return;
                var col = data.Cols[0].tuples.filter(function(el) { return el.caption.toLowerCase() === columnName.toLowerCase(); });
                if (col.length === 0) return;
                var idx = data.Cols[0].tuples.indexOf(col[0]);
                return data.Data[dataIndex + idx];
            }

            function setupDrillFilter() {
                var flt = Filters.getClickFilterTarget(_this.desc.name);
                if (flt) _this.drillFilterWidgets = flt.split(",");
            }

            function doDrillFilter(path, drills) {
                if (!_this.drillFilterWidgets || !_this.drillFilterWidgets.length) return;
                var i;
                var dr = drills.slice();
                if (!path) dr.pop();
                for (i = 0; i < _this.drillFilterWidgets.length; i++) {
                    $rootScope.$broadcast("drillFilter:" + _this.drillFilterWidgets[i], path, dr);
                }
            }

            function onDrillFilter(sc, path, drills) {
                _this.drillFilter = path;
                _this.drillFilterDrills = drills;
                _this.requestData();
            }

            function actionNavigate(action, newWindow = false) {
                let url = action.targetProperty;
                let idx = url.toUpperCase().indexOf('DASHBOARD=');
                if (idx !== -1) {
                    let dashboard = url.substring(idx + 10, url.length);
                    // Replace first & to ? if there is no ?
                    if (dashboard.indexOf('?') == -1) dashboard = dashboard.replace('&', '?');
                    let cur = $location.absUrl();
                    let h = cur.indexOf('#');
                    if (h !== -1) {
                        url = cur.split('#')[0] + '#!/d/' + dashboard;
                    } else {
                        url += +'#!/d/' + dashboard;
                    }
                }

                // Build filter string
                let f = [];
                let widgetFilters = Filters.getAffectsFilters(_this.desc.name);
                for (let i = 0; i < widgetFilters.length; i++) {
                    let flt = widgetFilters[i];
                    if (!flt.value) continue;
                    let v = '';
                    if (flt.isInterval) {
                        // Format filter string like path.v1:v2
                        v = flt.targetProperty + '.' + flt.values[flt.fromIdx].path + ':' + flt.values[flt.toIdx].path;
                    } else {
                        v = flt.targetProperty + '.' + (flt.isExclude ? '%NOT ' : '') + flt.value;
                    }
                    // For many selected values make correct filter string {v1,v2,v3}
                    if (v.indexOf('|') !== -1) {
                        v = v.replace(/\|/g, ',').replace('&[', '{&[') + '}';
                    }
                    f.push(v);
                }
                url = url.replace('$$$FILTERS', encodeURIComponent(f.join('~')));

                // Get current value for $$$currvalue
                if (_this.lpt) {
                    if (_this.lpt.getSelectedRows().length) {
                        let d = _this.lpt.dataController.getData();
                        let id = d.dataArray[(_this.lpt.getSelectedRows()[0]-1) * d.columnProps.length];
                        let idx = url.toLowerCase().indexOf('$$$currvalue');
                        if (idx !== -1) {
                            url = url.substring(0, idx) + id + url.substring(idx + 12, url.length);
                        }
                    }
                }

                // Get values for $$$valuelist
                if (_this.lpt) {
                    if (_this.lpt.getSelectedRows().length) {
                        let d = _this.lpt.dataController.getData();
                        let rows = _this.lpt.getSelectedRows();
                        let values = [];
                        for (let j = 0; j < rows.length; j++) {
                            let id = d.dataArray[(rows[j] - 1) * d.columnProps.length];
                            values.push(id);
                        }
                        let idx = url.toLowerCase().indexOf('$$$valuelist');
                        if (idx !== -1) {
                            url = url.substring(0, idx) + values.join(',') + url.substring(idx + 12, url.length);
                        }
                    }
                }

                if (!!$location.search().embed) {
                    url += '&embed=1';
                }

                if (newWindow) {
                    window.open(url, '_blank');
                } else {
                    window.location = url;
                }
            }

            function performAction(action) {
                let a = action.action.toLowerCase();
                
                if (a === 'navigate') {
                    actionNavigate(action);
                } else if (a === 'newwindow') {
                    actionNavigate(action, true);
                } else if (a === 'setColumnSpec') {
                    _this.customColSpec = action.targetProperty;
                    _this.requestData();
                } else {
                    Connector.execAction(action.action, _this.desc.cube ? _this.desc.cube : _this.desc.dataSource.replace('.kpi', '')).then(requestData);
                }
            }

            function getDrillTitle(drill) {
                if (!drill) return $scope.item.baseTitle || "";
                var p = drill.path.split(".");
                p.pop();
                return ($scope.item.baseTitle ? ($scope.item.baseTitle + " - ") : "") + (drill.name ? (p[p.length - 1] + " - ") : "") + (drill.name || drill.category);
            }

            function isEmptyData(data) {
                return !data || !data.Cols || !data.Cols[1] ||
                    !data.Cols[1] || !data.Cols[1].tuples || data.Cols[1].tuples.length === 0 ||
                    !data.Data || data.Data.length === 0 || data.Data[0] === "@NOPROPERTY";
            }


            /**
             * Makes drillup
             */
            //function doDrillUp() {
                /*var path = _this.drills[_this.drills.length - 2];
                 doDrillFilter(path);

                 _this.clearError();
                 _this.storedData.pop();
                 var data = _this.storedData.pop();
                 $scope.item.backButton = _this.storedData.length !== 0;

                 doDrillUp();
                 _this._retrieveData(data);*/
            //}


            function changeWidgetType(newType) {
                _this.desc.oldType = _this.desc.type;
                _this.desc.type = newType;
                $scope.item.drills = _this.drills;
                $scope.$broadcast("typeChanged");
            }

            function restoreWidgetType() {
                delete $scope.item.pivotMdx;
                delete $scope.item.pivotData;
                $scope.item.backButton = _this.drills.length !== 0;
                _this.desc.type = _this.desc.oldType;
                $scope.$broadcast("typeChanged");
            }

            /**
             * Back button click handler
             */
            function doDrillUp() {
                if ($scope.item.isDrillthrough) {
                    restoreWidgetType();
                    $scope.item.isDrillthrough = false;
                } else doDrill();
            }


            function getDrillthroughMdx(mdx) {
                var m = mdx.toLowerCase();
                var selTxt = "select non empty";
                var idx1 = m.indexOf(selTxt);
                if (idx1 === -1) {
                    selTxt = "select";
                    idx1 = m.indexOf(selTxt);
                }
                var idx2 = m.indexOf("from");
                if (idx1 === -1) {
                    console.warn("Can't find 'select' in MDX during calulation drillthrough mdx");
                    return;
                }
                if (idx2 === -1) {
                    console.warn("Can't find 'from' in MDX during calulation drillthrough mdx");
                    return;
                }
                return "DRILLTHROUGH " + mdx.substring(0, idx1 + selTxt.length) + " " +  mdx.substring(idx2, mdx.length);
            }

            /**
             * Makes drill down or drill up if path is empty
             * @param {string} [path] Drill path. If empty then drill up is happens
             * @param {string} [name] Name
             * @param {string} [category] Category
             * @param {function} [noDrillCallback] Function that called if no dill exists
             * @returns {IPromise<T>}
             */
            function doDrill(path, name, category, noDrillCallback) {
                var defer = $q.defer();
                _this.clearError();
                // Apply drill filter if clickfilter is exists
                doDrillFilter(path, _this.drills);

                var old = _this.drills.slice();
                if (path) _this.drills.push({path: path, name: name, category: category}); else _this.drills.pop();
                var mdx = _this.getMDX();
                _this.drills = old;

                _this.showLoading();

                function requestDrillthrough() {
                    if (!_this.canDoDrillthrough) return;
                    if (noDrillCallback) noDrillCallback();
                    var ddMdx = getDrillthroughMdx(mdx);

                    Connector.execMDX(ddMdx)
                        //.error(_this._onRequestError)
                        .then(function(data2) {
                            if (!data2 || !data2.children || data2.children.length === 0) return;
                            $scope.item.isDrillthrough = true;
                            $scope.item.backButton = true;
                            $scope.item.pivotData = data2;
                            $scope.item.displayAsPivot(ddMdx);
                        });
                }


                Connector.execMDX(mdx)
                    .catch(function() { requestDrillthrough(); })
                    .then(function(data) {
                        if ($scope.chartConfig) $scope.chartConfig.loading = false;
                        if (isEmptyData(data) && path && _this.canDoDrillthrough) {
                            requestDrillthrough();
                            /*Connector.execMDX(getDrillthroughMdx(mdx)).success(function(dd) {
                                _this._retrieveData(dd);
                            });*/
                            return;
                        }
                        if (isEmptyData(data)) return;

                        // Drill can be done, store new level and pass received data
                        if (path) _this.drills.push({path: path, name: name, category: category}); else _this.drills.pop();
                        $scope.item.backButton = _this.drills.length !== 0;
                        $scope.item.title = _this.getDrillTitle(_this.drills[_this.drills.length - 1]);

                        _this.broadcastDependents(mdx);
                        _this._retrieveData(data);
                    })
                    .finally(function() {
                        _this.hideLoading();
                        defer.resolve();
                    });


                return defer.promise;
            }



            /**
             * Callback for drilldown data request
             * @param {object} result Drilldown data
             */
            /*function onDrilldownReceived(params) {
                var drillInfo = params.drillInfo;
                var result = params.response.data;
                if (!result) return;
                if (result.Cols[1].tuples.length === 0) return;

                // Store current widget data
                _this.widgetData = {};
                angular.copy(result, _this.widgetData);

                if ($scope.chartConfig) $scope.chartConfig.loading = false;
                if (result.Error) {
                    _this.showError(result.Error);
                    return;
                }
                if (!result.Data || result.Data.length === 0) return;
                var hasValue = false;
                for (var i = 0; i < result.Data.length; i++) if (result.Data[i]) {
                    hasValue = true;
                    break;
                }
                if (!hasValue) return;


                if (drillInfo) {
                    _this.drillLevel++;
                    _this.drills.push(drillInfo.path);
                    var p = drillInfo.path.split(".");
                    p.pop();
                    if (p[p.length - 1] && (drillInfo.name || drillInfo.category)) {
                        _this.titles.push($scope.item.title);
                        $scope.item.title = _this.getDrillTitle(drillInfo.path, drillInfo.name, drillInfo.category);
                    }
                    _this.broadcastDependents(drillInfo.mdx);
                    _this.drillsMDX.push(drillInfo.mdx);
                    $scope.item.backButton = true;
                }

                _this._retrieveData(result);
            }*/


            function applyDrill(mdx) {
                var i;
                if ($routeParams.filter) mdx = mdx + ' %FILTER ' + $routeParams.filter;
                // Drill filter drills
                // if (_this.drillFilterDrills.length) {
                //     for (i = 0; i < _this.drillFilterDrills.length; i++) {
                //         if (_this.drillFilterDrills[i].path) mdx += " %FILTER " + _this.drillFilterDrills[i].path;
                //     }
                //     mdx = mdx.replace(".Members ON 1 FROM", ".Children ON 1 FROM");
                // }

                var drills = _this.drills;
                if (drills.length === 0) drills = _this.drillFilterDrills;
                if (drills.length === 0) return mdx;
                var customDrills = [];
                if (_this.pivotData && _this.pivotData.rowAxisOptions && _this.pivotData.rowAxisOptions.drilldownSpec) {
                    customDrills = _this.pivotData.rowAxisOptions.drilldownSpec.split("^");
                }
                for (i = 0; i < drills.length; i++) {
                    if (drills[i].path) mdx += " %FILTER " + drills[i].path;
                }


                var customDrill = customDrills[drills.length - 1];
                var path = customDrill || drills[drills.length - 1].path;

                // Remove all functions
                // TODO: dont replace %Label
                var match = mdx.match(/ON 0,(.*)ON 1/);
                if (match && match.length === 2) {
                    var str = match[1];
                    var isNonEmpty = str.indexOf("NON EMPTY") !== -1;
                    mdx = mdx.replace(str, (isNonEmpty ? "NON EMPTY " : " ") + path + " ");
                }

                if ((!customDrill && customDrills.length !== 0) || (customDrills.length === 0)) {
                    var idx = mdx.indexOf(".Members ON 1 FROM");
                    if (idx === -1) {
                        mdx = mdx.replace(" ON 1 FROM", " .children ON 1 FROM");
                    } else {
                        mdx = mdx.replace(".Members ON 1 FROM", "." + path.split('.').pop() + ".children ON 1 FROM");
                    }
                    return mdx;
                }

                if (_this.drillFilter) {
                    mdx = mdx + " %FILTER " + _this.drillFilter;
                }

                return mdx;
            }

            /**
             * Returns MDX for drilldown
             * @param {string} path Drilldown path
             * @returns {string} Drilldown MDX
             */
            /*function getDrillMDX(path) {
                var pos = path.indexOf("&");
                var p = path.substr(0, pos) + "Members";

                var mdx = _this.getMDX();

                if (path === "") {
                    mdx = mdx.replace(" ON 1 FROM", " .children ON 1 FROM");
                    return mdx;
                }

                // Remove all functions
                // TODO: dont replace %Label
                var match = mdx.match(/ON 0,(.*)ON 1/);
                if (match && match.length === 2) {
                    var str = match[1];
                    var isNonEmpty = str.indexOf("NON EMPTY") !== -1;
                    mdx = mdx.replace(str, (isNonEmpty ? "NON EMPTY " : " ") + p + " ");
                }

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
                    var match = mdx.match(/ON 0,(.*)ON 1/);
                    if (match && match.length === 2) {
                        var str = match[1];
                        var newstr = str.replace(p, customDrill);
                        mdx = mdx.replace(str, newstr);
                    } else mdx = mdx.replace(re, customDrill);
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
                if (_this.drillFilter) {
                    mdx = mdx + " %FILTER " + _this.drillFilter;
                }
                mdx = mdx + " %FILTER " + path;
                return mdx;
            }
*/
            /**
             * Changes current datasource
             * @param {string} pivot Pivot name
             */
            function changeDataSource(pivot, item) {
                if (item && item.control.target !== '') {
                    var targets = item.control.target.split(',');
                    for (var i = 0; i < targets.length; i++) {
                        $rootScope.$broadcast("changeDataSource:"+ targets[i], pivot);
                    }
                    return;
                }

                if (pivot)
                    _this.customDataSource = pivot;
                else
                    _this.customDataSource = "";
                requestPivotData();
            }

            function onColSpecChanged(sc, path) {
                _this.customColSpec = path;
                _this.requestData();
            }

            /**
             * Change current row spec
             * @param {string} path Path
             */
            function changeRowSpec(path) {
                console.log(path);
                if (!path) _this.customRowSpec = ""; else _this.customRowSpec = path;
                _this.requestData();
            }

            /**
             * Change current col spec
             * @param {string} path Path
             */
            function changeColumnSpec(path, item) {
                var colSpec = "";
                if (path) colSpec = path.replace(/\\/g, "");
                var target = item.control.target;
                $rootScope.$broadcast("setColSpec:" + target, colSpec);
            }

            /**
             * Setup action buttons for widget. Received from controls
             */
            function setupActions() {
                if (!_this.desc.controls || _this.desc.controls.length === 0) return;
                var stdList = ['applyfilter', 'setfilter', 'refresh', 'reloaddashboard', 'setdatasource',
                    'choosedatasource', 'applyvariable', 'setrowspec', 'chooserowspec', 'setcolumnspec',
                    'choosecolumnspec', 'viewdashboard', 'navigate',
                    'newwindow', 'setrowcount', 'setrowsort', 'setcolumncount', 'setcolumnsort', 'newwindow'];
                var actions = _this.desc.controls.filter(function(el) {
                    return stdList.indexOf(el.action.toLowerCase()) !== -1 && el.type !== "hidden";
                });
                if (actions.length === 0) return;
                _this.hasActions = true;
                showToolbar();
                $scope.item.acItems = actions;
                // Filters.isFiltersOnToolbarExists = true;
            }

            /**
             * Event handler for datasource list intem change
             * @param item
             */
            function onDataSourceChange(item) {
                var sel, val, idx;
                sel = $scope.item.dsSelected;
                if (sel) {
                    idx = item.labels.indexOf(sel);
                    if (idx !== -1) val = item.values[idx];
                }
                switch (item.action) {
                    case 'chooseDataSource': changeDataSource(val, item); break;
                    case 'chooseRowSpec': changeRowSpec(val, item); break;
                    case 'chooseColumnSpec': changeColumnSpec(val, item); break;
                }
            }
            /**
             * Will setup datasource choser. If widget has control chooseDataSource
             */
            function setupChoseDataSource() {
                if (!_this.desc) return;

                function getSetter(item) {
                    return function(data) {
                        if (data.data && typeof data.data === "object") {
                            for (var prop in data.data) if (data.data[prop] === _this.desc.dataSource) { $scope.item.dsSelected = prop; }
                            item.labels = [];
                            item.values = [];
                            for (var k in data.data) {
                                item.labels.push(k);
                                item.values.push(data.data[k]);
                            }
                            // Set selection to first item, if current item is wrong
                            if (item.labels.indexOf($scope.item.dsSelected) === -1) {
                                $scope.item.dsSelected = item.labels[0];
                            }
                        }
                    };
                }

                function filterChosers(el) {
                    return el.action === 'chooseDataSource' || el.action === 'chooseRowSpec' || el.action === 'chooseColumnSpec';
                }

                var isEmptyWidget = _this.desc.type === "mdx2json.emptyportlet";

                if (!isEmptyWidget && (!_this.desc.controls || _this.desc.controls.length === 0)) return;
                var choosers = [];
                if (_this.desc.controls) {
                    // Get all chhosers that not placed on dashboard location
                    choosers = _this.desc.controls.filter(filterChosers).filter(
                        function(c) { return c.location !== 'dashboard'; }
                    );
                }

                // If this is empty widget, find other choosers on other widgets with location = "dashboard"
                if (isEmptyWidget) {
                    var k = 0;
                    var desc = $scope.getDesc(k);
                    while (desc) {
                        if (desc.controls){
                            choosers = choosers.concat(
                                desc.controls.filter(filterChosers).filter(
                                    function(c) { return c.location === 'dashboard'; }
                                )
                            );
                        }
                        k++;
                        desc = $scope.getDesc(k);
                    }
                }

                if (choosers.length === 0) return;
                _this.hasDatasourceChoser = true;
                $scope.item.dsItems = [];
                for (var i = 0; i < choosers.length; i++) {
                    var prop = choosers[i].targetProperty;
                    if (!prop) continue;
                    var a = prop.split(".");
                    a.pop();
                    prop = a.join(".");
                    var item = {
                        action: choosers[i].action,
                        label: choosers[i].label || Lang.get("dataSource"),
                        control: choosers[i]
                    };
                    $scope.item.dsItems.push(item);
                    Connector.getTermList(prop).then(getSetter(item));
                }
                showToolbar();
            }

            /**
             * Callback for $on(":refreshDependents"). Sends refresh broadcast to all dependent widgets
             */
            function onRefreshDependents() {
                _this.broadcastDependents();
            }

            /**
             * Updates linked mdx query. Used when widget is linked to another. Callback for $on(":setLinkedMDX")
             * @param {object} sc Scope
             * @param {string} mdx MDX to set
             */
            function onSetLinkedMdx(sc, mdx) {
                //if (_this.storedData) _this.storedData = [];
                // Store in scope to have ability get it after wiget type is changed dynamically

                _this.desc.linkedMdx = mdx;
                _this.linkedMdx = mdx;
                _this.requestData();
            }

            /**
             * Returns linked widget
             * @returns {object} Linked widget
             */
            function isLinked() {
                if (!_this.desc) return false;
                return _this.desc.Link;
            }

            /**
             * Check if widget has dependents
             * @returns {boolean} true if widget has dependents
             */
            function hasDependents() {
                if (!_this.desc) return 0;
                if (!_this.desc.dependents) return 0;
                return _this.desc.dependents.length !== 0;
            }

            /**
             * Get widget filter
             * @param {number} idx Index of filter to get
             * @returns {object} Widget filter
             */
            function getFilter(idx) {
                return Filters.getFilter($scope.model.filters[idx].idx);
            }

            function requestPivotData() {
                var ds = _this.customDataSource || _this.desc.dataSource;
                // Check if this KPI
                if (_this.desc.kpitype) {
                    if (ds) Connector.getKPIData(ds).then(_this._retriveKPI);
                } else {
                    if (ds) Connector.getPivotData(ds).then(_this._retriveDataSource);
                }
            }

            function convertKPIToMDXData(d) {
                var orig = d;
                d = d.Result;
                var res = {Info: {cubeName: orig.Info.KpiName}, Cols: [], Data: []};
                var i, j;
                var cats = [];
                for (i = 0; i < d.Properties.length; i++) {
                    cats.push({caption: d.Properties[i].caption});
                }
                res.Cols.push({tuples: cats});

                var ser = [];
                for (i = 0; i < d.Series.length; i++) {
                    for (j = 0; j < d.Properties.length; j++) {
                        res.Data.push(d.Series[i][d.Properties[j].name]);
                    }
                    ser.push({
                        title: d.Series[i]['%series'],
                        caption: d.Series[i]['%series']
                    });
                }
                res.Cols.push({tuples: ser});
                return res;
            }

            /**
             * Callback for retrieving KPI data
             * @param {object} data KPI data
             */
            function onDataKPIReceived(data) {
                if (!_this) return;
                _this._kpiData = data;
                //_this._desc.kpiName = data.Info;
                if (_this.lpt) {
                    _this.lpt.dataController.setData(_this.lpt.dataSource._convert(convertKPIToMDXData(data)));
                    //_this.lpt.refresh();
                    return;
                }
                _this._retrieveData(convertKPIToMDXData(data));
                //console.log(data);
            }

            function onDataSourceReceived(data) {
                if (!_this) return;
                _this.pivotData = data;
                if (_this.customDataSource) {
                    _this.desc.mdx = data.mdx;
                    _this.requestData();
                }
            }

            /**
             * Request widget data
             */
            function requestData() {
                if (!_this.supported) return;
                //$scope.item.title = _this.baseTitle;
                //_this.drillLevel = 0;
                //_this.drills = [];
                if (_this.desc.kpitype) {
                    var ds = _this.customDataSource || _this.desc.dataSource;
                    if (ds) Connector.getKPIData(ds).then(_this._retriveKPI);
                    return;
                }
                var mdx = _this.getMDX();
                if (!mdx) return;
                _this.clearError();
                setTimeout(broadcastDependents, 0);
                //if (!firstRun) broadcastDependents();
                firstRun = false;

                // Check for variables
                if (mdx.indexOf('$') !== -1 && !this.pivotVariables) {
                    Connector.getPivotVariables(_this.desc.cube).then(function(d) {
                        _this.pivotVariables = d;
                        console.log(d);
                    });
                }

                Connector.execMDX(mdx).catch(_this._onRequestError).then(function(data) {
                    if (!_this) return;
                    _this._currentData = data;
                    _this._retrieveData(data);
                });
            }

            /**
             * Update mdx on dependent widgets
             * @param {string|undefined} customMdx MDX that will be set on all dependent widgets
             */
            function broadcastDependents(customMdx) {
                if (_this.hasDependents()) {
                    for (var i = 0; i < _this.desc.dependents.length; i++) {
                        $rootScope.$broadcast("setLinkedMDX:" + _this.desc.dependents[i], customMdx || _this.getMDX());
                    }
                }
            }

            /**
             * Process request error for widget
             * @param e
             * @param {number} status Error code
             */
            function onRequestError(e, status) {
                if ($scope.chartConfig) $scope.chartConfig.loading = false;
                var msg = Lang.get("errWidgetRequest");
                switch (status) {
                    case 401: msg = Lang.get('errUnauth'); break;
                    case 404: msg = Lang.get('errNotFound'); break;
                }
                _this.showError(msg);
            }

            function checkColSpec(mdx) {
                if (_this.customColSpec) {
                    var selText = "SELECT NON EMPTY";
                    var lastSel = mdx.lastIndexOf(selText);
                    if (lastSel === -1) {
                        selText = "SELECT";
                        lastSel = mdx.lastIndexOf(selText);
                    }
                    if (lastSel === -1) return mdx;
                    var lastOn = mdx.lastIndexOf("ON 0");
                    if (lastOn === -1) return mdx;
                    if (lastOn < lastSel) return mdx;

                    mdx = mdx.replace(mdx.substring(lastSel, lastOn), selText + " " + _this.customColSpec + " ");
                    return mdx;

                    /*var match;
                    match = mdx.match(/SELECT NON EMPTY (.*)ON 0/);
                    if (match && match.length === 2) {
                        var str = match[1];
                        mdx = mdx.replace(str, _this.customColSpec + " ");
                    } else {
                        match =  mdx.match(/SELECT (.*)ON 0/);
                        if (match && match.length === 2) {
                            var str = match[1];
                            mdx = mdx.replace(str, _this.customColSpec + " ");
                        }
                    }*/
                }
                return mdx;
            }

            function replaceMDXVariables(mdx) {
                if (!Variables.items.length || mdx.indexOf('$') === -1) return mdx;

                for (var i = 0; i < Variables.items.length; i++) {
                    var v = Variables.items[i];
                    if (v.value === '') continue;
                    var p = v.targetProperty.toLowerCase();
                    //v.value = 2014;
                    var idx;
                    while ((idx = mdx.toLowerCase().indexOf(p)) !== -1) {
                        mdx = mdx.substr(0, idx) + v.value + mdx.substr(idx + p.length, mdx.length);
                    }
                }
                return mdx;
            }

            /**
             * Adds to mdx filters from query. Used in urls formed from "NewWindow" action*
             * @param {string} mdx MDX to change
             * @returns {string} MDX with filters
             */
            function addQueryFilters(mdx) {
                let querySettings = $location.search().SETTINGS;
                if (!querySettings) return mdx;
                let params = querySettings.split(';');
                let widgetName = null;
                let filters = '';
                for (let i = 0; i < params.length; i++) {
                    let parts = params[i].split(':');
                    if (parts[0].toLowerCase() === 'target') {
                        widgetName = parts[1];
                        continue;
                    }
                    if (parts[0].toLowerCase() === 'filter') {
                        filters = parts.slice(1).join(':');
                    }
                }
                if (widgetName && _this.desc.name === widgetName && filters) {
                    let f = filters.split('~');
                    for (let i = 0; i < f.length; i++) {
                        let s = f[i];
                        let isExclude = s.indexOf('%NOT') !== -1;
                        if (s.indexOf('{') !== -1) {
                            // Many values
                            let path = s.substring(0, s.indexOf('{')).replace('%NOT ', '');
                            let values = s.match(/\{([^)]+)\}/)[1].split(',');
                            mdx += ' %FILTER %OR({';
                            mdx += values.map(v => path + v + (isExclude ? '.%NOT' : '')).join(',');
                            mdx += '})';
                        } else {
                            // One value
                            mdx += " %FILTER " + s;
                        }
                    }
                }

                return mdx;
            }
            /**
             * Return widget MDX depending on active filters
             * @returns {string}
             */
            function getMDX() {
                var filterActive = false;
                var i;
                var flt;
                var path, str;

                // If widget is linked, use linkedMDX
                if (_this.isLinked()) {
                    str = replaceMDXVariables(_this.linkedMdx || this.desc.linkedMdx || "");
                    str = checkColSpec(str);
                    return applyDrill(str);
                }

                // Check for active filters on widget
                var filters = Filters.getWidgetFilters(_this.desc.name);

                // Add filter for drillFilter feature
                if (_this.drillFilter) {
                    var idx = _this.drillFilter.indexOf("&");
                    if (idx !== -1) {
                        filters.push({
                            targetProperty: _this.drillFilter.substring(0, idx - 1),
                            value: "&" + this.drillFilter.substring(idx + 1, _this.drillFilter.length)
                        });
                    }
                }
                for (i = 0; i < filters.length; i++) {
                    flt = filters[i];
                    if (flt.value !== "" || flt.isInterval) {
                        filterActive = true;
                        break;
                    }
                }
                var mdx = replaceMDXVariables(_this.desc.mdx);
                if (!mdx) console.warn("Widget without MDX");

                if (_this.customRowSpec) {
                    var match = mdx.match(/ON 0,(.*)ON 1/);
                    if (match.length === 2) {
                        str = match[1];
                        var isNonEmpty = str.indexOf("NON EMPTY") !== -1;
                        mdx = mdx.replace(str, (isNonEmpty ? "NON EMPTY " : " ") + _this.customRowSpec + " ");
                    }
                }

                // Apply col spec
                mdx = checkColSpec(mdx);
                // Add filters from query params if exists
                mdx = addQueryFilters(mdx);

                // Don't use filters in widgets placed on tiles
                if (!filterActive || _this.desc.tile) return applyDrill(mdx);

                // Find all interval filters
                var where = "";
                for (i = 0; i < filters.length; i++) {
                    flt = filters[i];
                    if (!flt.isInterval) continue;
                    path = flt.targetProperty;
					var v1 = flt.values[flt.fromIdx].path; 
					var v2 = flt.values[flt.toIdx].path;
					mdx += " %FILTER %OR(" + path + "." +  v1 + ":" + v2 + ")";
                }

                // Find other filters
                for (i = 0; i < filters.length; i++) {
                    flt = filters[i];
                    if (flt.value !== "" && !flt.isInterval) {
                        var bracket = "{";
                        if (flt.isExclude) bracket = "(";
                        var values = flt.value.toString().split("|");
                        path = flt.targetProperty;
                        if (flt.isExclude)
                            mdx += " %FILTER " + bracket;
                        else
                            mdx += " %FILTER %OR(" + bracket;
                        for (var j = 0; j < values.length; j++) {
                            if (flt.isExclude)
                                mdx += path + "." + values[j] + ".%NOT,";
                            else
                                mdx += path + "." + values[j] + ",";
                        }
                        bracket = "}";
                        if (flt.isExclude) bracket = ")";
                        mdx = mdx.substr(0, mdx.length - 1) + " " + bracket;
                        if (!flt.isExclude) mdx += ")";
                    }
                }

                // Inserting "where" condition in appropriate part of mdx request
                if (where) {
                    var m = mdx.toUpperCase();
                    var pos = m.indexOf("WHERE");
                    if (pos === -1) {
                        // Where not exists, it should be before %FILTER
                        pos = m.indexOf("%FILTER");
                        if (pos === -1) mdx += " WHERE " + where; else mdx = mdx.slice(0, pos) + " WHERE " + where + " " + mdx.slice(pos);
                    } else {
                        // Insert in exists condition
                        mdx = mdx.slice(0, pos) + " " + where + " AND " + mdx.slice(pos);
                    }
                }

                return applyDrill(mdx);
            }

            /**
             * Update displayed text on filter input controls, depending on active filters
             */
            function updateFiltersText() {
                var flt, i;
                // For empty widget try to get initial filter values before
                if (_this.desc.type === "mdx2json.emptyportlet") {
                    for (i = 0; i < _this.filterCount; i++) {
                        flt = _this.getFilter(i);
                        if (!flt.valueDisplay && flt.value) {
                            flt.valueDisplay = flt.value.replace('&[', '').replace(']', '');
                        }
                    }
                }
                
                for (i = 0; i < _this.filterCount; i++) {
                    flt = _this.getFilter(i);
                    if (flt.isInterval) {
                        $scope.model.filters[i].text = flt.values[flt.fromIdx].name + ":" + flt.values[flt.toIdx].name;
                        continue;
                    }
                    $scope.model.filters[i].text = ((flt.isExclude === true && flt.valueDisplay) ? (Lang.get("not") + " ") : "") + flt.valueDisplay;
                }
            }

            /**
             * Show widget toolbar
             */
            function showToolbar() {
                $scope.item.toolbar = true;
            }

            /**
             * Hide widget toolbar
             */
            function hideToolbar() {
                $scope.item.toolbar = false;
            }

            /**
             * Clears error message on widget holder
             */
            function clearError() {
                $scope.model.error = "";
            }

            /**
             * Display error message on widget holder
             * @param {string} txt
             */
            function showError(txt) {
                $scope.model.error = txt;
            }

            /**
             * Called before widget was destroyed
             */
            function destroy() {
                this._currentData = null;
                // Removing interval updates of widget
                if (_this.liveUpdateInterval) clearInterval(_this.liveUpdateInterval);
                _this.liveUpdateInterval = null;

                _this = null;
            }

            function showLoading() {
                $scope.item.isLoading = true;
            }

            function hideLoading() {
                $scope.item.isLoading = false;
            }
        }

        return BaseWidget;
    }

    angular.module('widgets')
        .factory('BaseWidget', [
            '$rootScope',
            'Lang',
            'Connector',
            'Filters',
            'Utils',
            '$q',
            'Storage',
            '$routeParams',
            'Variables',
            '$location',
            BaseWidgetFact]);

})();