/**
 * Service to work with MDX2JSON. All request to server should be made from here
 */
(function() {
    'use strict';

    function ConnectorSvc($http, CONST, $cookieStore, $location, $routeParams) {
        var _this = this;
        this.firstRun = true;
        this.username = localStorage.userName || "";
        this.url = "";
        this.getDashboards = getDashboards;
        this.getPivotData = getPivotData;
        this.execMDX = execMDX;
        this.getWidgets = getWidgets;
        this.signIn = signIn;
        this.signOut = signOut;
        this.getFile = getFile;
        this.getTermList = getTermList;
        this.getNamespace = getNamespace;
        this.getFavorites = getFavorites;
        this.addFavorite = addFavorite;
        this.deleteFavorite = deleteFavorite;
        this.searchFilters = searchFilters;
        this.saveConfig = saveConfig;
        this.loadConfig = loadConfig;

        // for local testing
        /*
         "http://146.185.143.59/MDX2JSON/"
         "http://82.196.12.237:57772/MDX2JSON/"  vportal
         "http://classroom.intersystems.ru/MDX2JSON/"
         "http://146.185.183.169:57772/MDX2JSON/"
         "http://37.139.6.156/MDX2JSON/"
         "http://192.168.1.20:57772/MDX2JSON/"
         "http://37.139.17.101/MDX2JSON/"
         */
        if (localStorage.connectorRedirect) this.url = localStorage.connectorRedirect; else {
            this.url = $location.$$protocol + "://" + $location.$$host;
            if ($location.$$port) this.url += ":" + $location.$$port;
            this.url += "/MDX2JSON/";
        }

        /**
         * Returns current namespace
         * @returns {string} Namespace
         */
        function getNamespace() {
            return $routeParams.ns || "samples";
        }

        /**
         * Requests dashboard list
         * @returns {object} $http promise
         */
        function getDashboards() {
            _this.firstRun = false;
            return $http({
                method: 'POST',
                data: {Folder: ""},
                url: _this.url + 'Dashboards?Namespace=' + getNamespace(),
                withCredentials: true
            });
        }

        /**
         * Request pivot data
         * @param {string} name Name of pivot
         * @returns {object} $http promise
         */
        function getPivotData(name) {
            return $http({
                method: 'POST',
                url: _this.url + 'DataSource?Namespace=' + getNamespace(),
                data: {DataSource: name},
                timeout: CONST.timeout,
                withCredentials: true
            });
        }

        /**
         * Request pivot data
         * @param {string} name Name of pivot
         * @returns {object} $http promise
         */
        function getTermList(name) {
            return $http({
                method: 'POST',
                url: _this.url + 'TermList?Namespace=' + getNamespace(),
                data: {TermList: name},
                timeout: CONST.timeout,
                withCredentials: true
            });
        }

        /**
         * Requests MDX query result
         * @param {string} mdx MDX query
         * @returns {object} $http promise
         */
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

        /**
         * Requests MDX drillthrough query result
         * @param {string} mdx MDX query
         * @returns {object} $http promise
         */
        function execMDXDrillthrough(mdx) {
            return $http({
                method: 'POST',
                url: _this.url + 'MDXDrillthrough?Namespace=' + getNamespace(),
                data: {MDX: mdx},
                timeout: CONST.timeout,
                withCredentials: true
            });
        }

        /**
         * Requests widgets list
         * @param {string} dashboard Dashboard
         * @returns {object} $http promise
         */
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

        /**
         * Requests filter values
         * @param {string} searchStr Search string
         * @param {string} dataSource Filter data source
         * @returns {object} $http promise
         */
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

        /**
         * Loads file
         * @returns {object} $http promise
         */
        function getFile(url) {
            return $http({
                method: 'GET',
                data: {},
                url: url,
                withCredentials: true
            });
        }

        /**
         * Requests favorites
         * @returns {object} $http promise
         */
        function getFavorites() {
            return $http({
                method: 'GET',
                data: {},
                url: _this.url + 'Favorites?Namespace=' + getNamespace(),
                withCredentials: true
            });
        }

        /**
         * Adds favorite
         * @param {string} path Favorite path
         * @returns {object} $http promise
         */
        function addFavorite(path) {
            return $http({
                method: 'POST',
                data: {},
                url: _this.url + 'Favorites/'+ encodeURIComponent(path) + '?Namespace=' + getNamespace(),
                withCredentials: true
            });
        }

        /**
         * Deletes favorite
         * @param {string} path Favorite path
         * @returns {object} $http promise
         */
        function deleteFavorite(path) {
            return $http({
                method: 'DELETE',
                data: {},
                url: _this.url + 'Favorites/'+ encodeURIComponent(path) + '?Namespace=' + getNamespace(),
                withCredentials: true
            });
        }

        /**
         * Loads configuration from server
         * @returns {object} $http promise
         */
        function loadConfig(cutomNamespace) {
            return $http({
                method: 'Get',
                data: {},
                url: _this.url + 'Config/DeepSeeWeb?Namespace=' + (cutomNamespace || getNamespace()),
                withCredentials: true
            });
        }

        /**
         * Saves configuration to server
         * @param {object} config Configuration to save
         * @returns {object} $http promise
         */
        function saveConfig(config) {
            return $http({
                method: 'POST',
                data: { Application: "DeepSeeWeb", Config: JSON.stringify(config) },
                url: _this.url + 'Config?Namespace=' + getNamespace(),
                withCredentials: true
            });
        }

        /**
         * Sings in
         * @param {string} login User login
         * @param {string} password User password
         * @param {string} namespace Namespace
         * @returns {object} $http promise
         */
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

        /**
         * Signs out
         */
        function signOut() {
            _this.firstRun = true;
            //delete sessionStorage.dashboarList;
            $cookieStore.remove("CSPWSERVERID");
            $cookieStore.remove("CacheLoginToken");
            $cookieStore.remove("CSPSESSIONID-SP-80-UP-");

            _this.username = "";
            localStorage.userName = "";

            return $http({
                method: 'Get',
                data: {},
                url: _this.url + 'Logout?Namespace=' + getNamespace(),
                withCredentials: true
            }).then(function() {
                $location.path("/login").search({});
            });
        }
    }

    angular.module('app')
        .service('Connector', ['$http', 'CONST', '$cookieStore', '$location', '$routeParams', ConnectorSvc]);

})();
