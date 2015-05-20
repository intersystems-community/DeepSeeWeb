(function() {
    'use strict';

    function EmptyWidgetFact($rootScope, Lang, Filters, Utils) {

        function EmptyWidget($scope) {
            var _this = this;
            $scope.item.title = Lang.get("filters");
            $scope.item.toolbar = true;
            //$scope.item.toolbarView = '';
            $scope.item.toolbarView = 'src/views/emptyWidgetToolbar.html';
            $scope.item.setFiltersToDefaults = setFiltersToDefaults;
            $scope.item.viewSize = getViewSize();
            $scope.item.setViewSize = setViewSize;

            function setFiltersToDefaults() {
                for (var i = 0; i < _this.filterCount; i++) {
                    var flt = _this.getFilter(i);
                    flt.values.forEach(function(fv){
                        fv.checked = fv.default === true;
                    });
                    Filters.applyFilter(flt, true);
                }
                $rootScope.$broadcast("filterAll");
                _this.updateFiltersText();
            }

            function setViewSize(n) {
                $scope.item.viewSize = n;
                saveViewSize();
            }

            function getViewSize() {
                return localStorage["widget" + _this.desc.key + "viewSize"] || 100;
            }

            function saveViewSize() {
                localStorage["widget" + _this.desc.key + "viewSize"] = $scope.item.viewSize;
            }
        }

        return EmptyWidget;
    }

    angular.module('widgets')
        .factory('EmptyWidget', ['$rootScope', 'Lang', 'Filters', 'Utils', EmptyWidgetFact]);

})();