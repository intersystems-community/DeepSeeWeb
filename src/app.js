/**
 * Main application module
 */
(function() {
    'use strict';

    angular.module('dashboard', []);
    angular.module('widgets', []);
    angular.module('templates', []);
    angular.module('utils', []);

    angular.module('app', ['oc.lazyLoad', 'ngRoute', 'ngCookies', 'cgNotify', 'gridster', 'highcharts-ng', 'ng-context-menu', 'ngDialog', 'utils', 'dashboard', 'widgets', 'templates'])

    // This filter is used with ng-bind-htm to insert html
    .filter("sanitize", ['$sce', function($sce) {
        return function(htmlCode){
            return $sce.trustAsHtml(htmlCode);
        }
    }])
    .constant('CONST', {
        css: {
            classic: "css/metro.min.css",
            metro: "css/classic.min.css"
        },
        bgColorClasses: ["", "cl1", "cl2", "cl3", "cl4", "cl5", "cl6", "cl7", "cl8", "cl9"],
        fontColors: ["#000", "#FFF", "#F00", "#0A0", "#00F"],
        fontColorsMetro: ["#FFF", "#000", "#F00", "#0A0", "#00F"],
        icons: ["", "\uf0e4", "\uf114", "\uf080", "\uf1fe", "\uf200", "\uf201",
            "\uf153", "\uf155", "\uf158", "\uf0c5", "\uf03a", "\uf0ce", "\uf0d1",
            "\uf007", "\uf183", "\uf0c0", "\uf0b0", "\uf1c0", "\uf1b2", "\uf1b3",
            "\uf02d", "\uf073", "\uf0ac", "\uf005", "\uf071", "\uf05a",
            "\uf104"],
        timeout: 60000,
        ver: "{{package.json.version}}",
        emptyWidgetClass: "MDX2JSON.EmptyPortlet".toLowerCase()
    })

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'src/views/home.html',
                controller: 'home',
                resolve: { config: ['Connector', '$q', 'Storage', '$rootScope', '$route', '$ocLazyLoad', configResolver] }
            })
            .when('/d/:path*', {
                templateUrl: 'src/views/dashboard.html',
                controller: 'dashboard',
                resolve: { config: ['Connector', '$q', 'Storage', '$rootScope', '$route', '$ocLazyLoad', configResolver] }
            })
            .when('/f/:folder*', {
                templateUrl: 'src/views/home.html',
                controller: 'home',
                resolve: { config: ['Connector', '$q', 'Storage', '$rootScope', '$route', '$ocLazyLoad', configResolver] }
            })
            .when('/login', {
                templateUrl: 'src/views/login.html',
                controller: 'login'
            })
            .otherwise({ redirectTo: '/' });
    }])

    .run(['gridsterConfig', 'Lang', 'CONST', 'Connector', '$route', start]);


    function loadjscssfile(filename, filetype, callback){
        var fileref;
        if (filetype=="js"){ //if filename is a external JavaScript file
            fileref=document.createElement('script');
            fileref.setAttribute("type","text/javascript");
            fileref.setAttribute("src", filename);
        }
        else if (filetype=="css"){ //if filename is an external CSS file
            fileref=document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", filename);
        }
        if (typeof fileref!="undefined") {
            fileref.onload = callback;
            document.getElementsByTagName("head")[0].appendChild(fileref, 0);
        }
    }

    function loadAddons(Storage, $q, $ocLazyLoad) {
        var addons;
        try {
            addons = JSON.parse(Storage.getAddons() || "{}");
        }
        catch (e) { }
        if (!addons || !addons.widgets || addons.widgets.length === 0) {
            return $q.when();
        }
        var defers = [];
        for (var i = 0; i < addons.widgets.length; i++) {
            var url = addons.widgets[i].url;
            if (url) {
                var defer = $q.defer();
                defers.push(defer.promise);

                $ocLazyLoad.load(url + "?timestamp=" + Date.now().toString()).then((function(d){
                    return function() {
                        d.resolve();
                    };
                })(defer)).catch((function(d){
                    return function() {
                        d.resolve();
                    };
                })(defer));

                /*loadjscssfile(url, "js", (function(d){
                    return function() {
                        d.resolve();
                    }
                })(defer));*/
            }
        }
        if (defers.length === 0) return $q.when(); else return $q.all(defers);


            /*deffered.resolve(); else {
            $q.all(defers).then(function() { deffered.resolve(); });
        }*/
    }

    /**
     * Loads config before route changed
     * @param {object} Connector Connector service
     * @param $q
     * @param {object} Storage Storage service
     * @returns {IPromise<T>}
     */
    function configResolver(Connector, $q, Storage, $rootScope, $route, $ocLazyLoad) {
        var deffered = $q.defer();
            // Check if namespace was changed
            if ($route.current.params.ns !== localStorage.namespace) {
                loadSettings(Storage, $q, Connector)
                    .then(function () {
                        loadConf();
                        //$rootScope.$broadcast('toggleMenu', true);
                        //deffered.resolve();
                    });
                return;
            }
            // } else {
            //     $rootScope.$broadcast('toggleMenu', true);
            //     deffered.resolve();
            // }

        loadConf();

        function loadConf() {
            Connector.loadConfig($route.current.params.ns).success(function (result) {
                $rootScope.$broadcast('toggleMenu', true);
                $rootScope.$broadcast('refresh', true);
                Storage.loadConfig(result);

                $q.all([
                    //loadNamespaceConfig(Storage, $q, Connector, $route.current.params.ns),
                    loadAddons(Storage, $q, $ocLazyLoad),
                    loadSettings(Storage, $q, Connector)
                ]).then(function () {
                    deffered.resolve();
                });


            }).error(function (result) {
                deffered.resolve();
            });
        }

        return deffered.promise;
    }

    /*function loadNamespaceConfig(Storage, $q, Connector, ns) {
        var deffered = $q.defer();
        if (Storage.isNamespaceConfigLoaded(ns)) {
            deffered.resolve();
        } else {
            Connector.loadNamespaceConfig(ns).then(function (res) {
                Storage.loadNamespaceSettings(res.data, ns);
                deffered.resolve();
            }).catch(function (result) {
                deffered.resolve();
            });
        }
        return deffered.promise;
    }*/

    function loadSettings(Storage, $q, Connector)  {
        var deffered = $q.defer();
        Connector.getSettings().then(function(res) {
            Storage.loadServerSettings(res.data);
            deffered.resolve();
        }).catch(function(result) {
            deffered.resolve();
        });
        return deffered.promise;
    }
/*
    function loadConfig($q,$http) {
        var deffered = $q.defer();

        // make your http request here and resolve its promise
        return deffered.promise;
    }*/

    /**
     * Application entry point
     * @param gridsterConfig
     * @param Lang
     * @param CONST
     * @param Connector
     * @param Storage
     */
    function start(gridsterConfig, Lang, CONST, Connector, $route) {

        /*Array.prototype.swap = function (x, y) {
            var b = this[x];
            this[x] = this[y];
            this[y] = b;
            return this;
        }*/

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



        // Load favorites
        /*Connector.getFavorites().success(function(result) {

        });*/
    }



})();