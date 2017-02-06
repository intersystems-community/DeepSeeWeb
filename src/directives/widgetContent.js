/**
 * Directive for widget content
 */
(function() {
    'use strict';

    angular.module('app')

    /**
     * Sets new element directives based on widget type
     */
        .directive('widgetContent', ['$parse', '$compile', 'TypeMap', function($parse, $compile, TypeMap) {
        return {
            compile: function compile(tElement, tAttrs) {
                var directiveGetter = $parse(tAttrs.widgetContent);

                return function postLink(scope, element) {
                    element.removeAttr('widget-content');

                    function assignAttrs() {
                        var type = TypeMap.getType(directiveGetter(scope));

                        // set directives depending on widget type
                        switch (type) {
                            case "chart": {
                                //element[0].outerHTML = element[0].outerHTML.replace("<div", "<highchart").replace("</div>", "</highchart>")
                                element.attr("highchart", '');
                                element.attr("id", '{{"chart" + item.key}}');
                                element.attr("config", "chartConfig");
                                //element.append("<highchart id=\"{{'chart' + item.key}}\" config=\"chartConfig\"></highchart>");
                                break;
                            }
                            case "pivot": {
                                element.attr("pivot", '');
                                break;
                            }
                            case "text": {
                                element.attr("text-widget", '');
                                break;
                            }
                            case "map": {
                                element.attr("map-widget", '');
                                break;
                            }
                            case "custom": {
                                var ai = TypeMap.getDesc(directiveGetter(scope)).addonInfo;
                                if (ai) {
                                    element.attr(ai.directive, '');
                                }
                                break;
                            }
                            case "empty": {
                                //element.attr("ng-include", 'src/views/filters.html');
                                element.append("<div class='empty-widget' ng-include=\"'src/views/emptyWidgetContent.html'\"></div>");
                                break;
                            }
                        }
                    }

                    assignAttrs();
                   // console.log("initial width " + element[0].clientWidth);
                    // observer size change for lpt resize
                    /*scope.$watch(function() {
                        return { width: element[0].clientWidth, height: element[0].clientHeight };
                    }, function(size) {
                        if (scope.onSizeChange) scope.onSizeChange(size);
                    }, true);*/

                    /*scope.$on('typeChanged', function(){
                        element.empty();
                        element.removeAttr('highchart');
                        element.removeAttr('id');
                        element.removeAttr('config');
                        element.removeAttr('text');
                        element.removeAttr('pivot');

//                        element.attr("pivot", '');
                        assignAttrs();
                        $compile(element)(scope);
                    });*/

                    $compile(element)(scope);
                };
            }
        };
    }]);

})();