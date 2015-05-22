(function() {
    'use strict';

    function ConnectorSvc($http, CONST, $cookieStore, $location, $routeParams) {
        var _this = this;
        this.firstRun = true;
        this.username = localStorage.userName || "";
        this.url = "";
        this.getDashboards = getDashboards;
        this.execMDX = execMDX;
        this.getWidgets = getWidgets;
        this.signIn = signIn;
        this.signOut = signOut;
        this.getNamespace = getNamespace;

        // for localtesting
        if ($location.$$host === "test.deepsee.com") this.url = "http://146.185.143.59/MDX2JSON/";
        //if ($location.$$host === "test.deepsee.com") this.url = "http://classroom.intersystems.ru/MDX2JSON/";
        //if ($location.$$host === "test.deepsee.com") this.url = "http://37.139.6.156/MDX2JSON/";
        else {
            this.url = $location.$$protocol + "://" + $location.$$host;
            if ($location.$$port) this.url += ":" + $location.$$port;
            this.url += "/MDX2JSON/";
        }

        function getNamespace() {
            return $routeParams.ns || "samples";
        }

        function getDashboards() {
            _this.firstRun = false;
            return $http({
                method: 'POST',
                data: {Folder: ""},
                url: _this.url + 'Dashboards?Namespace=' + getNamespace(),
                withCredentials: true
            });
        }

        function execMDX(mdx) {
            return $http({
                method: 'POST',
                url: _this.url + 'MDX?Namespace=' + getNamespace(),
                data: {MDX: mdx},
                timeout: CONST.timeout,
                withCredentials: true
            });
        }

        function getWidgets(dashboard) {
            return $http({
                method: 'POST',
                url: _this.url + 'Dashboard?Namespace=' + getNamespace(),// + "&Debug",
                data: JSON.stringify({Dashboard: dashboard}),
                timeout: CONST.timeout,
                withCredentials: true,
                headers: {'Content-Type': 'application/json'}
            });
        }

        /*
        function getDrilldown(cube, path) {
            var MDX = "SELECT NON EMPTY " + path + ".children ON 1 FROM [" + cube + "]";
            if (widget) {
                MDX = this.drillMDX(widget.datasource.data.MDX, path, widget);
            }
            args.target = "drilldown1";
            args.data = {
                data: {
                    MDX: MDX
                }
            };
            this.acquireData(args);

            return $http({
                method: 'POST',
                url: _this.url + 'Dashboard?Namespace=' + getNamespace(),// + "&Debug",
                data: JSON.stringify({Dashboard: dashboard}),
                timeout: CONST.timeout,
                withCredentials: true,
                headers: {'Content-Type': 'application/json'}
            });
        }*/

        function signIn(login, password, namespace) {
            _this.username = login;
            return $http({
                method: 'GET',
                url: _this.url + 'Test?Namespace=' + namespace,
                timeout: CONST.timeout,
                headers: {
                    'Authorization': 'Basic ' + btoa(login + ":" + password)
                }
            });
        }

        function signOut() {
            _this.firstRun = true;
            //delete sessionStorage.dashboarList;
            $cookieStore.remove("CSPWSERVERID");
            $cookieStore.remove("CacheLoginToken");
            $cookieStore.remove("CSPSESSIONID-SP-80-UP-");

            _this.username = "";
            localStorage.userName = "";

            $location.path("/login").search({});
        }
    }

    angular.module('app')
        .service('Connector', ['$http', 'CONST', '$cookieStore', '$location', '$routeParams', ConnectorSvc]);

})();
