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
            addViewMode: false,
            viewName:    "",
            showFolders: !settings.hideFolders,
            isMetro:     settings.isMetro,
            showImages:  settings.showImages,
            langs:       Lang.getLanguages(),
            language:    Lang.current
        };

        $scope.applySettrings    = applySettrings;
        $scope.resetWidgets      = resetWidgets;
        $scope.resetTiles        = resetTiles;
        $scope.onNewViewvClick   = onNewViewvClick;
        $scope.onCancelViewClick = onCancelViewClick;

        /**
         * Handler for "New view" button
         */
        function onNewViewvClick() {
            $scope.model.addViewMode = !$scope.model.addViewMode;
            if ($scope.model.addViewMode) {
                $scope.model.viewName = "";
                // Declared in directive 'focusFunc' - directives/focus.js
                $scope.setFocusOnInput();
            } else {
                saveView($scope.model.viewName);
            }
        }

        /**
         * Handler for "Cancel view" button
         */
        function onCancelViewClick() {
            $scope.model.addViewMode = false;
        }

        /**
         * Saves current tiles and widgets to server(placement, sizes, colors etc.)
         * @param {string} name Name used to store view on server
         */
        function saveView(name) {
            if (!name) {
                Error.show("Please specify view name");
                return;
            }
            var settings = Storage.getAllSettings();
            Connector.saveConfig(settings);
        }

        /**
         * Apply settings
         */
        function applySettrings() {
            var old              = Utils.merge({}, settings);
            settings.language    = $scope.model.language;
            settings.hideFolders = !$scope.model.showFolders;
            settings.showImages  = $scope.model.showImages;
            settings.isMetro     = $scope.model.isMetro;

            if (old.language    !== settings.language)    shouldRefresh = true;
            if (old.isMetro     !== settings.isMetro)     shouldRefresh = true;
            if (old.hideFolders !== settings.hideFolders) shouldRefresh = true;
            if (old.showImages  !== settings.showImages)  shouldRefresh = true;

            Storage.setAppSettings(settings);

            if (shouldRefresh) reloadPage(); else $scope.closeThisDialog();
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