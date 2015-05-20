(function() {
    'use strict';

    angular.module('app')
        .directive('autoFocus', function($timeout) {
            return {
                restrict: 'AC',
                link: function (_scope, _element) {
                    $timeout(function () {
                        _element[0].focus();
                    }, 0);
                }
            };
        })

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
        });

})();