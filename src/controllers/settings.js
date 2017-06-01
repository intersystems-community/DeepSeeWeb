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
            themes: CONST.themes,
            //settingsName:     "",
            showFolders:      !settings.hideFolders,
            theme:            settings.theme || '',
            isSaveFilters:    settings.isSaveFilters === undefined ? true : settings.isSaveFilters,
            isRelatedFilters: settings.isRelatedFilters === undefined ? true : settings.isRelatedFilters,
            showImages:       settings.showImages,
            langs:            Lang.getLanguages(),
            language:         Lang.current,
            colCount:         settings.colCount,
            widgetHeight:     settings.widgetHeight
        };

        $scope.applySettrings  = applySettrings;
        $scope.resetSettings  = resetSettings;
        $scope.exportSettings = exportSettings;
        $scope.readSettings = readSettings;
        $scope.showLog = showLog;

        $scope.onInit = function(){
            setTimeout(_=> document.getElementById('uploader').addEventListener('change', readSettings, false), 0);

            console.log('added!');
        };

        /**
         * Handler for "New view" button
         */
        // function onAddClick() {
        //     $scope.model.addMode = !$scope.model.addMode;
        //     if ($scope.model.addMode) {
        //         $scope.model.settingsName = "";
        //         // Declared in directive 'focusFunc' - directives/focus.js
        //         $scope.setFocusOnInput();
        //     } else {
        //         addSettings($scope.model.settingsName);
        //     }
        // }

        /**
         * Show console log. Used in mobile version of app
         */
        function showLog() {
            var html = "";
            if (dsw.errors) html += dsw.errors.join('<br/>');
            ngDialog.open({template: 'src/views/log.html', data: { html: html }, controller: 'share', className: "ngdialog-theme-default wnd-error-log" });
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
            settings.isRelatedFilters= $scope.model.isRelatedFilters ? true : false;
            settings.colCount     = $scope.model.colCount;
            settings.widgetHeight = $scope.model.widgetHeight;

            if (old.language     !== settings.language)     shouldRefresh = true;
            if (old.theme        !== settings.theme)      shouldRefresh = true;
            if (old.isSaveFilters!== settings.isSaveFilters)shouldRefresh = true;
            if (old.isRelatedFilters!== settings.isRelatedFilters)shouldRefresh = true;
            if (old.hideFolders  !== settings.hideFolders)  shouldRefresh = true;
            if (old.showImages   !== settings.showImages)   shouldRefresh = true;
            if (old.colCount     !== settings.colCount)     shouldRefresh = true;
            if (old.widgetHeight !== settings.widgetHeight) shouldRefresh = true;

            Storage.setAppSettings(settings);

            if (shouldRefresh) reloadPage(); else $scope.closeThisDialog();

        }

        /**
         * Read settings from file
         * @param {event} evt Event
         */
        function readSettings(evt) {
            var f = evt.target.files[0];
            if (f) {
                var r = new FileReader();
                r.onload = function(e) {
                    var contents = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(e.target.result)));
                    var ns = Connector.getNamespace();
                    if (contents.ns) {
                        Storage.nsSettings = contents.ns;
                        sessionStorage.namespaceUserSettings = JSON.stringify(Storage.nsSettings);
                    }
                    //Storage.saveCurrentSettings(Storage.currentSettings);
                    //Connector.saveConfig(Storage.settings).then(function(){
                        reloadPage();
                    //});
                };
                r.readAsArrayBuffer(f);
            } else {
                iasufr.alert("Помилка завантаження файла");
            }
        }

        /**
         * Exports settings to file
         */
        function exportSettings() {
            var filename = Connector.getNamespace() + "." + new Date().toLocaleDateString() + ".json";
            var ns = Connector.getNamespace();
            var data = JSON.stringify(Storage.settings);
            downloadFile(filename, data);
        }

        /**
         * Starts file download locally from js
         * @param {string} filename File name
         * @param {string} data Data to download
         */
        function downloadFile(filename, data) {
            var a = document.createElement('a');
            a.style = "display: none";
            var blob = new Blob([data], {type: "application/octet-stream"});
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(_ => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        }

        /**
         * Reset user settings(position, sizes, icons, etc.)
         */
        function resetSettings() {
            let ns = Connector.getNamespace().toLowerCase();

            let removeSettings = st => {
                let us = st.userSettings;
                if (us) {
                    let o = JSON.parse(us);
                    delete o[ns];
                    st.userSettings = JSON.stringify(o);
                }
            };

            // Remove both from local and session storage
            removeSettings(sessionStorage);
            try {
                removeSettings(localStorage);
            } catch(e) {}

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