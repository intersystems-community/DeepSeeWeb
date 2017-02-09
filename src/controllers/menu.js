/**
 * Controller for application menu(top line of screen)
 * @view views/menu.html
 */
(function(){
    'use strict';

    function MenuCtrl($scope, $routeParams, Connector, Storage, $rootScope, $location, CONST, ngDialog, Lang, Utils) {
        var _this = this;
        this.favs = [];
        loadFav();

        $scope.model = {
          //  isLoading: true,
            ver: CONST.ver,
            searchText: "",
            canAdd: !favExists($routeParams.path),
            username: localStorage.userName || "",
            visible: Storage.configLoaded || false,
            favs: getFavs(),
            onDashboard: isOnDashboard(),
            namespace: $routeParams.ns || "Samples",
            title: $routeParams.folder,
            devMode: localStorage.connectorRedirect,
            lblHome: Lang.get("home"),
            lblFav: Lang.get("fav"),
            lblSearch: Lang.get("search"),
            lblSettings: Lang.get("options"),
            lblAbout: Lang.get("about"),
            lblLang: Lang.get("language"),
            lblLogout: Lang.get("signout"),
            lblFilter: Lang.get("filters"),
            lang: Lang.current,
            langs: Lang.getLanguages(),
            filterButton: false,
            filtersVisible: false,
            namespaces: []
        };
        $scope.search = search;
        $scope.gotoDeepSee = gotoDeepSee;
        $scope.onHomeClick = onHomeClick;
        $scope.onSingoutClick = onSingoutClick;
        $scope.addToFavorites = addToFavorites;
        $scope.removeFromFav = removeFromFav;
        $scope.navigateFav = navigateFav;
        $scope.showSettings = showSettings;
        $scope.changeNamespace = changeNamespace;
        $scope.setLang = setLang;
        $scope.about = about;
        $scope.showGlobalFilter = showGlobalFilter;
        $rootScope.$on('toggleMenu', toggleMenu);
      //  $rootScope.$on('menu:toggleLoading', toggleLoading);
        $rootScope.$on('menu:changeTitle', changeTitle);
        $rootScope.$on('menu:showFilterButton', showFilterButton);
        $scope.$on('$routeChangeSuccess', onRouteChange);
        $scope.$on('servSettings:loaded', onServerSettingsLoaded);

        $rootScope.$on('lang:changed', function() {
            $scope.model.lang = Lang.current;
            $scope.model.lblHome = Lang.get("home");
            $scope.model.lblSearch = Lang.get("search");
            $scope.model.lblFav = Lang.get("fav");
            $scope.model.lblSettings = Lang.get("options");
            $scope.model.lblAbout = Lang.get("about");
            $scope.model.lblLang = Lang.get("language");
            $scope.model.lblLogout = Lang.get("signout");
            $scope.model.lblFilter = Lang.get("filters");
        });

        // Remove header space holder if there is no menu
        if (isEmbedded()) {
            $('body').css('margin-top', '-50px');
        }

        function showFilterButton(e,visible) {
            $scope.model.filterButton = visible;
            $scope.model.filtersVisible = false;
        }
        function showGlobalFilter() {
            $scope.model.filtersVisible = !$scope.model.filtersVisible;
            $rootScope.$broadcast('globalShowFilters', $scope.model.filtersVisible);
        }
        function setLang(lang) {
            var settings = Storage.getAppSettings();
            var old = Utils.merge({}, settings);
            settings.language = lang || "en";

            if (old.language !== settings.language) {
                Storage.setAppSettings(settings);
                Storage.saveCurrentSettings(Storage.currentSettings);
                Connector.saveConfig(Storage.settings).then(function(){
                    window.location.reload();
                });
            }
        }

        function changeNamespace(name) {
            $routeParams.ns = name;
            $location.path("/").url("?ns="+name);
        }

        function onServerSettingsLoaded() {
            if (Storage.serverSettings.Mappings && Storage.serverSettings.Mappings.Mapped) {
                $scope.model.namespaces = Storage.serverSettings.Mappings.Mapped.filter(function (el) {
                    return el.charAt(0) !== "%";
                });
            }
        }
        /**
         * Toggles loading indicator
         */
       /* function toggleLoading(event, isVisible){
            $scope.model.isLoading = isVisible;
        }*/

        /**
         * Open settings modal window
         */
        function showSettings() {
            ngDialog.open({template: 'src/views/settings.html', data: {}, controller: "settings", disableAnimation: dsw.mobile, showClose: true, className: "ngdialog-theme-default wnd-settings" });
        }

        /**
         * Changes current application title
         * @param {object} sc Scope
         * @param {string} title New title
         */
        function changeTitle(sc, title) {
            if (title) $scope.model.title = title.replace(".dashboard", "");
        }

        /**
         * Redirects to original DeepSee page, contains current dashboard. Works only if user on dashboard screen
         */
        function gotoDeepSee() {
            if (!isOnDashboard()) return;
            var host = "";
            //if ($location.connectorRedirect) host = "http://146.185.143.59";
            var folder = Storage.serverSettings.DefaultApp || "/csp/" + Connector.getNamespace();
            var url = folder + "/_DeepSee.UserPortal.DashboardViewer.zen?DASHBOARD=" + $routeParams.path;
            window.open(host + url);
        }

        /**
         * Show about modal dialog
         */
        function about() {
            ngDialog.open({template: 'src/views/about.html', data: {}, showClose: true, className: "ngdialog-theme-default wnd-about" });
        }

        /**
         * Search callback
         * @param {string} txt Search string
         */
        function search(txt) {
            //"search:dashboard" is listened in home.js
            $rootScope.$broadcast("search:dashboard", txt);
        }

        /**
         * Home button click handler
         */
        function onHomeClick() {
            $location.path("/");
        }

        /**
         * Saves favorites to localstorage
         */
        function saveFav() {
            if (_this.favs.length === 0) delete localStorage.favs;
            localStorage.favs = JSON.stringify(_this.favs);
        }

        /**
         * Load favorites from localstorage
         */
        function loadFav() {
            if (!localStorage.favs) return;
            _this.favs = JSON.parse(localStorage.favs);
        }

        /**
         * Returns favorites array
         * @returns {Array} Favorites
         */
        function getFavs() {
            // TODO: sort favs
            var res = [];
            for (var i = 0; i < _this.favs.length; i++) {
                var parts = _this.favs[i].split("/");
                var str = parts[parts.length - 1].replace(".dashboard", "");
                res.push({idx: i, label: str});
            }
            return res;
        }

        /**
         * Add current dashboard to favorites
         */
        function addToFavorites() {
            var favPath = $routeParams.path;
            if (favExists(favPath)) return;
            Connector.addFavorite(favPath);
            _this.favs.push(favPath);
            $scope.model.favs = getFavs();

            $scope.model.canAdd = !favExists($routeParams.path);
            saveFav();
        }

        /**
         * Removes current dashboard from favorites
         */
        function removeFromFav() {
            var favPath = $routeParams.path;
            if (!favExists(favPath)) return;
            var idx = _this.favs.indexOf(favPath);
            if (idx == -1) return;
            Connector.deleteFavorite(favPath);
            _this.favs.splice(idx, 1);
            $scope.model.favs = getFavs();

            $scope.model.canAdd = !favExists($routeParams.path);
            saveFav();
        }

        /**
         * Navigate to favorite. Redirects to favorite dashboard
         * @param {object} fav favorite
         */
        function navigateFav(fav) {
            if (!_this.favs[fav.idx]) return;
            $location.path("/d/" + _this.favs[fav.idx]);
        }

        /**
         * Is favorite exists
         * @param {string} path Favorite path
         * @returns {boolean} True if favorite exists
         */
        function favExists(path) {
            for (var i = 0; i < _this.favs.length; i++) if (_this.favs[i] === path) return true;
            return false;
        }

        /**
         * Sign out click handler
         */
        function onSingoutClick() {
            Connector.signOut();
        }

        /**
         * Toggle menu. Callback for $on("toggleMenu")
         * @param {object} event Event
         * @param {boolean} isVisible show menu or not
         */
        function toggleMenu(event, isVisible) {
            if (isVisible) $scope.model.username = localStorage.userName || "";
            $scope.model.visible = isVisible && (!isEmbedded());
        }

        function isEmbedded() {
            var params = window.location.hash.replace("?", "").replace("#/", "").split("&");
            for (var i = 0; i < params.length; i++) {
                if (params[i].indexOf('widget=') !== -1) return true;
            }
            return params.indexOf("embed=1") !== -1;
        }

        /**
         * Returns true if user currently on dashboard
         * @returns {boolean} Is on dashboard
         */
        function isOnDashboard() {
            if (!$routeParams.path) return false;
            return $routeParams.path.indexOf(".dashboard") !== -1;
        }
        
        

        /**
         * Route change callback. Used to update title, check namespace, etc.
         */
        function onRouteChange() {
            var appName = "InterSystems DeepSee™";
            if (dsw.mobile) {
                appName = "DeepSight";
            }
            $scope.model.onDashboard = isOnDashboard();
            $scope.model.searchText = "";
            $scope.model.canAdd = !favExists($routeParams.path);
            $scope.model.title = $routeParams.path || appName;
            $scope.model.title = $scope.model.title.replace(".dashboard", "");
            //var parts = $scope.model.title.split("/");
            //if (parts.length != "")
            $scope.model.namespace = $routeParams.ns || localStorage.namespace || "Samples";
            var ns = localStorage.namespace;
            if (ns) ns = ns.toLowerCase();
            if (ns !== $scope.model.namespace.toLowerCase()) {
                // Namespace changed
                delete sessionStorage.dashboarList;
                localStorage.namespace = $scope.model.namespace;
                Connector.firstRun = true;
            }
        }
    }

    angular.module('app')
        .controller('menu', ['$scope', '$routeParams', 'Connector', 'Storage', '$rootScope', '$location', 'CONST', 'ngDialog', 'Lang', 'Utils', MenuCtrl] );

})();