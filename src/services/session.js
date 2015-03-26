(function() {
    'use strict';

    function SessionSvc(Connector, $rootScope, $location) {
        this.username = "Mobile";
        this.isSigned = true;
        this.auth = 'Basic bW9iaWxlOmRzbW9iaWxl';

        this.checkSigned = function() {
            if (!this.isSigned) $location.path("/login");
        };

        this.signIn = function(login, password, namespace) {
            if (!login || !password) return;

            Connector
                .signIn(login, password, namespace)
                .error(this.onSignInError)
                .success(this.onSignInSucces);
        };

        this.signOut = function () {
            this.username = "";
            this.auth = "";
            this.isSigned = false;
            $rootScope.$broadcast('signout', "");
            $location.path("/login");
        };

        this.onSignInError = function(data, status, headers, config) {
            $rootScope.$broadcast('signinerror', status);
        };

        this.onSignInSucces = function(data, status, headers, config) {
            $rootScope.$broadcast('signin', "");
            $location.path("/");
        };
    }

    angular.module('app')
        .service('Session', ['Connector', '$rootScope', '$location', SessionSvc]);
})();
