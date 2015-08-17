(function() {
    'use strict';

    function EmptyWidgetFact($rootScope, Lang, Filters, Storage) {

        function EmptyWidget($scope) {
            var _this = this;
            $scope.item.title = Lang.get("filters");
            $scope.item.toolbar = true;
            //$scope.item.toolbarView = '';
            $scope.item.toolbarView = 'src/views/emptyWidgetToolbar.html';
            $scope.item.setFiltersToDefaults = setFiltersToDefaults;
            $scope.item.viewSize = getViewSize(); // viewSize - value in % to place filtes (can be 33, 50, 100)
            $scope.item.setViewSize = setViewSize;

            this.requestData = function(){};

            function setFiltersToDefaults() {
                for (var i = 0; i < _this.filterCount; i++) {
                    var flt = _this.getFilter(i);
                    flt.isInterval = false;
                    flt.isExclude = false;
                    flt.fromIdx = -1;
                    flt.toIdx = -1;
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
                var widgets = Storage.getWidgetsSettings();
                if (!widgets[_this.desc.key]) return 100;
                if (widgets[_this.desc.key].viewSize === undefined) return 100;
                return widgets[_this.desc.key].viewSize;
            }

            function saveViewSize() {
                var widgets = Storage.getWidgetsSettings();
                if (!widgets[_this.desc.key]) widgets[_this.desc.key] = {};
                widgets[_this.desc.key].viewSize = $scope.item.viewSize;
                Storage.setWidgetsSettings(widgets);
            }
        }

        return EmptyWidget;
    }

    angular.module('widgets')
        .factory('EmptyWidget', ['$rootScope', 'Lang', 'Filters', 'Storage', EmptyWidgetFact]);

})();