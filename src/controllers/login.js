/**
 * Controller for login screen
 * @view views/login.html
 */
(function (){
    'use strict';

    function LoginCtrl(Connector, Lang, $scope, $location, $rootScope, CONST) {
        var startTime = new Date().getTime();

        $scope.model = {
            ver: CONST.ver,
            login: "",
            password: "",
            namespace:  localStorage.namespace || "Samples",
            error: ""
        };

        $scope.onLoginClick = onLoginClick;
        $scope.$on('signinerror', onError);
        // Listened in menu.js
        $rootScope.$broadcast('toggleMenu', false);

        /**
         * Click event gandler for login button
         */
        function onLoginClick() {
            clearError();
            if (!$scope.model.login) { showError(Lang.get('errLoginRequired')); return; }
            if (!$scope.model.password) { showError(Lang.get('errPassRequired')); return; }

            startTime = new Date().getTime();
            Connector
                .signIn($scope.model.login, $scope.model.password, $scope.model.namespace)
                .error(onError)
                .success(onSuccess);
        }

        /**
         * Callback for success login
         */
        function onSuccess() {
            localStorage.namespace = $scope.model.namespace;
            localStorage.userName = Connector.username;

            // Listened in menu.js
            $rootScope.$broadcast('toggleMenu', true);
            var from = $location.search().from;
            var search = {};
            if (from) {
                from = decodeURI(from);
                if (~from.indexOf("?")) {
                    var parts = from.split("?");
                    from = parts[0];
                    parts = parts[1].split("&");
                    for (var i = 0; i < parts.length; i++) {
                        var p = parts[i].split("=");
                        if (p.length === 2) {
                            search[p[0]] = p[1];
                        }
                    }
                }
                $location.path(from).search(search);
            }
            else $location.path("/").search({ns: $scope.model.namespace});
        }

        /**
         * Callback for error during login request
         * @param {object|string} data Server response
         * @param {string} status Response status
         * @param {object} headers Response headers
         * @param {object} config Response config
         */
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

        /**
         * Clears error message
         */
        function clearError() {
            $scope.model.error = "";
        }

        /**
         * Shows error message
         * @param {string} txt Error message
         */
        function showError(txt) {
            $scope.model.error = txt;
        }
    }

    angular.module('app')
        .controller('login', ['Connector', 'Lang', '$scope', '$location', '$rootScope', 'CONST', LoginCtrl]);

})();