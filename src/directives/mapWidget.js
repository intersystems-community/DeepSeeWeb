/**
 * Directives for map widget
 */
(function() {
    'use strict';

    angular.module('app')

    /**
     * Creates map widget
     */
        .directive('mapWidget', ['$parse', '$compile', 'Lang', 'Connector', function($parse, $compile, Lang, Connector) {
            return {
                link: function(scope, element, attrs) {
                    element.removeAttr('map-widget');
                    element[0].innerHTML =  "maaap";
                    $compile(element)(scope);
                }
            };
        }]);

})();