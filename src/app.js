(function() {
    'use strict';

    angular.module('dashboard', []);
    angular.module('widgets', []);
    angular.module('templates', []);
    angular.module('utils', []);

    angular.module('app', ['ngRoute', 'ngCookies', 'cgNotify', 'gridster', 'highcharts-ng', 'ng-context-menu', 'ngDialog', 'utils', 'dashboard', 'widgets', 'templates'])

    .constant('CONST', {
        timeout: 10000,
        ver: "1.1",
        hideFolders: localStorage.hideFolders == "true" ? true : false,
        emptyWidgetClass: "MDX2JSON.EmptyPortlet".toLowerCase()
    })

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'src/views/dashboardList.html',
                //templateUrl: 'src/views/home.html',
                //controller: 'home'
                controller: 'dashboardList'
            })
            .when('/d/:path*', {
                templateUrl: 'src/views/dashboard.html',
                controller: 'dashboard'
            })
            .when('/f/:folder*', {
                templateUrl: 'src/views/dashboardList.html',
                //templateUrl: 'src/views/home.html',
                //controller: 'home'
                controller: 'dashboardList'
            })
            .when('/login', {
                templateUrl: 'src/views/login.html',
                controller: 'login'
            })
            .otherwise({ redirectTo: '/' });
    }])

    .run(['gridsterConfig', 'Lang', '$rootScope', 'Connector', start]);

    function start(gridsterConfig, Lang, $rootScope, Connector) {
        if (!localStorage.cleared) {
            localStorage.clear();
            localStorage.cleared = true;
        }

        gridsterConfig.draggable.handle = ".widget-title-drag";
        gridsterConfig.resizable.handles = ['se'];
        gridsterConfig.columns = 12;
        gridsterConfig.floating = true;
        gridsterConfig.pushing = true;
        gridsterConfig.defaultSizeX = 2;
        gridsterConfig.defaultSizeY = 2;
        gridsterConfig.isResizing = false;
        gridsterConfig.isDragging = false;
        gridsterConfig.margins = [5, 5];

        gridsterConfig.resizable.start = function() {
            gridsterConfig.isResizing = true;
        };
        gridsterConfig.resizable.stop = function() {
            gridsterConfig.isResizing = false;
        };
        gridsterConfig.draggable.start = function() {
            gridsterConfig.isDragging = true;
        };
        gridsterConfig.draggable.stop = function() {
            gridsterConfig.isDragging = false;
        };

        /*
        gridsterConfig.resizable.resize = function(a, b, w) {
            $rootScope.$broadcast("resizeWidget" + w.$$hashKey);
        };*/

        //gridsterConfig.itemSize = ($window.innerWidth - 80) / 12;
        /*$window.onresize = function() {
            gridsterConfig.itemSize = ($window.innerWidth - 80) / 12;
            $rootScope.$broadcast("resize");
        };*/

        // TODO: add lang support
        Highcharts.setOptions({
            lang: {
                loading: Lang.get("loading"),
                //months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                //weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
                shortMonths: Lang.get("shortMonths"),
                noData: Lang.get("noData")/*
                exportButtonTitle: "Exportar",
                printButtonTitle: "Imprimir",
                rangeSelectorFrom: "De",
                rangeSelectorTo: "Até",
                rangeSelectorZoom: "Увеличение",
                downloadPNG: 'Download imagem PNG',
                downloadJPEG: 'Download imagem JPEG',
                downloadPDF: 'Download documento PDF',
                downloadSVG: 'Download imagem SVG'*/
                // resetZoom: "Reset",
                // resetZoomTitle: "Reset,
                // thousandsSep: ".",
                // decimalPoint: ','
            }
        });


        // Load favorites
        Connector.getFavorites().success(function(result) {

        });
    }

})();