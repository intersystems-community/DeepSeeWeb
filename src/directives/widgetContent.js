(function() {
    'use strict';

    angular.module('app')
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
                            case "chart":
                            {
                                element.attr("highchart", '');
                                element.attr("id", '{{"chart" + item.key}}');
                                element.attr("config", "chartConfig");
                                break;
                            }
                            case "pivot":
                            {
                                element.attr("pivot", '');
                                break;
                            }
                            case "text":
                            {
                                element.attr("text-widget", '');
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

                    scope.$on('typeChanged', function(){
                        element.empty();
                        element.removeAttr('highchart');
                        element.removeAttr('id');
                        element.removeAttr('config');
                        element.removeAttr('text');
                        element.removeAttr('pivot');

//                        element.attr("pivot", '');
                        assignAttrs();
                        $compile(element)(scope);
                    });

                    $compile(element)(scope);
                };
            }
        };
    }]);

})();