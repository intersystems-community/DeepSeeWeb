(function() {
    'use strict';

    angular.module('app')
        .directive('textWidget', ['$parse', '$compile', 'Lang', 'Connector', function($parse, $compile, Lang, Connector) {
            return {
                link: function(scope, element, attrs) {
                    element.removeAttr('text-widget');
                    element[0].innerHTML =  "<div resize-after-render ng-repeat='item in model.textData' style='display: none; height: {{(100 / (model.textData.length || 1))}}%'><div class='text-widget-label' style='top: {{100 / (model.textData.length || 1) * $index}}%'>{{item.label}}</div><svg class='text-widget'>"+
                                                "<text style='fill: #000'>{{item.value}}</text>"+
                                            "</svg></div>";
                    $compile(element)(scope);
                }
            };
        }])
    .directive('resizeAfterRender', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    if (scope.$last)
                    if (scope.$last === true) {
                        $timeout(function (e) {
                            var childs = element[0].parentNode.children;
                            for (var i = 0; i < childs.length; i++) {
                                childs[i].style.display = "";
                                var svg = childs[i].children[1];
                                var text = svg.firstChild;
                                var bbox = text.getBBox();

                               /* var svgns = "http://www.w3.org/2000/svg";
                                var rect = document.createElementNS(svgns, 'rect');
                                rect.setAttributeNS(null, 'x', bbox.x);
                                rect.setAttributeNS(null, 'y', bbox.y);
                                rect.setAttributeNS(null, 'width', bbox.width);
                                rect.setAttributeNS(null, 'height', bbox.height);
                                svg.appendChild(rect);
*/
                                svg.setAttribute('viewBox', [bbox.x, bbox.y, bbox.width, bbox.height].join(' '));

                            }
                            scope.model.rendered = true;
                        }, 0, false, element);
                    }
                }
            };
        });
})();