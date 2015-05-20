(function() {
    'use strict';

    function BaseWidgetFact(Lang, Connector, Filters, Utils) {

        function BaseWidget($scope) {
            var _this = this;
            this.supported = true;
            if ($scope.tile) {
                $scope.item = {};
                Utils.merge($scope.item, $scope.tile);
            }

            this.desc = $scope.getDesc($scope.item.idx);
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
            this.onResize = function(){};

            $scope.item.toolbarView = 'src/views/filters.html';

            if (this.filterCount === undefined) {
                Object.defineProperty(this, "filterCount", {
                    get: function () {
                        return $scope.model.filters.length;
                    }
                });
            }

            function getFilter(idx) {
                return Filters.getFilter($scope.model.filters[idx].idx);
            }

            function requestData() {
                if (!_this.supported) return;
                _this.clearError();
                Connector.execMDX(_this.getMDX()).error(_this._onRequestError).success(_this._retrieveData);
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
                var filterActive = false;
                var i;
                var flt;
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

                for (i = 0; i < filters.length; i++) {
                    flt = filters[i];
                    if (flt.value !== "") {
                        var values = flt.value.split(",");
                        var path = flt.targetProperty;
                        mdx += " %FILTER {";
                        for (var j = 0; j < values.length; j++) {
                            mdx += path + "." + values[j] + ",";
                        }
                        mdx = mdx.substr(0, mdx.length - 1) + " }";
                    }
                }
                return mdx;
            }

            function updateFiltersText() {
                for (var i = 0; i < _this.filterCount; i++) {
                    $scope.model.filters[i].text = _this.getFilter(i).valueDisplay;
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
        .factory('BaseWidget', ['Lang', 'Connector', 'Filters', 'Utils', BaseWidgetFact]);

})();