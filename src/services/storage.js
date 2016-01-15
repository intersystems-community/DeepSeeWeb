/**
 * Service to work with local storage and store settings for app, widgets and tiles
 */
(function() {
    'use strict';

    function StorageSvc(CONST, Lang, Utils, $rootScope, $location) {
        var _this = this;

        this.settings            = {
            Default: {}
        };
        this.temp = {}; // used to store all changes in settings
        this.serverSettings = {};

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


        /**
         * Saves current settings stored in this.temp to settings with name
         * @param {name} name Settings name
         */
        function saveCurrentSettings(name) {
            _this.settings[name] = {};
            Utils.merge(_this.settings[name], _this.temp);
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
                    if (localStorage.userSettings) {
                        _this.temp = JSON.parse(localStorage.userSettings);
                        if (!_this.settings[_this.currentSettings]) _this.currentSettings = "Default";
                    } else
                    {
                        _this.temp = {};
                        if (!_this.settings[_this.currentSettings]) _this.currentSettings = "Default";
                        if (_this.settings[_this.currentSettings]) Utils.merge(_this.temp, _this.settings[_this.currentSettings]);
                    }
                }

                var settings = _this.getAppSettings();
                if (settings.isMetro) {
                    document.getElementById('pagestyle').setAttribute('href', CONST.css.classic);
                } else {
                    document.getElementById('pagestyle').setAttribute('href', CONST.css.metro);
                }

                Lang.current = settings.language || "en";
                $rootScope.$broadcast('lang:changed');

                Highcharts.setOptions({
                    global: {
                        useUTC: false
                    },
                    lang: {
                        loading: "<div class='loader'></div>",
                        //months: ['Janeiro', 'Fevereiro', 'Mar�o', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                        //weekdays: ['Domingo', 'Segunda', 'Ter�a', 'Quarta', 'Quinta', 'Sexta', 'S�bado'],
                        shortMonths: Lang.get("shortMonths"),
                        rangeSelectorZoom: Lang.get("zoom"),
                        rangeSelectorFrom: Lang.get("from"),
                        rangeSelectorTo: Lang.get("to"),
                        noData: Lang.get("noData")/*
                         exportButtonTitle: "Exportar",
                         printButtonTitle: "Imprimir",
                         rangeSelectorFrom: "De",
                         rangeSelectorTo: "At�",
                         rangeSelectorZoom: "??????????",
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
                // Listened in menu.js
                //$rootScope.$broadcast('menu:toggleLoading', false);
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
         * Returns application settings stored in localstorage
         * @returns {object} Application settings
         */
        function getAppSettings() {
            return _this.temp.app || {};
            //return JSON.parse(localStorage.settings || "{}");
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
            localStorage.userSettings = JSON.stringify(_this.temp);
        }

        function setAddons(addons) {
            _this.temp.addons = addons;
            localStorage.userSettings = JSON.stringify(_this.temp);
        }

        function getAddons() {
            return localStorage.devAddons || _this.temp.addons || {};
        }

        /**
         * Returns widget settings(placement, sizes etc.)
         * @returns {object} Widget settings
         */
        function getWidgetsSettings() {
            return _this.temp.widgets || {};
        }

        /**
         * Save widget settings to storage
         * @param {object} widgets Widget settings to store
         */
        function setWidgetsSettings(widgets) {
            _this.temp.widgets = widgets;
            localStorage.userSettings = JSON.stringify(_this.temp);
        }

        /**
         * Returns tiles settings(placement, sizes, icons, colors etc.)
         * @returns {object} Tiles settings
         */
        function getTilesSettings() {
            return _this.temp.tiles || {};
        }

        /**
         * Save tiles settings to storage
         * @param {object} tiles Tiles settings to store
         */
        function setTilesSettings(tiles) {
            _this.temp.tiles = tiles;
            localStorage.userSettings = JSON.stringify(_this.temp);
        }

        /**
         * Removes tiles settings
         */
        function removeTilesSettings() {
            _this.temp.tiles = {};
            localStorage.userSettings = JSON.stringify(_this.temp);
        }

        /**
         * Returns all settings
         */
        function getAllSettings() {
           return _this.settings;
        }

        function loadServerSettings(settings) {
            _this.serverSettings = settings || {};
            $rootScope.$broadcast('servSettings:loaded');
        }
    }

    angular.module('app')
        .service('Storage', ['CONST', 'Lang', 'Utils', '$rootScope', '$location', StorageSvc]);

})();
