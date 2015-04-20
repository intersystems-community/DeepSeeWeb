(function() {
    'use strict';

    function InterceptorSvc($location, $routeParams) {
        var svc = {
            //request: request,
            responseError: responseError
        };
        return svc;

        /*function request(config) {
            config.headers = { Authorization: Session.auth  };
            return config;
        }*/

        function responseError(e) {
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
        .service('HttpInterceptor', ['$location', '$routeParams', InterceptorSvc])
        .config(['$httpProvider', HttpConf]);

})();
