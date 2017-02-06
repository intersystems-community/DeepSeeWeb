(function() {
    'use strict';

    /**
     * Register custom directive for widget
     * Name of this directive is used in "directive" property of widget definition object
     * Note that angular directives was written in "camelCase",
     * whilst actual directive name is "camel-case"
     */
    angular.module('app')
        // You can inject other DSW services here if needed. Look at /src/services
        .directive('customDirective', ['$parse', '$compile', 'Lang', 'Connector', function($parse, $compile, Lang, Connector) {
            return {
                link: function(scope, element, attrs) {
                    // Remove attr to avoid infinite creation loop
                    element.removeAttr('custom-directive');

                    // Create html5 canvas element
                    element[0].innerHTML =  "<canvas></canvas>";
                    $compile(element)(scope);

                    // Get created canvas element
                    var canvas = element[0].children[0];

                    // Define render function
                    scope.drawWidget = function() {
                        var ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
                        ctx.arc(canvas.width/2, canvas.height/2, canvas.height/2 - 20, 0, Math.PI*2);
                        ctx.fill();
                    };

                    // Define resize function
                    scope.resizeWidget = function() {
                        canvas.style.width = element[0].offsetWidth + 'px';
                        canvas.style.height = element[0].offsetHeight + 'px';
                        canvas.width = canvas.offsetWidth;
                        canvas.height = canvas.offsetHeight;
                        scope.drawWidget();
                    };
                }
            };
        }]);


    /**
     * Factory for custom widget
     * @param {objcet} Utils Class with DSW utilities
     * @returns {CustomWidget}
     * @constructor
     */
    function CustomWidgetFact(Utils) {

        function CustomWidget($scope) {
            var _this = this;

            // After data was retrieved - redraw widget
            this._retrieveData = function(data) {
                console.log('data received');
                $scope.drawWidget();
            };

            // Resize canvas after widget was resized
            this.onResize = function() {
                $scope.resizeWidget();
            };

            // Request widget data (execute MDX)
            this.requestData();
        }

        return CustomWidget;
    }

    // Register angular widget. This name is used in widget definition object as "class" property
    angular.module('widgets')
        .factory('CustomWidget', ['Utils', CustomWidgetFact]);

})();