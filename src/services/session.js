(function() {
    'use strict';

    function SessionSvc($rootScope, $location) {
        this.username = "Mobile";
        this.isSigned = false;
        this.auth = 'Basic bW9iaWxlOmRzbW9iaWxl';

        this.checkSigned = function() {
            if (!this.isSigned) $location.path("/login");
        };

        this.signIn = function(login, password) {
            if (!login || !password) return;
            this.username = login;
            this.isSigned = true;
            $rootScope.$broadcast('signin', "");
            $location.path("/");
        };

        this.signOut = function () {
            this.username = "";
            this.auth = "";
            this.isSigned = false;
            $rootScope.$broadcast('signout', "");
            $location.path("/login");
        };
    }

    angular.module('app')
        .service('Session', ['$rootScope', '$location', SessionSvc]);
})();
