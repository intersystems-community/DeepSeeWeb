(function(){
    'use strict';

    function DashboardCtrl($scope, $routeParams, Connector, Error, Filters, Lang) {
        var _this = this;
        this.desc = []; // stores widget definition received from server
        this.ctxItem = undefined;
        $scope.model = {
            items: []
        };
        $scope.getDesc = getDesc;
        $scope.onCtxMenuShow = onCtxMenuShow;
        $scope.refreshItem = refreshItem;
        $scope.setType = setType;
        $scope.$on("resetWidgets", function() { window.location.reload(); });

        function setType(t) {
            if (!_this.ctxItem) return;
            $scope.$broadcast('setType:' + _this.ctxItem, t);
        }

        function onCtxMenuShow(item) {
            _this.ctxItem = item.$$hashKey;
        }

        function refreshItem() {
            if (!_this.ctxItem) return;
            $scope.$broadcast('refresh:' + _this.ctxItem);
            _this.ctxItem = undefined;
        }

        function retrieveData(result) {
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

            $scope.model.items = [];
            _this.desc = [];
            for (var i = 0; i < result.widgets.length; i++) {
                // Create item for model
                var item = {
                    idx: i,
                    sizeX: 2,
                    sizeY: 2,
                    row: parseInt(i / 6) * 2,
                    col: (i * 2) % 12,
                    title: result.widgets[i].title,
                    toolbar: true
                };
                if (result.widgets[i].key) setWidgetSizeAndPos(item, result.widgets[i].key.toString());
                /*if (localStorage["pos" + result.widgets[i].key + "x"] === undefined) {
                    if ((item.sizeX != 2) || (item.sizeY != 2)) {
                        item.row = parseInt(i / 6) * item.sizeX;
                    }
                }*/
                $scope.model.items.push(item);

                // Create item for description
                item = {};
                for (var attr in result.widgets[i]) { item[attr] = result.widgets[i][attr]; }
                _this.desc.push(item);
            }
        }

        function setWidgetSizeAndPos(item, k) {
            if (localStorage["sizes" + k + "x"])  item.sizeX = parseInt(localStorage["sizes" + k + "x"]);
            if (localStorage["sizes" + k + "y"])  item.sizeY = parseInt(localStorage["sizes" + k + "y"]);
            if (localStorage["pos" + k + "x"])  item.col = parseInt(localStorage["pos" + k + "x"]);
            if (localStorage["pos" + k + "y"])  item.row = parseInt(localStorage["pos" + k + "y"]);
        }

        function getDesc(idx) {
            if (!_this.desc[idx]) return undefined;
            return _this.desc[idx];
        }

        Connector.getWidgets($routeParams.path).success(retrieveData);
    }

    angular.module('dashboard')
        .controller('dashboard', ['$scope', '$routeParams', 'Connector', 'Error', 'Filters', 'Lang', DashboardCtrl]);

})();