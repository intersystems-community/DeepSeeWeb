/**
 * Directives for map widget
 */
(function() {
    'use strict';

    angular.module('app')

    /**
     * Creates map widget
     */
        .directive('mapWidget', ['$templateCache', '$compile', function($templateCache, $compile) {
            return {
                template: function(element, attrs) {
                    return "<div ng-show='model.tooltip.visible'><div class='panel panel-default map-tooltip'>" +
                               "<div style='text-align: center;'><strong>{{model.tooltip.name}}</strong></div>" +
                               "<div ng-repeat='item in model.tooltip.items'>{{item.label}}: {{item.value}}</div>" +
                           "</div>"+
                           "<div class='arrow_box'></div></div>";
                },
                link: function(scope, element, attrs) {
                    element.removeAttr('map-widget');

                    // TODO: move this to separate template
                    //var tooltipTemplate = "<div class='panel panel-default map-tooltip'><div>{{model.tooltip.name}}</div></div>";
                    //var tooltip = $compile(tooltipTemplate)(scope);
                    scope.tooltipElement = element.children()[0];
                    //element.append(tooltip);

                    //$compile(element.contents())(scope);

                    var map = new ol.Map({
                        layers: [
                            //raster,
                            new ol.layer.Tile({
                                //source: new ol.source.OSM({ wrapX: true })
                                source: new ol.source.MapQuest({layer: 'osm'})
                            })
                        ],
                        controls: ol.control.defaults({
                            attributionOptions: {
                                collapsible: false
                            }
                        }),
                        target:  element[0],
                        view: new ol.View({
                            center: [0, 0],
                            zoom: 2
                            //minZoom: 2
                        })
                    });


                    if (scope.onInit) scope.onInit(map);
                }
            };
        }]);

})();