window.dsw = {};
window.dsw.mobile = false;

/**
 * Main application module
 */
(function() {
    'use strict';

    if (window.dsw.mobile) {
        //localStorage.connectorRedirect = "http://146.185.143.59/MDX2JSON/";
        //localStorage.connectorRedirect = "http://37.139.17.101/MDX2JSON/";
    }

    angular.module('dashboard', []);
    angular.module('widgets', []);
    angular.module('templates', []);
    angular.module('utils', []);

    angular.module('app', ['oc.lazyLoad', 'ngRoute', 'ngCookies', 'cgNotify', 'gridster', 'highcharts-ng', 'ng-context-menu', 'ngDialog', 'utils', 'dashboard', 'widgets', 'templates'])

    // This filter is used with ng-bind-htm to insert html
    .filter("sanitize", ['$sce', function($sce) {
        return function(htmlCode){
            return $sce.trustAsHtml(htmlCode);
        };
    }])
    .constant('CONST', {
        themes: [
            {text: 'Default', file: ''},
            {text: 'Contrast', file: 'themes/contrast.css'},
            {text: 'Metro', file: 'themes/metro.min.css'},
            {text: 'Black', file: 'themes/black.css'}
        ],
        bgColorClasses: ["", "cl1", "cl2", "cl3", "cl4", "cl5", "cl6", "cl7", "cl8", "cl9"],
        fontColors: ["fc1", "fc2", "fc3", "fc4", "fc5"],
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

    function loadAddons(addons, $q, $ocLazyLoad) {
        if (!addons || !addons.length) {
            return $q.when();
        }
        var defers = [];
        for (var i = 0; i < addons.length; i++) {
            var url = addons[i] + '?tmp=' + Date.parse(new Date());
            if (localStorage.connectorRedirect) {
                url = localStorage.connectorRedirect.split('/').slice(0, -2).join('/') + url;
            } else {
                url = window.location.host + url;
            }
            if (url) {
                var defer = $q.defer();
                defers.push(defer.promise);

                $ocLazyLoad.load(url).then((function(d){
                    return function() {
                        d.resolve();
                    };
                })(defer)).catch((function(d, u){
                    return function(e) {
                        alert("Can't load addon: " + u + " " + e);
                        d.resolve();
                    };
                })(defer, url));
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
        // In mobile version navigate to login if there is not connection set yet
        if (dsw.mobile && !localStorage.connectorRedirect) {
            Connector.gotoLoginPage();
            return;
        }
        var deffered = $q.defer();
            // Check if namespace was changed
            if (($route.current.params.ns || '').toLowerCase() !== (localStorage.namespace || '').toLowerCase()) {
                // Clear dashboard list
                delete sessionStorage.dashboarList;
                loadSettings(Storage, $q, Connector)
                    .then(function () {
                        loadConf();
                        //$rootScope.$broadcast('toggleMenu', true);
                        //deffered.resolve();
                    })
                    .catch(function() {
                        Connector.gotoLoginPage();
                    });
                return deffered.promise;
            }
            // } else {
            //     $rootScope.$broadcast('toggleMenu', true);
            //     deffered.resolve();
            // }
        if (Connector.firstRun) loadConf(); else deffered.resolve();

        function loadConf() {
            Connector.loadConfig($route.current.params.ns)
            .catch(function() {
                Connector.gotoLoginPage();
            })
            .then(function (result) {
                $rootScope.$broadcast('toggleMenu', true);
                $rootScope.$broadcast('refresh', true);
                Storage.loadConfig(result);
                var addons = null;
                Connector.loadAddons()
                    .then(function(addons) {
                        if (addons && addons.length) {
                            dsw.addons = addons.slice();
                            for (var i = 0; i < dsw.addons.length; i++) {
                                var a = dsw.addons[i].split('.');
                                a.pop();
                                dsw.addons[i] = a.join('.');
                            }
                        }
                        return loadAddons(addons, $q, $ocLazyLoad);
                    })
                    .then(function() {
                        $rootScope.$broadcast('addons:loaded', addons);
                    })
                    .then(loadSettings(Storage, $q, Connector))
                    .then(function () {
                        deffered.resolve();
                    });
                /*
                $q.all([
                    //loadNamespaceConfig(Storage, $q, Connector, $route.current.params.ns),
                    loadAddons(Storage, $q, $ocLazyLoad),
                    loadSettings(Storage, $q, Connector)
                ]).then(function () {
                    deffered.resolve();
                });*/
            }).catch(function (result) {
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
            Storage.loadServerSettings(res);
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
        gridsterConfig.isMobile = dsw.mobile; // stacks the grid items if true;
        if (dsw.mobile) {
            gridsterConfig.mobileBreakPoint = 2000;// if the screen is not wider that this, remove the grid layout and stack the items
            //gridsterConfig.mobileModeEnabled = true;
        }


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
    if (dsw.mobile) {
        loadjscssfile("cordova.js", "js");
        loadjscssfile("css/mobile.css", "css");
        var oldError = console.error;
        console.error = function(e) {
            oldError.apply(this, arguments);
            //alert(e);
            if (!dsw.erros) dsw.errors = [];
            dsw.errors.push(e);
        };
         //window.onerror = function(e) {
         //    alert(e);
         //};
        document.addEventListener('DOMContentLoaded', function () {
            document.body.style['background-color'] = 'black';
            FastClick.attach(document.body);
        }, false);
    }

})();