/**
 * Controller for application settings modal window
 * @view views/settings.html
 */
(function(){
    'use strict';

    /**
     * Controller to handle settings window
     * @constructor
     */
    function SettingsCtrl($scope, $window, Storage, Utils, Error, Lang, $rootScope, Connector) {
        var _this         = this;
        var settings      = Storage.getAppSettings();
        var shouldRefresh = false;

        $scope.model = {
            addMode:   false,
            settingsNames: Storage.getSettingsNames(),
            selectedSettings: Storage.currentSettings,
            settingsName:      "",
            showFolders:   !settings.hideFolders,
            isMetro:       settings.isMetro,
            showImages:    settings.showImages,
            langs:         Lang.getLanguages(),
            language:      Lang.current
        };

        $scope.applySettrings    = applySettrings;
        $scope.resetWidgets      = resetWidgets;
        $scope.resetTiles        = resetTiles;
        $scope.onAddClick   = onAddClick;
        $scope.onCancelClick = onCancelClick;
        $scope.onLoadClick = onLoadClick;

        /**
         * Handler for "New view" button
         */
        function onAddClick() {
            $scope.model.addMode = !$scope.model.addMode;
            if ($scope.model.addMode) {
                $scope.model.settingsName = "";
                // Declared in directive 'focusFunc' - directives/focus.js
                $scope.setFocusOnInput();
            } else {
                addSettings($scope.model.settingsName);
            }
        }

        /**
         * Handler for "Cancel view" button
         */
        function onCancelClick() {
            $scope.model.addMode = false;
        }

        function onLoadClick() {
            var name = $scope.model.selectedSettings;
            if (Storage.isSettingsExists(name)) {
                delete localStorage.userSettings;
                Storage.setCurrentSettings(name);
                reloadPage();
            }
        }

        /**
         * Adds new settings record to settings list
         * @param {string} name Name used to store view on server
         */
        function addSettings(name) {
            if (!name) return;
            if ($scope.model.settingsNames.indexOf(name) === -1) $scope.model.settingsNames.push(name);
            $scope.model.selectedSettings = name;

            //$scope.model.addMode = false;
            /*var settings = Storage.getAllSettings();
            if (!settings[name]) settings[name] = {};
            Utils.merge(settings[name], settings[Storage.currentSettings]);

            Storage.currentSettings = name;
            $scope.model.selectedSettings = name;
            localStorage.currentSettings = name;

            Connector.saveConfig(settings);*/

        }

        /**
         * Apply settings
         */
        function applySettrings() {
            var old              = Utils.merge({}, settings);
            settings.language    = $scope.model.language || "en";
            settings.hideFolders = !$scope.model.showFolders ? true : false;
            settings.showImages  = $scope.model.showImages ? true : false;
            settings.isMetro     = $scope.model.isMetro ? true : false;

            if (old.language    !== settings.language)    shouldRefresh = true;
            if (old.isMetro     !== settings.isMetro)     shouldRefresh = true;
            if (old.hideFolders !== settings.hideFolders) shouldRefresh = true;
            if (old.showImages  !== settings.showImages)  shouldRefresh = true;

            Storage.setAppSettings(settings);
            Storage.saveCurrentSettings($scope.model.selectedSettings);
            Storage.setCurrentSettings($scope.model.selectedSettings);

            Connector.saveConfig(Storage.settings).then(function(){
                if (shouldRefresh) reloadPage(); else $scope.closeThisDialog();
            });
        }

        /**
         * Reset widgets on active dashboard. If no active dashboard, function does nothing
         */
        function resetWidgets() {
            $rootScope.$broadcast("resetWidgets");
        }

        /**
         * Reset tiles options(position, sizes, icons, etc.)
         */
        function resetTiles() {
            Storage.removeTilesSettings();
            reloadPage();
        }

        /**
         * Reload current page
         */
        function reloadPage() {
            $window.location.reload();
        }
    }

    angular.module('app')
        .controller('settings', ['$scope', '$window', 'Storage', 'Utils', 'Error', 'Lang', '$rootScope', 'Connector', SettingsCtrl] );

})();