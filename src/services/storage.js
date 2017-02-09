/**
 * Service to work with local storage and store ings for app, widgets and tiles
 */
(function() {
    'use strict';

    function StorageSvc(CONST, Lang, Utils, $rootScope, $location) {
        var _this = this;
        /*if (window.dsw.mobile) {
            document.getElementById('pagestyle').setAttribute('href', CONST.css.classic);
        }*/
        this.settings            = {
            Default: {}
        };
        this.temp = {}; // used to store all changes in settings
        this.serverSettings = {};

        // Settings for namespace
        this.nsSettings = null;

        this.currentSettings     = localStorage.currentSettings || "Default";
        this.configLoaded        = false;
        this.saveCurrentSettings = saveCurrentSettings;
        this.isSettingsExists    = isSettingsExists;
        this.setCurrentSettings  = setCurrentSettings;
        this.getSettingsNames    = getSettingsNames;
        this.loadConfig          = loadConfig;
        this.getAppSettings      = getAppSettings;
        this.setAppSettings      = setAppSettings;
        this.getWidgetsSettings  = getWidgetsSettings;
        this.setWidgetsSettings  = setWidgetsSettings;
        this.getTilesSettings    = getTilesSettings;
        this.setTilesSettings    = setTilesSettings;
        this.removeTilesSettings = removeTilesSettings;
        this.getAllSettings      = getAllSettings;
        this.setAddons           = setAddons;
        this.getAddons           = getAddons;
        this.loadServerSettings  = loadServerSettings;
        this.isNamespaceConfigLoaded  = isNamespaceConfigLoaded;
        this.loadNamespaceSettings  = loadNamespaceSettings;
        this.setAllSettings  = setAllSettings;


        /**
         * Saves current settings stored in this.temp to settings with name
         * @param {name} name Settings name
         */
        function saveCurrentSettings(name) {
            var nss = _this.nsSettings;
            _this.settings[name] = {};
            Utils.merge(_this.settings[name], _this.temp);
            if (nss) _this.settings[name].namespaces = angular.copy(nss);
        }

        /**
         * Loads config
         * @param {object} config Configuration to load
         */
        function loadConfig(response) {
                if (!response) return;
                _this.configLoaded = true;
                if (response && response.Config) {
                    if (response.Config.constructor === Object) _this.settings = response.Config; else {
                        var o;
                        try {
                            o = JSON.parse(response.Config);
                        } catch (e) {
                            o = {};
                        }
                        _this.settings = o;
                    }
                }

                if (sessionStorage.userSettings) {
                    _this.temp = JSON.parse(sessionStorage.userSettings);
                    if (!_this.settings[_this.currentSettings]) _this.currentSettings = "Default";
                } else
                {
                    _this.temp = {};
                    if (!_this.settings[_this.currentSettings]) _this.currentSettings = "Default";
                    if (_this.settings[_this.currentSettings]) Utils.merge(_this.temp, _this.settings[_this.currentSettings]);
                }

                var nsSet;
                if (_this.settings[_this.currentSettings]) {
                    nsSet = _this.settings[_this.currentSettings].namespaces;
                }
                    if (sessionStorage.namespaceUserSettings) this.nsSettings = JSON.parse(sessionStorage.namespaceUserSettings);
                else if (nsSet) this.nsSettings = angular.copy(nsSet);


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
                    var c = $('.hc' + i.toString()).css('background-color');
                    if (c !== 'rgba(0, 0, 0, 0)') {
                        cols[i-1] = c;
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
         * Returns tru if settings with name exists
         * @param {string} name Settings name to check
         * @returns {boolean} True if exists
         */
        function isSettingsExists(name) {
            return _this.settings[name] !== undefined;
        }

        /**
         * Sets current settings name
         * @param {string} name Name of settings
         */
        function setCurrentSettings(name) {
            localStorage.currentSettings = name;
            _this.currentSettings = name;
        }

        /**
         * Get settings list
         * @returns {Array} Settings names
         */
        function getSettingsNames() {
            var result = [];
            for (var p in _this.settings) {
                if (!_this.settings.hasOwnProperty(p)) continue;
                result.push(p);
                //result.push({ id: result.length, name: p });
            }
            return result;
        }

        /**
         * Returns application settings stored in sessionStorage
         * @returns {object} Application settings
         */
        function getAppSettings() {
            var lang = $location.search()['lang'];
            var settings = _this.temp.app || {};
            settings.language = lang || 'en';
            return settings;
            //return JSON.parse(sessionStorage.settings || "{}");
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
            _this.temp.app = settings;
            sessionStorage.userSettings = JSON.stringify(_this.temp);
        }

        function setAddons(addons) {
            _this.temp.addons = addons;
            sessionStorage.userSettings = JSON.stringify(_this.temp);
        }

        function getAddons() {
            return sessionStorage.devAddons || _this.temp.addons || {};
        }

        /**
         * Returns widget settings(placement, sizes etc.)
         * @returns {object} Widget settings
         */
        function getWidgetsSettings(dashboard, ns) {
            if (_this.nsSettings &&
                _this.nsSettings.widgets) return _this.nsSettings.widgets[dashboard] || {};
            else return {};
        }

        /**
         * Save widget settings to storage
         * @param {object} widgets Widget settings to store
         */
        function setWidgetsSettings(widgets, dashboard, ns) {
            if (!_this.nsSettings) _this.nsSettings = {};
            if (!_this.nsSettings.widgets) _this.nsSettings.widgets = {};
            _this.nsSettings.widgets[dashboard] = angular.copy(widgets);
            sessionStorage.namespaceUserSettings = JSON.stringify(_this.nsSettings);
        }

        /**
         * Returns tiles settings(placement, sizes, icons, colors etc.)
         * @returns {object} Tiles settings
         */
        function getTilesSettings(ns) {
            if (_this.nsSettings) return _this.nsSettings.tiles || {}; else return {};
        }

        /**
         * Save tiles settings to storage
         * @param {object} tiles Tiles settings to store
         */
        function setTilesSettings(tiles, ns) {
            if (!_this.nsSettings) _this.nsSettings = {};
            _this.nsSettings.tiles = angular.copy(tiles);
            sessionStorage.namespaceUserSettings = JSON.stringify(_this.nsSettings);
        }

        /**
         * Removes tiles settings
         * @param {string} ns Namespace
         */
        function removeTilesSettings(ns) {
            if (_this.nsSettings) {
                _this.nsSettings.tiles = {};
                sessionStorage.namespaceUserSettings = JSON.stringify(_this.nsSettings);
            }
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

        function isNamespaceConfigLoaded(ns) {
            return _this.nsSettings !== undefined;
        }

        function loadNamespaceSettings(data, ns) {
            if (!data || !data.Config) return;
            var conf = null;
            try {
                conf = JSON.parse(data.Config);
            } catch(ex) {
                console.error(ex);
                return;
            }
            if (!conf) return;

            _this.nsSettings = angular.copy(conf);
            sessionStorage.namespaceUserSettings = JSON.stringify(_this.nsSettings);
        }
    }

    angular.module('app')
        .service('Storage', ['CONST', 'Lang', 'Utils', '$rootScope', '$location', StorageSvc]);

})();
