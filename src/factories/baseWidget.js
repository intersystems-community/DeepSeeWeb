/**
 * Base widget class factory
 */
(function() {
    'use strict';

    function BaseWidgetFact($rootScope, Lang, Connector, Filters, Utils, $q) {

        function BaseWidget($scope) {
            var _this = this;
            //this.drillLevel      = 0;
            // Restore drills. stored in scope to be able change widget type without lose of drills
            this.drills = [];
            if ($scope.item && $scope.item.drills) this.drills = $scope.item.drills;

            if ($scope.item && $scope.item.baseTitle === undefined) $scope.item.baseTitle = $scope.item ? $scope.item.title : $scope.$parent.title;
            this.drillFilter     = "";
            this.showLoading     = showLoading;
            this.hideLoading     = hideLoading;
            this.restoreWidgetType = restoreWidgetType;
            this.changeWidgetType = changeWidgetType;
            // Array of widget names that shall be filtered during drill down
            this.drillFilterWidgets = null;

            if ($scope.tile) {
                $scope.item = {};
                Utils.merge($scope.item, $scope.tile);
            }
            if ($scope.item) this.desc = $scope.getDesc($scope.item.idx);
            var firstRun = true;
            this.supported = true;

            // Setup for actions
            $scope.item.acItems = [];

            // Setup for datasource choser
            $scope.item.dsItems = [];
            $scope.item.dsLabel = "";
            $scope.item.dsSelected = "";
            if (_this.desc && _this.desc.dataSource) $scope.item.dsSelected = Utils.removeExt(_this.desc.dataSource.split("/").pop());
            $scope.onDataSourceChange = onDataSourceChange;
            $scope.item.drillUp = doDrillUp;
            $scope.performAction = performAction;

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

            $scope.$on('$destroy', function () {
                filterListener();
                filterAllListener();
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
            requestPivotData();

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

            function doDrillFilter(path) {
                if (!_this.drillFilterWidgets || !_this.drillFilterWidgets.length) return;
                var i;
                for (i = 0; i < _this.drillFilterWidgets.length; i++) {
                    $rootScope.$broadcast("drillFilter:" + _this.drillFilterWidgets[i], path);
                }
            }

            function onDrillFilter(sc, path) {
                _this.drillFilter = path;
                _this.requestData();
            }

            function performAction(action) {
                if (action.action === 'setColumnSpec') {
                    _this.customColSpec = action.targetProperty;
                    _this.requestData();
                } else {
                    Connector.execAction(action.action, _this.desc.cube).then(requestData);
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
                mdx = mdx.toLowerCase();
                var selTxt = "select non empty";
                var idx1 = mdx.indexOf(selTxt);
                if (idx1 === -1) {
                    selTxt = "select";
                    idx1 = mdx.indexOf(selTxt);
                }
                var idx2 = mdx.indexOf("from");
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
                doDrillFilter(path);

                var old = _this.drills.slice();
                if (path) _this.drills.push({path: path, name: name, category: category}); else _this.drills.pop();
                var mdx = _this.getMDX();
                _this.drills = old;

                _this.showLoading();
                Connector.execMDX(mdx)
                    .error(_this._onRequestError)
                    .success(function(data) {
                        if (isEmptyData(data) && path) {
                            if (noDrillCallback) noDrillCallback();
                            var ddMdx = getDrillthroughMdx(mdx);

                            Connector.execMDX(ddMdx)
                                .success(function(data2) {
                                    if (!data2 || !data2.children || data2.children.length === 0) return;
                                    $scope.item.isDrillthrough = true;
                                    $scope.item.backButton = true;
                                    $scope.item.pivotData = data2;
                                    $scope.item.displayAsPivot(ddMdx);
                                });
                            /*Connector.execMDX(getDrillthroughMdx(mdx)).success(function(dd) {
                                _this._retrieveData(dd);
                            });*/
                            return;
                        }

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
                if (_this.drills.length === 0) return mdx;
                var drills = _this.drills;
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
                    mdx = mdx.replace(" ON 1 FROM", " .children ON 1 FROM");
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
            function changeDataSource(pivot) {
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
                var stdList = ['applyfilter', 'setfilter', 'refresh', 'reloaddashboard', 'showlisting', 'showgeolisting', 'showbreakdown', 'setdatasource',
                    'choosedatasource', 'applyvariable', 'setrowspec', 'chooserowspec', 'setcolumnspec', 'choosecolumnspec', 'viewdashboard', 'navigate',
                    'newwindow', 'setrowcount', 'seteowsort', 'setcolumncount', 'setcolumnsort'];
                var actions = _this.desc.controls.filter(function(el) { return stdList.indexOf(el.action.toLowerCase()) === -1 && el.type !== "hidden"; });
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
                    }
                }

                if (!_this.desc.controls || _this.desc.controls.length === 0) return;
                var chosers = _this.desc.controls.filter(function(el) { return el.action === 'chooseDataSource' || el.action === 'chooseRowSpec' || el.action === 'chooseColumnSpec'; });
                if (chosers.length === 0) return;
                _this.hasDatasourceChoser = true;
                $scope.item.dsItems = [];
                for (var i = 0; i < chosers.length; i++) {
                    var prop = chosers[i].targetProperty;
                    if (!prop) continue;
                    var a = prop.split(".");
                    a.pop();
                    prop = a.join(".");
                    var item = {
                        action: chosers[i].action,
                        label: chosers[i].label || Lang.get("dataSource"),
                        control: chosers[i]
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
                if (ds) Connector.getPivotData(ds).success(_this._retriveDataSource);
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
                var mdx = _this.getMDX();
                if (mdx === "") return;
                _this.clearError();
                if (!firstRun) broadcastDependents();
                firstRun = false;
                Connector.execMDX(mdx).error(_this._onRequestError).success(_this._retrieveData);
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
            /**
             * Return widget MDX depending on active filters
             * @returns {string}
             */
            function getMDX() {
                var filterActive = false;
                var i;
                var flt;
                var path;

                // If widget is linked, use linkedMDX
                if (_this.isLinked()) {
                    var str = _this.linkedMdx || this.desc.linkedMdx || "";
                    str = checkColSpec(str);
                    return applyDrill(str);
                }

                // Check for active filters on widget
                var filters = Filters.getWidgetFilters(_this.desc.name);
                // Add filter for drillFilter feature
                if (_this.drillFilter) {
                    var parts = _this.drillFilter.split("&");
                    filters.push({
                        targetProperty: parts[0].slice(0, -1),
                        value: "&" + parts[1]
                    });
                }
                for (i = 0; i < filters.length; i++) {
                    flt = filters[i];
                    if (flt.value !== "" || flt.isInterval) {
                        filterActive = true;
                        break;
                    }
                }
                var mdx = _this.desc.mdx;
                if (!mdx) console.warn("Widget without MDX");

                if (_this.customRowSpec) {
                    var match = mdx.match(/ON 0,(.*)ON 1/);
                    if (match.length === 2) {
                        var str = match[1];
                        var isNonEmpty = str.indexOf("NON EMPTY") !== -1;
                        mdx = mdx.replace(str, (isNonEmpty ? "NON EMPTY " : " ") + _this.customRowSpec + " ");
                    }
                }

                mdx = checkColSpec(mdx);

                // Don't use filters in widgets placed on tiles
                // TODO: fix this
                if (!filterActive || _this.desc.tile) return applyDrill(mdx);

                // Find all interval filters
                var where = "";
                for (i = 0; i < filters.length; i++) {
                    flt = filters[i];
                    if (!flt.isInterval) continue;
                    path = flt.targetProperty;
                    var v1 = flt.values[flt.fromIdx].path.replace("&[", "").replace("]", "");
                    var v2 = flt.values[flt.toIdx].path.replace("&[", "").replace("]", "");
                    where += " %SEARCH.&[(" + path + " >= '" + v1 + "') AND (" + path + " <= '" + v2 + "')]";
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
                for (var i = 0; i < _this.filterCount; i++) {
                    var flt = _this.getFilter(i);
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
        .factory('BaseWidget', ['$rootScope', 'Lang', 'Connector', 'Filters', 'Utils', '$q', BaseWidgetFact]);

})();