(function(){
    'use strict';

    function DashboardCtrl($scope, $rootScope, $routeParams, Connector, Error, Filters, Lang, Utils, CONST) {
        var _this = this;
        this.desc = []; // stores widget definition received from server
        this.ctxItem = undefined;
        $scope.model = {
            items: []
        };
        $scope.getDesc = getDesc;
        $scope.onCtxMenuShow = onCtxMenuShow;
        $scope.refreshItem = refreshItem;
        $scope.printItem = printItem;
        $scope.setType = setType;
        $scope.$on("resetWidgets", function() { window.location.reload(); });

        function setType(t) {
            if (!_this.ctxItem) return;
            $scope.$broadcast('setType:' + _this.ctxItem, t);
        }

        function onCtxMenuShow(item) {
            _this.ctxItem = item.$$hashKey;
        }

        function printItem() {
            if (!_this.ctxItem) return;
            $scope.$broadcast('print:' + _this.ctxItem);
            _this.ctxItem = undefined;
        }

        function refreshItem() {
            if (!_this.ctxItem) return;
            $scope.$broadcast('refresh:' + _this.ctxItem);
            _this.ctxItem = undefined;
        }

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
            if (result.filters) Filters.init(result.filters);
            if (Filters.isFiltersOnToolbarExists) {
                // Check if there empty widget exists, if no - we should create it
                var isExists = false;
                for (i = 0; i < result.widgets.length; i++) if (result.widgets[i].type.toLowerCase() === CONST.emptyWidgetClass) isExists = true;
                if (!isExists) {
                    result.widgets.push({autocreated: true, name: "emptyWidget", type: CONST.emptyWidgetClass, key: "emptyWidgetFor" + $routeParams.path});
                }
            }
            if (result.info) $rootScope.$broadcast("menu:changeTitle", result.info.title);
            $scope.model.items = [];
            _this.desc = [];
            for (i = 0; i < result.widgets.length; i++) {
                // Create item for model
                var item = {
                    idx: i,
                    sizeX: 2,
                    sizeY: 2,
                    row: parseInt(i / 6) * 2,
                    col: (i * 2) % 12,
                    title: result.widgets[i].title,
                    toolbar: true,
                    backButton: false
                };
                if (result.widgets[i].displayInfo) {
                    var tc = 1;
                    var tr = 1;
                    if (result.displayInfo) {
                        tc = Math.floor(12 / result.displayInfo.gridCols);
                        if (tc < 1) tc = 1;
                        tr = Math.floor(8 / result.displayInfo.gridRows);
                        if (tr < 1) tr = 1;
                    }
                    item.col = result.widgets[i].displayInfo.topCol * tc;
                    item.row = result.widgets[i].displayInfo.leftRow * tr;
                    item.sizeX = result.widgets[i].displayInfo.colWidth * tc;
                    item.sizeY = result.widgets[i].displayInfo.rowHeight * tr;
                }
                if (result.widgets[i].autocreated) {
                    delete item.row;
                    delete item.col;
                }
                if (result.widgets[i].key) setWidgetSizeAndPos(item, result.widgets[i].key.toString());
                $scope.model.items.push(item);

                // Create item for description
                item = {};
                Utils.merge(item, result.widgets[i]);
                fillDependentWidgets(item, result.widgets);
                _this.desc.push(item);
            }

            setTimeout(broadcastDependents, 0);
        }

        function broadcastDependents(widgets) {
            var brodcasted = [];
            for (var i = 0; i <  _this.desc.length; i++) if ( _this.desc[i].dependents.length !== 0) {
                var item = _this.desc[i];
                if (brodcasted.indexOf(item.key) != -1) continue;
                brodcasted.push(item.key);
                $rootScope.$broadcast("widget:" + item.key + ":refreshDependents");
            }
        }

        function fillDependentWidgets(item, widgets) {
            item.dependents = [];
            for (var i = 0; i < widgets.length; i++) if (widgets[i] != item) {
                if (!widgets[i].Link) continue;
                if (widgets[i].Link == item.name) item.dependents.push(widgets[i].key);
            }
        }

        function setWidgetSizeAndPos(item, k) {
            if (localStorage["sizes" + k + "x"] !== undefined)  item.sizeX = parseInt(localStorage["sizes" + k + "x"]);
            if (localStorage["sizes" + k + "y"] !== undefined)  item.sizeY = parseInt(localStorage["sizes" + k + "y"]);
            if (localStorage["pos" + k + "x"] !== undefined)  item.col = parseInt(localStorage["pos" + k + "x"]);
            if (localStorage["pos" + k + "y"] !== undefined)  item.row = parseInt(localStorage["pos" + k + "y"]);
        }

        function getDesc(idx) {
            if (!_this.desc[idx]) return undefined;
            return _this.desc[idx];
        }

        Connector.getWidgets($routeParams.path).success(retrieveData);
    }

    angular.module('dashboard')
        .controller('dashboard', ['$scope', '$rootScope', '$routeParams', 'Connector', 'Error', 'Filters', 'Lang', 'Utils', 'CONST', DashboardCtrl]);

})();