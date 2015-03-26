(function() {
    'use strict';

    function InterceptorSvc() {
        var svc = {
            request: request,
            responseError: responseError
        };
        return svc;

        function request(config) {
            //config.headers = { Authorization: Session.auth  };
            return config;
        }

        function responseError(err) {
            console.error(err);
            return err;
        }
    }

    function HttpConf($httpProvider) {
        //$httpProvider.defaults.headers['X-Requested-With'] = 'XMLHttpRequest';
        //$httpProvider.interceptors.push('HttpInterceptor');
    }

    angular.module('app')
        .service('HttpInterceptor', [InterceptorSvc])
        .config(['$httpProvider', HttpConf]);

})();
