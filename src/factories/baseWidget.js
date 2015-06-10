(function() {
    'use strict';

    function BaseWidgetFact($rootScope, Lang, Connector, Filters, Utils) {

        function BaseWidget($scope) {
            var _this = this;
            var firstRun = true;
            this.supported = true;
            if ($scope.tile) {
                $scope.item = {};
                Utils.merge($scope.item, $scope.tile);
            }

            this.desc = $scope.getDesc($scope.item.idx);
            this.linkedMdx = "";
            this._onRequestError = onRequestError;
            this._retrieveData = function(){};
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
            this.onResize = function(){};

            $scope.item.toolbarView = 'src/views/filters.html';

            if (this.filterCount === undefined) {
                Object.defineProperty(this, "filterCount", {
                    get: function () {
                        return $scope.model.filters.length;
                    }
                });
            }
            if (this.isLinked()) {
                $scope.$on("widget:" + _this.desc.key + ":setLinkedMDX", onSetLinkedMdx);
            }
            if (this.hasDependents()) {
                $scope.$on("widget:" + _this.desc.key + ":refreshDependents", onRefreshDependents);
            }

            function onRefreshDependents() {
                _this.broadcastDependents();
            }

            function onSetLinkedMdx(sc, mdx) {
                $scope.item.backButton = false;
                if (_this.storedData) _this.storedData = [];
                _this.linkedMdx = mdx;
                _this.requestData();
            }

            function isLinked() {
                return _this.desc.Link;
            }

            function hasDependents() {
                return _this.desc.dependents.length !== 0;
            }

            function getFilter(idx) {
                return Filters.getFilter($scope.model.filters[idx].idx);
            }

            function requestData() {
                if (!_this.supported) return;
                var mdx = _this.getMDX();
                if (mdx === "") return;
                _this.clearError();
                if (!firstRun) broadcastDependents();
                firstRun = false;
                Connector.execMDX(mdx).error(_this._onRequestError).success(_this._retrieveData);
            }

            function broadcastDependents(customMdx) {
                if (_this.hasDependents()) {
                    for (var i = 0; i < _this.desc.dependents.length; i++) {
                        $rootScope.$broadcast("widget:" + _this.desc.dependents[i] + ":setLinkedMDX", customMdx || _this.getMDX());
                    }
                }
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

            function getMDX() {
                if (_this.isLinked()) return _this.linkedMdx;

                var filterActive = false;
                var i;
                var flt;
                var path;
                var filters = Filters.getWidgetFilters(_this.desc.name);
                for (i = 0; i < filters.length; i++) {
                    flt = filters[i];
                    if (flt.value !== "") {
                        filterActive = true;
                        break;
                    }
                }
                var mdx = /*useBasic == true ? _this.desc.basemdx :*/ _this.desc.mdx;
                if (!filterActive) return mdx;

                // fist find all interval filters
                if (mdx.toUpperCase().indexOf("WHERE") !== -1) mdx += " AND";
                for (i = 0; i < filters.length; i++) {
                    flt = filters[i];
                    if (!flt.isInterval) continue;
                    path = flt.targetProperty;
                    if (mdx.toUpperCase().indexOf("WHERE") === -1) mdx += " WHERE";
                    var v1 = flt.values[flt.fromIdx].path.replace("&[", "").replace("]", "");
                    var v2 = flt.values[flt.toIdx].path.replace("&[", "").replace("]", "");
                    mdx += " %SEARCH.&[(" + path + " >= '" + v1 + "') AND (" + path + " <= '" + v2 + "')]";
                }

                // find other filters
                for (i = 0; i < filters.length; i++) {
                    flt = filters[i];
                    if (flt.value !== "" && !flt.isInterval) {
                        var values = flt.value.split(",");
                        path = flt.targetProperty;
                        mdx += " %FILTER {";
                        for (var j = 0; j < values.length; j++) {
                            if (flt.isExclude)
                                mdx += path + "." + values[j] + ".%NOT,";
                            else
                                mdx += path + "." + values[j] + ",";
                        }
                        mdx = mdx.substr(0, mdx.length - 1) + " }";
                    }
                }
                console.log(mdx);
                return mdx;
            }

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

            function showToolbar() {
                $scope.item.toolbar = true;
            }

            function hideToolbar() {
                $scope.item.toolbar = false;
            }

            function clearError() {
                $scope.model.error = "";
            }

            function showError(txt) {
                $scope.model.error = txt;
            }
        }

        return BaseWidget;
    }

    angular.module('widgets')
        .factory('BaseWidget', ['$rootScope', 'Lang', 'Connector', 'Filters', 'Utils', BaseWidgetFact]);

})();