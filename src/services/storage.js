/**
 * Service to work with local storage and store ings for app, widgets and tiles
 */
(function() {
    'use strict';

    function StorageSvc(CONST, Lang, Utils, $rootScope, $location, Connector) {
        var _this = this;
        this.settings = {};
        this.serverSettings = {};

        // Settings for namespace
        this.nsSettings = null;

        this.configLoaded        = false;
        this.loadConfig          = loadConfig;
        this.getAppSettings      = getAppSettings;
        this.setAppSettings      = setAppSettings;
        this.getWidgetsSettings  = getWidgetsSettings;
        this.setWidgetsSettings  = setWidgetsSettings;
        this.getTilesSettings    = getTilesSettings;
        this.setTilesSettings    = setTilesSettings;
        this.getAllSettings      = getAllSettings;
        this.loadServerSettings  = loadServerSettings;
        this.setAllSettings  = setAllSettings;

        // check for local storage support
        this.isLocalStorage = false;
        checkForLocalStorage();

        /**
         * Check if local storqage available
         * note: in incognito mode only session storage is available
         */
        function checkForLocalStorage() {
            try {
                localStorage.setItem("test", "test");
            } catch (e) {
               return;
            }
            _this.isLocalStorage = true;
            delete localStorage.test;
        }

        /**
         * Saves user settings to storage
         */
        function saveUserSettings() {
            let ns = Connector.getNamespace().toLowerCase();
            if (_this.isLocalStorage) {
                let us = JSON.parse(localStorage.userSettings || '{}');
                us[ns] = _this.settings;
                localStorage.userSettings = JSON.stringify(us);
            } else {
                let us = JSON.parse(sessionStorage.userSettings || '{}');
                us[ns] = _this.settings;
                sessionStorage.userSettings = JSON.stringify(us);
            }
        }

        /**
         * Loads config
         * @param {object} config Configuration to load
         */
        function loadConfig(response) {
            _this.settings = {};
            _this.configLoaded = true;
            if (response) {
                if (response.constructor === Object) _this.settings = response; else {
                    var o;
                    try {
                        o = JSON.parse(response);
                    } catch (e) {
                        o = {};
                    }
                    _this.settings = o;
                }
            }

            // Override settings by user settings
            let userSettings = null;
            let ns = Connector.getNamespace().toLowerCase();
            if (localStorage.userSettings) {
                userSettings = JSON.parse(localStorage.userSettings)[ns];
            }
            if (sessionStorage.userSettings) {
                userSettings = JSON.parse(sessionStorage.userSettings)[ns];
            }
            if (userSettings) _this.settings = userSettings;

            var settings = _this.getAppSettings();
            if (!window.dsw.mobile) {
                if (settings.theme) {
                    document.getElementById('pagestyle').setAttribute('href', 'css/' + settings.theme);
                }
            }
            Lang.current = settings.language || "en";
            $rootScope.$broadcast('lang:changed');

            // Get colors from theme
            var cols = Highcharts.getOptions().colors;
            for (var i = 1; i <= cols.length; i++) {
                var c = $('.hc' + i.toString()).css('background-color').toLowerCase();
                if (c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') {
                    cols[i - 1] = c;
                }
            }
            Highcharts.setOptions({
                colors: cols,
                global: {
                    useUTC: false
                },
                lang: {
                    loading: "<div class='loader'></div>",
                    shortMonths: Lang.get("shortMonths"),
                    rangeSelectorZoom: Lang.get("zoom"),
                    rangeSelectorFrom: Lang.get("from"),
                    rangeSelectorTo: Lang.get("to"),
                    noData: Lang.get("noData")
                }
            });
        }

        /**
         * Returns application settings stored in sessionStorage
         * @returns {object} Application settings
         */
        function getAppSettings() {
            var lang = $location.search()['lang'];
            if (!_this.settings.app) _this.settings.app = {};
            var settings = _this.settings.app;
            if (lang) settings.language = lang;
            return settings;
        }

        /**
         * Save application settings to storage
         * @param {object} settings
         * this object can have:
         *   .language current language
         *   .hideFolders hide or not folders on dashboard list
         *   .showImages show images on tiles
         *   .isMetro use or not metro theme
         */
        function setAppSettings(settings) {
            _this.settings.app = settings;
            saveUserSettings();
        }

        /**
         * Returns widget settings(placement, sizes etc.)
         * @returns {object} Widget settings
         */
        function getWidgetsSettings(dashboard) {
            if (_this.settings &&
                _this.settings.ns &&
                _this.settings.ns.widgets) return _this.settings.ns.widgets[dashboard] || {};
            else return {};
        }

        /**
         * Save widget settings to storage
         * @param {object} widgets Widget settings to store
         */
        function setWidgetsSettings(widgets, dashboard) {
            if (!_this.settings) _this.settings = {};
            if (!_this.settings.ns) _this.settings.ns = {};
            if (!_this.settings.ns.widgets) _this.settings.ns.widgets = {};
            _this.settings.ns.widgets[dashboard] = angular.copy(widgets);
            saveUserSettings();
        }

        /**
         * Returns tiles settings(placement, sizes, icons, colors etc.)
         * @returns {object} Tiles settings
         */
        function getTilesSettings() {
            if (_this.settings && _this.settings.ns) return _this.settings.ns.tiles || {}; else return {};
        }

        /**
         * Save tiles settings to storage
         * @param {object} tiles Tiles settings to store
         */
        function setTilesSettings(tiles) {
            if (!_this.settings) _this.settings = {};
            if (!_this.settings.ns) _this.settings.ns = {};
            _this.settings.ns.tiles = angular.copy(tiles);
            saveUserSettings();
        }

        /**
         * Returns all settings
         */
        function getAllSettings() {
           return _this.settings;
        }

        /**
         * Sets all settings
         */
        function setAllSettings(set) {
            _this.settings = set;
        }

        function loadServerSettings(settings) {
            _this.serverSettings = settings || {};
            $rootScope.$broadcast('servSettings:loaded');
        }

    }

    angular.module('app')
        .service('Storage', ['CONST', 'Lang', 'Utils', '$rootScope', '$location', 'Connector', StorageSvc]);

})();
