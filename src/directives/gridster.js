/**
 * Directive for gridster
 */
(function() {
    'use strict';

    angular.module('app')
        .directive('gridster', function() {
            return {
                restrict: 'A',
                link: function ($scope, elem, attrs) {
                    $(elem).gridster({
                        widget_selector: "div",
                        widget_margins: [10, 10],
                        widget_base_dimensions: [100, 100]
                    });
                }
            };
        });

})();