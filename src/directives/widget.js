/**
 * Directive for widget content
 */
(function() {
    'use strict';

    angular.module('app')

    /**
     * Sets new element directives based on widget type
     */
        .directive('widget', ['$compile', function($compile) {
            return {
                scope: true,
                restrict: 'E',
                templateUrl: "src/views/widget.html",
                link: function ($scope, elem, attrs) {

                    function onTypeChanged() {
                        removeOnChangeListener();
                        elem.empty();
                        $compile(elem)($scope);
                    }
                    $scope._elem = elem;
                    var removeOnChangeListener = $scope.$on('typeChanged', onTypeChanged);
                    $scope.$on('$destroy', function() {
                        $scope._elem = null;
                    });
                }
            };
        }]);
})();