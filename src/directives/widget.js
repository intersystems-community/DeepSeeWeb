/**
 * Directive for widget content
 */
(function() {
    'use strict';

    angular.module('app')

    /**
     * Sets new element directives based on widget type
     */
        .directive('widget', ['$compile', 'CONST', function($compile, CONST) {
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
                    function onShowFilters(e, isVisible) {
                        if (isVisible) {

                            var trans = $(elem[0].parentElement).parents('#mobileDashboard').css('transform');
                            $(elem[0].parentElement)
                                .css('display', 'block')
                                .css('transform', trans.replace(/-/g, ''));
                        } else {
                            $(elem[0].parentElement).css('display', 'none');
                        }
                    }

                    $scope._elem = elem;
                    if (dsw.mobile) {
                        // Calc right height
                        var y = elem[0].offsetTop;
                        var hh = $('.navbar').get(0).offsetHeight;
                        var offset = hh*2;
                        if ($scope.item.toolbar) offset += 61; //TODO: calc toolbar height correctly
                        //$(elem[0])
//                            .css('height', 'calc(100% - ' + offset + 'px)');

                        // Check for filter widget
                        if ($scope.item.toolbarView === "src/views/emptyWidgetToolbar.html") {
                            $(elem[0].parentElement)
                                .addClass('mobile-filters-widget')
                                .css('display', 'none');
                            $scope.$on('globalShowFilters', onShowFilters);
                        }
                    }
                    var removeOnChangeListener = $scope.$on('typeChanged', onTypeChanged);
                    $scope.$on('$destroy', function() {
                        $scope._elem = null;
                    });
                }
            };
        }]);
})();