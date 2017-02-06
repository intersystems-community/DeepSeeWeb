/**
 * Directives for working with element focus and "return" key
 */
(function() {
    'use strict';

    angular.module('app')

    /**
     * Sets focus automatically to element
     */
        .directive('autoFocus', ['$timeout', function($timeout) {
            return {
                restrict: 'AC',
                link: function (_scope, _element) {
                    if (dsw.mobile) return;
                    $timeout(function () {
                        _element[0].focus();
                    }, 0);
                }
            };
        }])

    /**
     * Sets focus to next element after "return" key is pressed
     */
        .directive('focusNext', function() {
            return {
                restrict: 'A',
                link: function ($scope, elem, attrs) {

                    elem.bind('keydown', function (e) {
                        var code = e.keyCode || e.which;
                        if (code === 13) {
                            e.preventDefault();
                            $("#" + attrs.focusNext).focus();
                        }
                    });
                }
            };
        })

    /**
     * Blurs focus after "return" key is pressed
     */
        .directive('blurOnEnter', function() {
            return {
                restrict: 'A',
                link: function ($scope, elem, attrs) {

                    elem.bind('keydown', function (e) {
                        var code = e.keyCode || e.which;
                        if (code === 13) {
                            e.preventDefault();
                            e.currentTarget.blur();
                        }
                    });
                }
            };
        })

    /**
     * Binds function to "return" key pressed event
     */
        .directive('ngEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if (event.which === 13) {
                        scope.$apply(function () {
                            scope.$eval(attrs.ngEnter);
                        });

                        event.preventDefault();
                    }
                });
            };
        })


    /**
     * Creates function in scope to focus element
     */
        .directive('focusFunc', ['$timeout', function($timeout) {
            return {
                restrict: 'A',
                link: function ($scope, elem, attrs) {
                    var func = attrs.focusFunc;
                    $scope[func] = function() {
                        $timeout(function () {
                            elem[0].focus();
                        }, 0);
                    };
                }
            };
        }]);

})();