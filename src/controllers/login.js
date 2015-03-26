(function (){
    'use strict';

    function LoginCtrl(Connector, Lang, $scope, $location, $rootScope) {
        var startTime = new Date().getTime();

        $scope.model = {
            login: "",
            password: "",
            namespace: "Samples",
            error: ""
        };

        $scope.$on('signinerror', this.onError);

        $scope.onLoginClick = function() {
            clearError();
            if (!$scope.model.login) { showError(Lang.get('errLoginRequired')); return; }
            if (!$scope.model.password) { showError(Lang.get('errPassRequired')); return; }

            startTime = new Date().getTime();
            Connector
                .signIn($scope.model.login, $scope.model.password, $scope.model.namespace)
                .error(onError)
                .success(onSuccess);
        };

        function onSuccess() {
            Connector.isSigned = true;
            $rootScope.$broadcast('signin', "");
            $location.path("/");
        }

        function onError(data, status, headers, config) {
            var respTime = new Date().getTime() - startTime;
            if(respTime >= config.timeout){
                showError(Lang.get("errTimeout"));
                return;
            }
            if (data) {
                var o = null;
                if (typeof data === "object") o = data; else {
                    try {
                        o = JSON.parse(data);
                    } catch (e) {
                    }
                }
                if (o) {
                    if (o.Error) {
                        showError(o.Error);
                        return;
                    }
                }
            }
           switch (status) {
               case 0: showError(Lang.get("errNotFound")); break;
               case 401: showError(Lang.get("errUnauth")); break;

           }
        }

        function clearError() {
            $scope.model.error = "";
        }

        function showError(txt) {
            $scope.model.error = txt;
        }
    }

    angular.module('app')
        .controller('login', ['Connector', 'Lang', '$scope', '$location', '$rootScope', LoginCtrl]);

})();