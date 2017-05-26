/**
 * Controller for dashboard sharing screen
 * @view views/shareDashboard.html
 */
(function(){
    'use strict';

    /**
     * @constructor
     */
    function ShareDashboardCtrl($scope, $window, Storage, Utils, Error, Lang, $rootScope, Connector, ngDialog, CONST) {
        var _this         = this;

        $scope.copyUrl = copyUrl;

        /**
         * Init callback
         */
        $scope.onInit = function() {
            // Focus to text field and select all text
            setTimeout(_ => {
                let el = $('#shareText').get(0);
                el.focus();
                el.select();
            }, 0);
        };

        /**
         * Copies url from input field to clipboard
         */
        function copyUrl() {
            let el = $('#shareText').get(0);
            el.select();

            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
            } catch (err) {
                alert("You browser doesn't support clipboard operations. Use Ctrl + C");
            }
        }
    }

    angular.module('app')
        .controller('shareDashboard', ['$scope', '$window', 'Storage', 'Utils', 'Error', 'Lang', '$rootScope', 'Connector', 'ngDialog', 'CONST', ShareDashboardCtrl] );

})();