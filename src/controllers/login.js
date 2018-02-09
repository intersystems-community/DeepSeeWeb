/**
 * Controller for login screen
 * @view views/login.html
 */
(function (){
    'use strict';

    function LoginCtrl(Connector, Lang, $scope, $location, $rootScope, CONST, Storage, ngDialog) {
        var startTime = new Date().getTime();
        delete sessionStorage.dashboarList;
        $scope.model = {
            ver: CONST.ver,
            server: localStorage.DSWMobileServer || "146.185.143.59",
            login: "",
            password: "",
            namespace:  localStorage.namespace || "Samples",
            error: ""
        };
        if (dsw.mobile) {
            fillFieldsWithSelectedServer();
        }

        var from = $location.search().from;
        if (from) {
            var str = decodeURIComponent(from);
            var ns = getParameterByName("ns", str);
            if (ns)  $scope.model.namespace = ns;
        }

        $scope.onLoginClick = onLoginClick;
        $scope.showServers = showServers;
        $scope.scanSettings = scanSettings;
        $scope.saveServer = saveServer;
        $scope.$on('signinerror', onError);
        // Listened in menu.js
        $rootScope.$broadcast('toggleMenu', false);


        function fillFieldsWithSelectedServer() {
            let idx = localStorage.selectedServer;
            if (!idx) return;
            idx = parseInt(idx);
            if (isNaN(idx)) return;
            let servers = [];
            try  {
                servers = JSON.parse(localStorage.serverList || '[]');
            } catch (ex) {
                console.error(ex);
            }
            let srv= servers[idx];
            if (!srv) return;
            $scope.model.server = srv.server || '';
            $scope.model.login = srv.login || '';
            $scope.model.password = srv.password || '';
            $scope.model.namespace = srv.namespace || '';
            if (!$scope.$$phase) $scope.$apply();
        }

        /**
         * Saves current connection info as item for server list
         */
        function saveServer() {
            var name = prompt("Please enter server name", $scope.model.server);
            var servers = [];
            try  {
                servers = JSON.parse(localStorage.serverList || '[]');
            } catch (ex) {
                console.error(ex);
            }
            servers.push({
                name: name,
                server: $scope.model.server,
                login: $scope.model.login,
                password: $scope.model.password,
                namespace: $scope.model.namespace
            });
            localStorage.serverList = JSON.stringify(servers);
            localStorage.selectedServer = servers.length - 1;
        }
        /**
         * Show servers list modal dialog
         */
        function showServers() {
            ngDialog.open({template: 'src/views/serverList.html', data: {callback: fillFieldsWithSelectedServer}, controller: "serverList", disableAnimation: dsw.mobile, showClose: true, className: "ngdialog-theme-default wnd-mobile wnd-servers" });
        }

        function getParameterByName(name, url) {
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        /**
         * Click event gandler for login button
         */
        function onLoginClick() {
            clearError();
            var s = getMobileUrl();
            startTime = new Date().getTime();
            Connector
                .signIn($scope.model.login, $scope.model.password, $scope.model.namespace, dsw.mobile ? s : undefined)
                .catch(onError)
                .then(onSuccess);
        }

        function getMobileUrl() {
            var s = $scope.model.server;
            let isMdx2Json = s.replace('://', '').indexOf('/') !== -1;
            if (s.toLowerCase().indexOf('http') ==0 -1) s = "http://" + s;
            if (!isMdx2Json) s += "/MDX2JSON/";
            if (s.charAt(s.length - 1) !== '/') s += '/';
            return s;
        }

        /**
         * Callback for success login
         */
        function onSuccess(res) {
            if (dsw.mobile) {
                Connector.url = getMobileUrl();
                localStorage.connectorRedirect = Connector.url;
            }
            localStorage.DSWMobileServer = $scope.model.server;
            Storage.loadServerSettings(res);
            localStorage.namespace = $scope.model.namespace;
            localStorage.userName = Connector.username;

            // Listened in menu.js
            //$rootScope.$broadcast('toggleMenu', true);
            var from = $location.search().from;
            var search = {};
            if (from) {
                // from = decodeURIComponent(from);
                // if (~from.indexOf("?")) {
                //     var parts = from.split("?");
                //     from = parts[0];
                //     parts = parts[1].split("&");
                //     for (var i = 0; i < parts.length; i++) {
                //         var p = parts[i].split("=");
                //         if (p.length === 2) {
                //             search[p[0]] = p[1];
                //         }
                //     }
                // }
                // if (!search.ns) search.ns = $scope.model.namespace;
                // $location.path(from).search(search);
                $location.url(from);
            }
            else $location.path("/").search({ns: $scope.model.namespace});
            $rootScope.$broadcast('toggleMenu', true);
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

        function scanSettings() {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    console.error(JSON.stringify(result));
                    var str = result.text;
                    var params = str.split('|');
                    if (params[0].toLowerCase() !== 'dsw') {
                        alert('Incorrect QR code');
                        return;
                    }
                    $scope.model.server    = params[1];
                    $scope.model.login     = params[2];
                    $scope.model.password  = params[3];
                    $scope.model.namespace = params[4];
                    onLoginClick();
                },
                function (error) {
                    alert("Scanning failed: " + error);
                }
            );
        }
    }

    angular.module('app')
        .controller('login', ['Connector', 'Lang', '$scope', '$location', '$rootScope', 'CONST', 'Storage', 'ngDialog', LoginCtrl]);

})();