/**
 * Controller for about screen
 * @view views/about.html
 */
(function(){
    'use strict';

    /**
     * @constructor
     */
    function AboutCtrl($scope, $http) {
        var _this = this;
        $scope.changelog = '';

        $http({
            method: 'GET',
            url: 'changelog.md',
            withCredentials: true
        }).then(d => {
            $scope.changelog = (d.data || '');
        });
    }

    angular.module('app')
        .controller('about', ['$scope', '$http', AboutCtrl] );

})();