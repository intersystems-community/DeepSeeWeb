/**
 * Controller for application settings modal window
 * @view views/settings.html
 */
(function(){
    'use strict';

    /**
     * Controller to handle settings window
     * @constructor
     */
    function ShareCtrl($scope, $window, Storage, Utils, Error, Lang, $rootScope, Connector) {
        var _this         = this;

        $scope.model = {
            //$scope.ngDialogData.html
        };


    }

    angular.module('app')
        .controller('share', ['$scope', '$window', 'Storage', 'Utils', 'Error', 'Lang', '$rootScope', 'Connector', ShareCtrl] );

})();