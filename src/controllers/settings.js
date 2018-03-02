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
        var isWidgetSettings = $scope.ngDialogData.isWidgetSettings;
        $scope.model = {
            isWidgetSettings: isWidgetSettings,
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
            widgetHeight:     settings.widgetHeight,
            colorPickerOpt: {format:'rgb'}
        };

        // Get color theme
        $scope.model.themeColors = settings.themeColors[$scope.model.theme] || {};

        // For widget settings use widget colors
        if ($scope.ngDialogData.widgetSettings) {
            if (!$scope.ngDialogData.widgetSettings.themeColors[$scope.model.theme]) {
                $scope.ngDialogData.widgetSettings.themeColors[$scope.model.theme] = {};
            }
            $scope.model.themeColors = $scope.ngDialogData.widgetSettings.themeColors[$scope.model.theme];
        }

        initColors();


        $scope.applySettrings  = applySettrings;
        $scope.resetSettings  = resetSettings;
        $scope.exportSettings = exportSettings;
        $scope.readSettings = readSettings;
        $scope.showLog = showLog;
        $scope.resetColors = resetColors;

        $scope.onInit = function(){
            setTimeout(_=> document.getElementById('uploader').addEventListener('change', readSettings, false), 0);
        };

        /**
         * init theme colors with default values
         */
        function initColors() {
            let tc = $scope.model.themeColors;
            if (!tc.hcColors) tc.hcColors = Highcharts.getOptions().colors.slice();
            if (!tc.hcTextColor) tc.hcTextColor = Highcharts.getOptions().labels.style.color;
            if (!tc.hcBackground) tc.hcBackground = Highcharts.getOptions().chart.backgroundColor;
        }
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

            // Create colors for theme if not exists
            if (!settings.themeColors[settings.theme]) {
                settings.themeColors[settings.theme] = {};
            }
            let tc = settings.themeColors[settings.theme];

            // Check if this widget settings
            if (isWidgetSettings) {
                if (!$scope.ngDialogData.widgetSettings.themeColors) {
                    $scope.ngDialogData.widgetSettings.themeColors = {};
                }
                if (!$scope.ngDialogData.widgetSettings.themeColors[settings.theme]) {
                    $scope.ngDialogData.widgetSettings.themeColors[settings.theme] = {};
                }
                tc = $scope.ngDialogData.widgetSettings.themeColors[settings.theme];
            }

            // Update theme colors only if theme was not changed or if this is widget color settings
            if (settings.theme === old.theme || isWidgetSettings) {
                if (!settings.themeColors[settings.theme]) settings.themeColors[settings.theme] = {}
                tc.hcColors = $scope.model.themeColors.hcColors;
                tc.hcTextColor = $scope.model.themeColors.hcTextColor;
                tc.hcBackground = $scope.model.themeColors.hcBackground;
                tc.hcLineColor = $scope.model.themeColors.hcLineColor;
                tc.hcBorderColor = $scope.model.themeColors.hcBorderColor;
                tc.hcOpacity = $scope.model.themeColors.hcOpacity;
                if (!isWidgetSettings) {
                    Highcharts.setOptions({
                        chart: {
                            backgroundColor: tc.hcBackground
                        },
                        colors: tc.hcColors,
                        labels: {style: {color: tc.hcTextColor}}
                    });
                }
            }

            if (old.hcOpacity    !== tc.hcOpacity) shouldRefresh = true;
            if (old.hcBorderColor!== tc.hcBorderColor) shouldRefresh = true;
            if (old.hcLineColor  !== tc.hcLineColor) shouldRefresh = true;
            if (old.hcTextColor  !== tc.hcTextColor)     shouldRefresh = true;
            if (old.hcBackground !== tc.hcBackground)     shouldRefresh = true;
            if (old.language     !== settings.language)     shouldRefresh = true;
            if (old.theme        !== settings.theme)      shouldRefresh = true;
            if (old.isSaveFilters!== settings.isSaveFilters)shouldRefresh = true;
            if (old.isRelatedFilters!== settings.isRelatedFilters)shouldRefresh = true;
            if (old.hideFolders  !== settings.hideFolders)  shouldRefresh = true;
            if (old.showImages   !== settings.showImages)   shouldRefresh = true;
            if (old.colCount     !== settings.colCount)     shouldRefresh = true;
            if (old.widgetHeight !== settings.widgetHeight) shouldRefresh = true;

            if (isWidgetSettings) {
                $scope.ngDialogData.saveWidgetSettings();
                $scope.closeThisDialog();
                return;
            }

            Storage.setAppSettings(settings);

            if (shouldRefresh) reloadPage(); else {
                $rootScope.$broadcast('refresh-all');
                $scope.closeThisDialog();
            }

        }

        /**
         * Resets current theme colors
         */
        function resetColors() {
            if (isWidgetSettings) {
                delete $scope.ngDialogData.widgetSettings.themeColors;
                $scope.ngDialogData.saveWidgetSettings();
                $scope.closeThisDialog();
                return;
            }
            let set = Storage.getAppSettings();
            if (!set.themeColors) set.themeColors = {};
            set.themeColors[set.theme] = {};
            Storage.setAppSettings(set);
            reloadPage();
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
                    Storage.setAllSettings(contents);
                    reloadPage();
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