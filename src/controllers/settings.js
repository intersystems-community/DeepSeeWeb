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
    function SettingsCtrl($scope, $window, Storage, Utils, Error, Lang, $rootScope, Connector, ngDialog, CONST) {
        var _this         = this;
        var settings      = Storage.getAppSettings();
        var shouldRefresh = false;

        $scope.model = {
            addMode:   false,
            themes: CONST.themes,
            settingsNames:    Storage.getSettingsNames(),
            selectedSettings: Storage.currentSettings,
            settingsName:     "",
            showFolders:      !settings.hideFolders,
            theme:            settings.theme || '',
            isSaveFilters:    settings.isSaveFilters === undefined ? true : settings.isSaveFilters,
            showImages:       settings.showImages,
            langs:            Lang.getLanguages(),
            language:         Lang.current,
            colCount:         settings.colCount,
            widgetHeight:     settings.widgetHeight
        };

        $scope.applySettrings    = applySettrings;
        $scope.resetWidgets      = resetWidgets;
        $scope.resetTiles        = resetTiles;
        $scope.onAddClick   = onAddClick;
        $scope.onCancelClick = onCancelClick;
        $scope.onLoadClick = onLoadClick;
        $scope.exportSettings = exportSettings;
        $scope.importSettings = importSettings;
        $scope.readSettings = readSettings;
        $scope.showLog = showLog;

        //FIXME This function does currently not get called. Changes in Angular?
        //FIXME For now we added the listening method directly to the html event in the view
        $scope.onInit = function() {
           $scope.editor.setText(Storage.getAddons());
            document.getElementById('uploader').addEventListener('change', readSettings, false);
        };
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

        function showLog() {
            var html = "";
            if (dsw.errors) html += dsw.errors.join('<br/>');
            ngDialog.open({template: 'src/views/log.html', data: { html: html }, controller: 'share', className: "ngdialog-theme-default wnd-error-log" });
        }

        /**
         * Handler for "Cancel view" button
         */
        function onCancelClick() {
            $scope.model.addMode = false;
        }

        function onLoadClick() {
            var name = $scope.model.selectedSettings;
            var ns = Connector.getNamespace();
            if (Storage.isSettingsExists(name) || Storage.nsSettings[ns]) {
                delete sessionStorage.userSettings;
                delete sessionStorage.namespaceUserSettings;
                //Storage.nsSettings[ns] = {};
                //Storage.setTilesSettings(undefined, ns);
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
            var old               = Utils.merge({}, settings);
            settings.language     = $scope.model.language || "en";
            settings.hideFolders  = !$scope.model.showFolders ? true : false;
            settings.showImages   = $scope.model.showImages ? true : false;
            settings.theme        = $scope.model.theme;
            settings.isSaveFilters= $scope.model.isSaveFilters ? true : false;
            settings.colCount     = $scope.model.colCount;
            settings.widgetHeight = $scope.model.widgetHeight;

            if (old.language     !== settings.language)     shouldRefresh = true;
            if (old.theme        !== settings.theme)      shouldRefresh = true;
            if (old.isSaveFilters!== settings.isSaveFilters)shouldRefresh = true;
            if (old.hideFolders  !== settings.hideFolders)  shouldRefresh = true;
            if (old.showImages   !== settings.showImages)   shouldRefresh = true;
            if (old.colCount     !== settings.colCount)     shouldRefresh = true;
            if (old.widgetHeight !== settings.widgetHeight) shouldRefresh = true;

            if ($scope.editor) Storage.setAddons($scope.editor.getText());

            Storage.setAppSettings(settings);
            Storage.saveCurrentSettings($scope.model.selectedSettings);
            Storage.setCurrentSettings($scope.model.selectedSettings);

            Connector.saveConfig(Storage.settings).then(function(){
                if (shouldRefresh) reloadPage(); else $scope.closeThisDialog();
                /*var ns = Connector.getNamespace();
                Connector.saveNamespaceConfig(Storage.nsSettings[ns] || {}, ns).then(function() {
                    if (shouldRefresh) reloadPage(); else $scope.closeThisDialog();
                });*/
            });
        }

        function readSettings(files) {
            var f = files[0];
            if (f) {
                var r = new FileReader();
                r.onload = function(e) {
                    var contents = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(e.target.result)));
                    var ns = Connector.getNamespace();
                    if (contents.ns) {
                        Storage.nsSettings = contents.ns;
                        sessionStorage.namespaceUserSettings = JSON.stringify(Storage.nsSettings);
                    }
                    //Storage.setAllSettings(contents.settings);
                    Storage.saveCurrentSettings(Storage.currentSettings);
                    Connector.saveConfig(Storage.settings).then(function(){
                        reloadPage();
                        //var ns = Connector.getNamespace();
                        // Connector.saveNamespaceConfig(Storage.nsSettings[ns] || {}, ns).then(function() {
                        //     if (shouldRefresh) reloadPage(); else $scope.closeThisDialog();
                        // });
                    });
                };
                r.readAsArrayBuffer(f);
            } else {
                iasufr.alert("Помилка завантаження файла");
            }
        }

        function exportSettings() {
            var filename = Connector.getNamespace() + "." + new Date().toLocaleDateString() + ".json";
            var ns = Connector.getNamespace();
            var nset = sessionStorage.namespaceUserSettings ? JSON.parse(sessionStorage.namespaceUserSettings) : Storage.nsSettings;
            var data = JSON.stringify({ ns: nset });

            var download = document.createElement('a');
            //if (type) {
            download.setAttribute('href', 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(data));
                //download.setAttribute('href', 'data:attachment/text,' + data);
              //  console.log("csv");
            //} else {
              //  download.setAttribute('href', 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(data));
            //}
            $(download).attr("download", filename);
            download.setAttribute('download', filename);
            download.click();
            $(download).remove();
        }

        function importSettings() {

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
            Storage.removeTilesSettings(Connector.getNamespace());
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
        .controller('settings', ['$scope', '$window', 'Storage', 'Utils', 'Error', 'Lang', '$rootScope', 'Connector', 'ngDialog', 'CONST', SettingsCtrl] );

})();
