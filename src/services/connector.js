(function() {
    'use strict';

    function ConnectorSvc($http, CONST, $cookieStore, $location) {
        var _this = this;
        this.firstRun = true;
        this.username = localStorage.userName || "";
        this.namespace =  localStorage.namespace || "samples";
        this.url = "";
        this.getDashboards = getDashboards;
        this.execMDX = execMDX;
        this.getWidgets = getWidgets;
        this.signIn = signIn;
        this.signOut = signOut;

        // for localtesting
        //if ($location.$$host === "test.deepsee.com") this.url = "http://37.139.4.54/MDX2JSON/";
        if ($location.$$host === "test.deepsee.com") this.url = "http://146.185.143.59/MDX2JSON/";
        else {
            this.url = $location.$$protocol + "://" + $location.$$host;
            if ($location.$$port) this.url += ":" + $location.$$port;
            this.url += "/MDX2JSON/";
        }

        function getDashboards() {
            _this.firstRun = false;
            return $http({
                method: 'GET',
                url: _this.url + 'Dashboards?Namespace=' + _this.namespace,
                withCredentials: true
            });
        }

        function execMDX(mdx) {
            return $http({
                method: 'POST',
                url: _this.url + 'MDX?Namespace=' + _this.namespace,
                data: {MDX: mdx},
                timeout: CONST.timeout,
                withCredentials: true
            });
        }

        function getWidgets(dashboard) {
            return $http({
                method: 'POST',
                url: _this.url + 'Dashboard?Namespace=' + _this.namespace,// + "&Debug",
                data: JSON.stringify({Dashboard: dashboard}),
                timeout: CONST.timeout,
                withCredentials: true,
                headers: {'Content-Type': 'application/json'}
            });
        }

        function signIn(login, password, namespace) {
            _this.namespace = namespace;
            _this.username = login;
            return $http({
                method: 'GET',
                url: _this.url + 'Test?Namespace=' + _this.namespace,
                timeout: CONST.timeout,
                headers: {
                    'Authorization': 'Basic ' + btoa(login + ":" + password)
                }
            });
        }

        function signOut() {
            $cookieStore.remove("CSPWSERVERID");
            $cookieStore.remove("CacheLoginToken");
            $cookieStore.remove("CSPSESSIONID-SP-80-UP-");

            _this.username = "";
            localStorage.userName = "";

            $location.path("/login");
        }
    }

    angular.module('app')
        .service('Connector', ['$http', 'CONST', '$cookieStore', '$location', ConnectorSvc]);

})();
