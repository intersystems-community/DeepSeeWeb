(function() {
    'use strict';

    angular.module('dashboard', []);
    angular.module('templates', []);

    angular.module('app', ['ngRoute'])

    .constant('CONST', {

    })

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/src/views/dashboardList.html',
                controller: 'dashboardList'
            })
            .when('/dashboard/:path*', {
                templateUrl: '/src/views/dashboard.html',
                controller: 'dashboard'
            })
            .when('/f/:folder*', {
                templateUrl: '/src/views/dashboardList.html',
                controller: 'dashboardList'
            })
            .when('/login', {
                templateUrl: '/src/views/login.html',
                controller: 'login'
            })
            .otherwise({ redirectTo: '/' });
    }])

    .run(['Session', start]);

    function start(Session) {
        Session.checkSigned();
    }

})();