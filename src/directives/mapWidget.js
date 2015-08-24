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
                    /*var raster = new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'sat'})
                    });*/

                    var map = new ol.Map({
                        layers: [
                            //raster,
                            new ol.layer.Tile({
                                source: new ol.source.OSM()
                            })
                        ],
                        controls: ol.control.defaults({
                            attributionOptions: {
                                collapsible: false
                            }
                        }),
                        target: element[0],
                        view: new ol.View({
                            center: [0, 0],
                            zoom: 2
                        })
                    });
                    //$compile(element)(scope);

                    if (scope.onInit) scope.onInit(map);
                }
            };
        }]);

})();