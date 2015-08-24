/**
 * Service to intercept requests and responses.
 */
(function() {
    'use strict';

    function InterceptorSvc($q, $location, $routeParams, Lang) {
        return {
            request: request,
           // response: onResponse,
            responseError: responseError
        };

        /**
         * Handles all requests to server and sets Language based on settings
         * @param {object} config Request config
         * @returns {object} New request config
         */
        function request(config) {
            if (!config.headers) config.headers = { 'Accept-Language': Lang.current }; else config.headers['Accept-Language'] = Lang.current;
            return config;
        }

        /*function onResponse(response) {
            var deferred = $q.defer();
            if (response.data === null) response.data = {Error: "timeout"};
            deferred.resolve(response);

            return deferred.promise;
        }*/

        /**
         * Handles all server error responses
         * @param {object} e Error
         * @returns {object|boolean} Error
         */
        function responseError(e) {
            /*if (e.status === 503) {
                Error.show("503. Service unavailable.");
                return false;
            }*/
            if (e.data === null && e.status === 0) e.data = {Error: Lang.get("errTimeout")};
            if (e.status === 401) {
                var url = $location.$$url;
                if ($location.$$path !== "/login") $location.path("/login").search({from: url});
            }
            return $q.reject(e);
        }
    }

    function HttpConf($httpProvider) {
        //$httpProvider.defaults.headers['X-Requested-With'] = 'XMLHttpRequest';
        $httpProvider.interceptors.push('HttpInterceptor');
    }

    angular.module('app')
        .service('HttpInterceptor', ['$q', '$location', '$routeParams', 'Lang', InterceptorSvc])
        .config(['$httpProvider', HttpConf]);

})();
