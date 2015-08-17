/**
 * Service to work with local storage and store settings for app, widgets and tiles
 */
(function() {
    'use strict';

    function StorageSvc() {
        var _this = this;

        this.getAppSettings      = getAppSettings;
        this.setAppSettings      = setAppSettings;
        this.getWidgetsSettings  = getWidgetsSettings;
        this.setWidgetsSettings  = setWidgetsSettings;
        this.getTilesSettings    = getTilesSettings;
        this.setTilesSettings    = setTilesSettings;
        this.removeTilesSettings = removeTilesSettings;
        this.getAllSettings      = getAllSettings;

        /**
         * Returns application settings stored in localstorage
         * @returns {object} Application settings
         */
        function getAppSettings() {
            return JSON.parse(localStorage.settings || "{}");
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
            localStorage.settings = JSON.stringify(settings);
        }

        /**
         * Returns widget settings(placement, sizes etc.)
         * @returns {object} Widget settings
         */
        function getWidgetsSettings() {
            return JSON.parse(localStorage.widgets || "{}");
        }

        /**
         * Save widget settings to storage
         * @param {object} widgets Widget settings to store
         */
        function setWidgetsSettings(widgets) {
            localStorage.widgets = JSON.stringify(widgets);
        }

        /**
         * Returns tiles settings(placement, sizes, icons, colors etc.)
         * @returns {object} Tiles settings
         */
        function getTilesSettings() {
            return JSON.parse(localStorage.tiles || "{}");
        }

        /**
         * Save tiles settings to storage
         * @param {object} tiles Tiles settings to store
         */
        function setTilesSettings(tiles) {
            localStorage.tiles = JSON.stringify(tiles);
        }

        /**
         * Removes tiles settings
         */
        function removeTilesSettings() {
            delete localStorage.tiles;
        }

        /**
         * Returns all settings
         */
        function getAllSettings() {
            return {
                app: _this.getAppSettings(),
                widgets: _this.getWidgetsSettings(),
                tiles: _this.getTilesSettings()
            };
        }
    }

    angular.module('app')
        .service('Storage', StorageSvc);

})();
