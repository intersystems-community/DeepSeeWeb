(function() {
    'use strict';

    angular.module('dashboard', []);
    angular.module('widgets', []);
    angular.module('templates', []);

    angular.module('app', ['ngRoute', 'gridster', 'highcharts-ng', 'dashboard', 'widgets', 'templates'])

    .constant('CONST', {})

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'src/views/dashboardList.html',
                controller: 'dashboardList'
            })
            .when('/dashboard/:path*', {
                templateUrl: 'src/views/dashboard.html',
                controller: 'dashboard'
            })
            .when('/f/:folder*', {
                templateUrl: 'src/views/dashboardList.html',
                controller: 'dashboardList'
            })
            .when('/login', {
                templateUrl: 'src/views/login.html',
                controller: 'login'
            })
            .otherwise({ redirectTo: '/' });
    }])

    .run(['Connector', 'gridsterConfig', 'Lang', start]);

    function start(Connector, gridsterConfig, Lang) {
        gridsterConfig.draggable.handle = ".bookCoverHeader";
        gridsterConfig.resizable.handles = ['e', 's', 'w', 'ne', 'se', 'sw', 'nw'];
        gridsterConfig.defaultSizeX = 1;
        gridsterConfig.defaultSizeY = 1;

        Highcharts.setOptions({
            lang: {
                loading: Lang.get("loading")
            }
        });

        Connector.checkSigned();
    }

})();