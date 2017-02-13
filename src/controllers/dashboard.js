/**
 * Controller for dashboard screen contains widgets
 * @view views/dashboard.html
 */
(function(){
    'use strict';

    function DashboardCtrl($scope, $rootScope, $routeParams, Connector, Error, Filters, Lang, Utils, CONST, Storage, Variables) {
        var _this = this;
        this.desc = []; // stores widget definition received from server
        this.ctxItem = undefined;
        this.sharedWidget = $routeParams.widget;
        $scope.model = {
            items: []
        };
        var settings = Storage.getAppSettings();
        $scope.gridsterOpts = {
            columns: parseInt(settings.colCount) || 12,
            rowHeight: parseInt(settings.widgetHeight) || (Math.floor((parseInt($(window).height()) - 78)/10))
        };

        if (this.sharedWidget) {
            $scope.gridsterOpts.columns = 1;
            $scope.gridsterOpts.rowHeight = $routeParams.height || "match";
            $scope.gridsterOpts.draggable = {
                enabled: false,
                handle: ''
            };
            $scope.gridsterOpts.resizable = {
                enabled: false,
                handles: []
            };
        }

        $scope.isMobile = dsw.mobile;

        $scope.getDesc = getDesc;
        $scope.onCtxMenuShow = onCtxMenuShow;
        $scope.refreshItem = refreshItem;
        $scope.printItem = printItem;
        $scope.shareItem = shareItem;
        $scope.setType = setType;

        $scope.$on("resetWidgets", function() { window.location.reload(); });


        function mobileScroll(e) {
            console.log(e);
        }
        /**
         * Sets widget type. Widget to change: this.ctxItem
         * @param {string} t Widget type
         */
        function setType(t) {
            if (!_this.ctxItem) return;
            $scope.$broadcast('setType:' + _this.ctxItem, t);
        }

        /**
         * Widget context menu callback. Sets current context widget: this.ctxItem
         * @param item
         */
        function onCtxMenuShow(item) {
            _this.ctxItem = item.$$hashKey;
            $scope.ctxItem = item;
        }

        /**
         * Shares widget and open dialog with iframe code
         */
        function shareItem() {
            if (!_this.ctxItem) return;
            $scope.$broadcast('share:' + _this.ctxItem);
        }

        /**
         * Print callback. Prints this.ctxItem widget
         */
        function printItem() {
            if (!_this.ctxItem) return;
            $scope.$broadcast('print:' + _this.ctxItem);
            _this.ctxItem = undefined;
        }

        /**
         * Refresh callback. Refresh this.ctxItem widget
         */
        function refreshItem() {
            if (!_this.ctxItem) return;
            $scope.$broadcast('refresh:' + _this.ctxItem);
            _this.ctxItem = undefined;
        }
        
        /**
         * Retrieve data callback. Builds widget list
         * @param {object} result Widget list
         */
        function retrieveData(result) {
            var i;

            if (!result) return;
            if (result.Error) {
                Error.show(result.Error);
                return;
            }
            if (!result.widgets) {
                Error.show(Lang.get('errNoWidgets'));
                return;
            }

            if (result.displayInfo && result.displayInfo.gridRows) {
                $scope.gridsterOpts.rowHeight = Math.floor((window.innerHeight - 60)/(result.displayInfo.gridRows));
            }

            Variables.init(result);

            if (result.filters) Filters.init(result.filters, $routeParams.path);
            // TODO: Check if there is actions on toolbar
            var isExists = false;
            if ((Filters.isFiltersOnToolbarExists || Variables.isExists()) && !_this.sharedWidget) {
                // Check if there empty widget exists, if no - we should create it
                for (i = 0; i < result.widgets.length; i++) if (result.widgets[i].type.toLowerCase() === CONST.emptyWidgetClass) isExists = true;
                if (!isExists) {
                    result.widgets.push({dashboard: $routeParams.path, autocreated: true, name: "emptyWidget", type: CONST.emptyWidgetClass, key: "emptyWidgetFor" + $routeParams.path});
                    isExists = true;
                }
            }
            if (dsw.mobile) {
                $rootScope.$broadcast('menu:showFilterButton', isExists);
            }
            if (result.info) $rootScope.$broadcast("menu:changeTitle", result.info.title);
            $scope.model.items = [];
            _this.desc = [];
            for (i = 0; i < result.widgets.length; i++) {
                result.widgets[i].dashboard = $routeParams.path;
                if (_this.sharedWidget && i != _this.sharedWidget) continue;
                // Create item for model
                var item = {
                    idx: i,
                    sizeX: 2,
                    sizeY: 2,
                    row: parseInt(i / 6) * 2,
                    col: (i * 2) % 12,
                    title: result.widgets[i].title,
                    toolbar: true,
                    backButton: false,
                    menuDisabled: false
                };
                if (result.widgets[i].displayInfo) {
                    var tc = 1;
                    var tr = 1;
                    if (result.displayInfo) {
                        tc = Math.floor(12 / result.displayInfo.gridCols);
                        if (tc < 1) tc = 1;
                        //tr = Math.floor(8 / result.displayInfo.gridRows);
                        if (tr < 1) tr = 1;
                    }
                    item.col = result.widgets[i].displayInfo.topCol * tc;
                    item.row = result.widgets[i].displayInfo.leftRow * tr;
                    item.sizeX = (result.widgets[i].displayInfo.colWidth || 1) * tc;
                    item.sizeY = (result.widgets[i].displayInfo.rowHeight || 2);
                }
                if (result.widgets[i].autocreated) {
                    delete item.row;
                    delete item.col;
                }
                if (result.widgets[i].name) setWidgetSizeAndPos(item, result.widgets[i].name.toString());

                // For shared widget set pos to zero and index too
                if (_this.sharedWidget) {
                    item.col = 0;
                    item.row = 0;
                    item.idx = 0;
                    item.sizeX = 1;
                    item.sizeY = 1;
                    item.menuDisabled = true;
                }

                $scope.model.items.push(item);

                // Create item for description
                item = {};
                Utils.merge(item, result.widgets[i]);
                if (!_this.sharedWidget) fillDependentWidgets(item, result.widgets);
                _this.desc.push(item);
            }

            if (!_this.sharedWidget) setTimeout(broadcastDependents, 0);
        }

        /**
         * Send message to refresh all dependent widgets
         */
        function broadcastDependents() {
            var brodcasted = [];
            for (var i = 0; i <  _this.desc.length; i++) if ( _this.desc[i].dependents.length !== 0) {
                var item = _this.desc[i];
                if (brodcasted.indexOf(item.key) != -1) continue;
                brodcasted.push(item.key);
                $rootScope.$broadcast("widget:" + item.key + ":refreshDependents");
            }
        }

        /**
         * Builds dependents list for widget
         * @param {object} item Main widget
         * @param {Array} widgets Array of widgets. Checks any widget in this array, is it dependent from "Main widget"(linked to main widget)
         */
        function fillDependentWidgets(item, widgets) {
            item.dependents = [];
            for (var i = 0; i < widgets.length; i++) if (widgets[i] != item) {
                if (!widgets[i].Link) continue;
                if (widgets[i].Link == item.name) item.dependents.push(widgets[i].key);
            }
        }

        /**
         * Set widget position and size in gridster
         * @param {object} item Gridster item
         * @param {string|number} k Widget key
         */
        function setWidgetSizeAndPos(item, k) {
            var widgets = Storage.getWidgetsSettings($routeParams.path, Connector.getNamespace());
            var w = widgets[k];
            if (!w) return;
            if (w.sizeX !== undefined) item.sizeX = w.sizeX;
            if (w.sizeY !== undefined) item.sizeY = w.sizeY;
            if (w.col !== undefined) item.col = w.col;
            if (w.row !== undefined) item.row = w.row;
        }

        /**
         * Get widget description(actual description retrieved from server)
         * @param {number} idx Widget index
         * @returns {object} Widget description
         */
        function getDesc(idx) {
            if (!_this.desc[idx]) return undefined;
            return _this.desc[idx];
        }

        Connector.getWidgets($routeParams.path).then(retrieveData);
    }

    angular.module('dashboard')
        .controller('dashboard', ['$scope', '$rootScope', '$routeParams', 'Connector', 'Error', 'Filters', 'Lang', 'Utils', 'CONST', 'Storage', 'Variables', DashboardCtrl]);

})();