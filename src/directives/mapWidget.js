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
                    return "<div style='visibility: hidden'><div class='panel panel-default map-popup'>" +
                             //  "<div style='text-align: center;' ng-bind-html='model.tooltip.title | sanitize'></div>" +
                               "<div ng-bind-html='model.tooltip.content | sanitize'></div>" +
                           "</div>"+
                           "<div class='arrow_box'></div></div>";
                },
                link: function(scope, element, attrs) {
                    element.removeAttr('map-widget');

                    // TODO: move this to separate template
                    //var tooltipTemplate = "<div class='panel panel-default map-tooltip'><div>{{model.tooltip.name}}</div></div>";
                    //var tooltip = $compile(tooltipTemplate)(scope);
                    scope.popupElement = element.children()[0];
                    //element.append(tooltip);

                    //$compile(element.contents())(scope);


                    var tt = $("<div class='map-tooltip'>fff</div>");
                    tt
                        .hide()
                        .appendTo("body");
                    scope.tooltip = tt;

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

                    map.getViewport().addEventListener('mouseout', function(evt){
                        scope.hideTooltip();
                    }, false);

                    var hintTimeout = null;
                    scope.hideTooltip = function() {
                        if (hintTimeout) clearTimeout(hintTimeout);
                        scope.tooltip.hide();
                    };

                    scope.rejectTooltipCreation = function() {
                        clearTimeout(hintTimeout);
                    };

                    scope.showTooltip = function(txt, x, y) {
                        if (hintTimeout) clearTimeout(hintTimeout);
                        hintTimeout = setTimeout(function() {
                            var el = scope.tooltip;
                            el
                                .text(txt)
                                .css("left", x.toString() + "px")
                                .css("top", y.toString() + "px")
                                .show();
                        }, 600);
                    };

                    scope.showPopup= function() {
                        var $el = $(scope.popupElement);
                        //if (x !== undefined) $el.css("left", x.toString() + "px");
                        //if (y !== undefined) $el.css("top", y.toString() + "px");
                        $el.css('visibility', 'hidden');
                        setTimeout(function() {
                            $el.css('visibility', 'visible');
                            map.render();
                        }, 0);
                    };

                    scope.hidePopup = function() {
                        var $el = $(scope.popupElement);
                        $el.css('visibility', 'hidden');
                    };

                    if (scope.onInit) scope.onInit(map);

                    scope.$on("$destroy", function() {
                        scope.tooltip.remove();
                        scope.tooltip = null;
                    })
                }
            };
        }]);

})();