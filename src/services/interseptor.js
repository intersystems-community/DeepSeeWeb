(function() {
    'use strict';

    function InterceptorSvc($q, $location, $routeParams, Lang) {
        var svc = {
            //request: request,
           // response: onResponse,
            responseError: responseError
        };
        return svc;

        /*function request(config) {
            config.headers = { Authorization: Session.auth  };
            return config;
        }*/

        /*function onResponse(response) {
            var deferred = $q.defer();
            if (response.data === null) response.data = {Error: "timeout"};
            deferred.resolve(response);

            return deferred.promise;
        }*/

        function responseError(e) {
            /*if (e.status === 503) {
                Error.show("503. Service unavailable.");
                return false;
            }*/
            if (e.data === null && e.status === 0) e.data = {Error: Lang.get("errTimeout")};
            if (e.status === 401) {
                var url = $location.$$url;
                $location.path("/login").search({from: url});
                return false;
            }
            return e;
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
