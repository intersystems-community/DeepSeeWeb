(function() {
    'use strict';

    angular.module('app')
        .directive('customDirective', ['$parse', '$compile', 'Lang', 'Connector', function($parse, $compile, Lang, Connector) {
            return {
                link: function(scope, element, attrs) {
                    // Remove attr to avoid infinite creation loop
                    element.removeAttr('custom-directive');

                    // Create canvas element
                    element[0].innerHTML =  "<canvas></canvas>";
                    $compile(element)(scope);

                    // Get created canvas element
                    var canvas = element[0].children[0];

                    scope.drawWidget = function() {
                        var ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
                        ctx.arc(canvas.width/2, canvas.height/2, canvas.height/2 - 20, 0, Math.PI*2);
                        ctx.fill();
                    };

                    scope.resizeWidget = function() {
                        canvas.style.width = element[0].offsetWidth + 'px';
                        canvas.style.height = element[0].offsetHeight + 'px';
                        canvas.width = canvas.offsetWidth;
                        canvas.height = canvas.offsetHeight;
                        scope.drawWidget();
                    }
                }
            };
        }]);



    function CustomWidgetFact(Utils) {

        function CustomWidget($scope) {
            var _this = this;
            console.log('request  data');


            this._retrieveData = function(data) {
                console.log('data received');
                $scope.drawWidget();
            };

            this.onResize = function() {
                $scope.resizeWidget();
            };

            this.requestData();
        }

        return CustomWidget;
    }

    angular.module('widgets')
        .factory('CustomWidget', ['Utils', CustomWidgetFact]);

})();