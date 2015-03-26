(function(){
    'use strict';

    function WidgetCtrl($scope, Lang, TypeMap) {
        $scope.model = {
            error: "",
            isError: false
        };

        var Type = TypeMap.getClass($scope.item.type);
        if (!Type) {
            showError(Lang.get("errWidgetNotSupported"));
            return;
        }
        Type.apply(this, [$scope]);
        showToolbar();

        function showToolbar() {
            $scope.item.isToolbar = true;
        }

        function clearError() {
            $scope.model.error = "";
            $scope.model.isError = false;
        }

        function showError(txt) {
            $scope.model.error = /*Lang.get("err") + ": " +*/ txt;
            $scope.model.isError = true;
        }
    }

    angular.module('widgets')
        .controller('widget', ['$scope', 'Lang', 'TypeMap', WidgetCtrl]);

})();