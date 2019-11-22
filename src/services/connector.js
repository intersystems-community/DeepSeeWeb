/**
 * Service to work with MDX2JSON. All request to server should be made from here
 */
(function() {
    'use strict';

    let MDX2JSON = "MDX2JSON";
    let NAMESPACE = "MDX2JSON";


    function ConnectorSvc($http, CONST, $cookieStore, $location, $routeParams, $route) {
        var _this = this;
        this.firstRun = true;
        this.username = localStorage.userName || "";
        this.url = "";
        this.newAPI = "";
        this.getDashboards = getDashboards;
        this.getPivotData = getPivotData;
        this.getKPIData = getKPIData;
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
        //this.saveConfig = saveConfig;
        this.loadConfig = loadConfig;
        this.loadMainConfig = loadMainConfig;
        this.execAction = execAction;
        this.getSettings = getSettings;
        this.getPivotVariables = getPivotVariables;
        this.loadNamespaceConfig = loadNamespaceConfig;
        this.saveNamespaceConfig = saveNamespaceConfig;
        this.loadAddons = loadAddons;
        this.gotoLoginPage = gotoLoginPage;
        this.loadOAuthConfig = loadOAuthConfig;

        // for local testing
        adjustEndpoints();


        /**
         * Adjust endpoints paths, also used after config has been loaded
         */
        function adjustEndpoints() {
            if (localStorage.connectorRedirect && (dsw.mobile || location.host.split(':')[0].toLowerCase() === 'localhost')) {
                _this.url = localStorage.connectorRedirect;
                _this.newAPI = localStorage.connectorRedirect.replace("/" + MDX2JSON, '') + 'api/deepsee/Data/MDXExecute';
            } else {
                _this.url = $location.$$protocol + "://" + $location.$$host;
                if ($location.$$port) _this.url += ":" + $location.$$port;
                _this.url += `/${MDX2JSON}/`;

                _this.newAPI = $location.$$protocol + "://" + $location.$$host;
                if ($location.$$port) _this.newAPI += ":" + $location.$$port;
                _this.newAPI += '/api/deepsee/Data//MDXExecute';
            }
        }
        /**
         * Navigates to login page
         */
        function gotoLoginPage() {
            var url = $location.$$url;
            if ($location.$$path !== "/login") {
                $location.path("/login").search({from: url});
            }
        }

        /**
         * Returns current namespace
         * @returns {string} Namespace
         */
        function getNamespace() {
            var lastNS = localStorage.namespace || "samples";
            var ns = $route.current.params.ns || lastNS;
            return ns.toUpperCase();
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
            });//.then(transformResponse);
        }

        /**
         * Request KPI data
         * @param {string} name Name of KPI
         * @returns {object} $http promise
         */
        function getKPIData(name) {
            return $http({
                method: 'POST',
                url: _this.url + 'KPI?Namespace=' + getNamespace(),
                data: {KPI: name},
                timeout: CONST.timeout,
                withCredentials: true
            }).then(transformResponse);
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
            }).then(transformResponse);
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
            }).then(transformResponse);
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
            }).then(transformResponse);
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
            }).then(transformResponse);
        }

        /**
         * Requests filter values
         * @param {string} searchStr Search string
         * @param {string} dataSource Filter data source
         * @param relatedFilters {Array<object>} Related filters
         * @param {Array<string>} List of filter to request
         * @returns {object} $http promise
         */
        function searchFilters(searchStr, dataSource, relatedFilters, requestFilters) {
            let data = {
                DataSource: dataSource,
                Values: 1,
                Search: searchStr
            };
            if (relatedFilters && relatedFilters.length) {
                data.RelatedFilters = relatedFilters;
            }
            if (requestFilters && requestFilters.length) {
                data.RequestedFilters = requestFilters;
            }
            return $http({
                method: 'POST',
                data,
                url: _this.url + 'Filters?Namespace=' + getNamespace(),
                withCredentials: true
            }).then(transformResponse);
        }

        /**
         * Requests pivot variables
         * @param {string} cube Cube name
         * @returns {object} $http promise
         */
        function getPivotVariables(cube) {
            return $http({
                method: 'GET',
                url: _this.url + 'PivotVariables/' + cube + '?Namespace=' + getNamespace(),
                withCredentials: true
            }).then(transformResponse);
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
            }).then(transformResponse);
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
            }).then(transformResponse);
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
            }).then(transformResponse);
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
            }).then(transformResponse);
        }

        /**
         * Loads main configuration from server
         */
        function loadMainConfig() {
            return $http({
                method: 'Get',
                data: {},
                url: 'config.json',
                withCredentials: false
            })
                .then(transformResponse)
                .then(conf => {
                    try {
                       if (conf && conf.endpoints && conf.endpoints.mdx2json) {
                           MDX2JSON = conf.endpoints.mdx2json.replace(/\//ig, '').replace(/ /g, '');
                           NAMESPACE = conf.namespace.replace(/\//ig, '').replace(/ /g, '');
                       }
                    } catch (e) {
                        console.error('Incorrect config in file "config.json"');
                    }
                    adjustEndpoints();
                })
        }

        /**
         * Loads namespace configuration from server
         * @returns {object} $http promise
         */
        function loadConfig(cutomNamespace) {
            return $http({
                method: 'Get',
                data: {},
                url: 'configs/' + (cutomNamespace ? cutomNamespace : this.getNamespace()).toLowerCase() + '.json',
                withCredentials: false
            }).then(transformResponse);
        }

        /**
         * Load OAuth config file oauth.json
         * @returns {object} $http promise
         */
        function loadOAuthConfig() {
            return $http({
                method: 'Get',
                data: {},
                url: 'oauth.json',
                withCredentials: false
            }).then(transformResponse);
        }

        /**
         * Transform responcs due to new angular 1.5+ response format
         * @param {object} r Response
         * @returns {object} Transformed response
         */
        function transformResponse(r) {
            return r ? r.data : undefined;
        }

        /**
         * Loads configuration from server
         * @returns {object} $http promise
         */
        function loadAddons(cutomNamespace) {
            return $http({
                method: 'Get',
                data: {},
                url: _this.url + `Addons`,
                withCredentials: true
            }).then(transformResponse);
        }

        /**
         * Loads configuration for namespace
         * @returns {object} $http promise
         */
        function loadNamespaceConfig(ns) {
            return $http({
                method: 'Get',
                data: {},
                url: _this.url + 'Config/' + ns + `?Namespace=${NAMESPACE}`,
                withCredentials: true
            }).then(transformResponse);
        }

        /**
         * Saves configuration to server
         * @param {object} config Configuration to save
         * @returns {object} $http promise
         */
        // function saveConfig(config) {
        //     return $http({
        //         method: 'POST',
        //         data: { Application: this.getNamespace(), Config: JSON.stringify(config) },
        //         url: _this.url + 'Config?Namespace=MDX2JSON',
        //         withCredentials: true
        //     }).then(transformResponse);
        // }

        /**
         * Saves configuration to server
         * @param {object} config Configuration to save
         * @param {string} ns Namespace
         * @returns {object} $http promise
         */
        function saveNamespaceConfig(config, ns) {
            return $http({
                method: 'POST',
                data: { Application: ns, Config: JSON.stringify(config) },
                url: _this.url + `Config?Namespace=${NAMESPACE}`,
                withCredentials: true
            }).then(transformResponse);
        }

        /**
         * Sings in
         * @param {string} login User login
         * @param {string} password User password
         * @param {string} namespace Namespace
         * @param {string|undefined} [url] Custom server address
         * @returns {object} $http promise
         */
        function signIn(login, password, namespace, url) {
            _this.username = login;
            return $http({
                method: 'GET',
                url: url ? (url + 'Test?Namespace=' + namespace) : (_this.url + 'Test?Namespace=' + namespace),
                timeout: CONST.timeout,
                headers: {
                    'Authorization': 'Basic ' + btoa(login + ":" + password)
                }
            }).then(transformResponse);
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
            $cookieStore.remove("CSPSESSIONID-SP-80-UP-MDX2JSON-");

            _this.username = "";
            localStorage.userName = "";

            return $http({
                method: 'Get',
                data: {},
                url: _this.url + 'Logout?Namespace=' + getNamespace(),
                withCredentials: true
            }).then(function() {
                $location.path("/login").search({});
            }).then(transformResponse);
        }

        /**
         * Requests dashboard list
         * @returns {object} $http promise
         */
        function execAction(action, cube) {
            return $http({
                method: 'POST',
                data: {},
                url: _this.url + 'Action/' + cube + '/' + action + '?Namespace=' + getNamespace(),
                withCredentials: true
            }).then(transformResponse);
        }

        function getSettings() {
            return $http({
                method: 'GET',
                url: _this.url + 'Test?Namespace=' + getNamespace(),
                timeout: CONST.timeout,
                withCredentials: true
            }).then(transformResponse);
        }

    }

    angular.module('app')
        .service('Connector', ['$http', 'CONST', '$cookieStore', '$location', '$routeParams', '$route', ConnectorSvc]);

})();
