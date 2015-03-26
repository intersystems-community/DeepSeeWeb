(function(){
    'use strict';

    function MenuCtrl($scope, $routeParams, Connector, Lang) {
        $scope.model = {
            username: "",
            isSigned: false
        };

        updateModel();

        $scope.$on('signin', updateModel);
        $scope.$on('signout', updateModel);

        $scope.onSingoutClick = function() {
            Connector.signOut();
        };

        $scope.$on('$routeChangeSuccess', function () {
            $scope.path = $routeParams.path;
        });

        function updateModel() {
            $scope.model = {
                username: Connector.username,
                isSigned: Connector.isSigned
            };
        }
    }

    angular.module('app')
        .controller('menu', ['$scope', '$routeParams', 'Connector', 'Lang', MenuCtrl] );

})();