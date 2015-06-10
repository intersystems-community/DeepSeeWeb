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
        this.getFavorites = getFavorites;
        this.addFavorite = addFavorite;
        this.deleteFavorite = deleteFavorite;
        this.searchFilters = searchFilters;

        // for localtesting
        if ($location.$$host === "test.deepsee.com") this.url = "http://146.185.143.59/MDX2JSON/";
        //if ($location.$$host === "test.deepsee.com") this.url = "http://82.196.12.237:57772/MDX2JSON/"; // vportal
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
            var parts = mdx.split(" ");
            if (parts) if (parts.length !== 0) if (parts[0].toUpperCase() === "DRILLTHROUGH") return execMDXDrillthrough(mdx);

            return $http({
                method: 'POST',
                url: _this.url + 'MDX?Namespace=' + getNamespace(),
                data: {MDX: mdx},
                timeout: CONST.timeout,
                withCredentials: true
            });
        }

        function execMDXDrillthrough(mdx) {
            return $http({
                method: 'POST',
                url: _this.url + 'MDXDrillthrough?Namespace=' + getNamespace(),
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

        function searchFilters(searchStr, dataSource) {
            return $http({
                method: 'POST',
                data: {
                    DataSource: dataSource,
                    Values: 1,
                    Search: searchStr
                },
                url: _this.url + 'Filters?Namespace=' + getNamespace(),
                withCredentials: true
            });
        }

        function getFavorites() {
            return $http({
                method: 'GET',
                data: {},
                url: _this.url + 'Favorites?Namespace=' + getNamespace(),
                withCredentials: true
            });
        }

        function addFavorite(path) {
          /*  var p = path.split("/");
            if (p.length > 1) p.splice(0, 1);
            p = p.join("/");*/
            return $http({
                method: 'POST',
                data: {},
                url: _this.url + 'Favorites/'+ encodeURIComponent(path) + '?Namespace=' + getNamespace(),
                withCredentials: true
            });
        }

        function deleteFavorite(path) {
            return $http({
                method: 'DELETE',
                data: {},
                url: _this.url + 'Favorites/'+ encodeURIComponent(path) + '?Namespace=' + getNamespace(),
                withCredentials: true
            });
        }

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
