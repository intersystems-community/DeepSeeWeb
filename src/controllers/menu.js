/**
 * Controller for application menu(top line of screen)
 * @view views/menu.html
 */
(function(){
    'use strict';

    function MenuCtrl($scope, $routeParams, Connector, $window, $rootScope, $location, CONST, ngDialog) {
        var _this = this;
        this.favs = [];
        loadFav();

        $scope.model = {
          //  isLoading: true,
            ver: CONST.ver,
            searchText: "",
            canAdd: !favExists($routeParams.path),
            username: localStorage.userName || "",
            visible: false,
            favs: getFavs(),
            onDashboard: isOnDashboard(),
            //hideFolders: CONST.hideFolders,
            namespace: $routeParams.ns || "Samples",
            title: $routeParams.folder,
            //isMetro: localStorage.isMetro === "true" || false,
            //showImages: CONST.showImages,
            devMode: localStorage.connectorRedirect
        };
        $scope.search = search;
        $scope.gotoDeepSee = gotoDeepSee;
        $scope.onHomeClick = onHomeClick;
        $scope.onSingoutClick = onSingoutClick;
        $scope.addToFavorites = addToFavorites;
        $scope.removeFromFav = removeFromFav;
        $scope.navigateFav = navigateFav;
        $scope.showSettings = showSettings;
        $rootScope.$on('toggleMenu', toggleMenu);
      //  $rootScope.$on('menu:toggleLoading', toggleLoading);
        $rootScope.$on('menu:changeTitle', changeTitle);
        $scope.$on('$routeChangeSuccess', onRouteChange);

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
            ngDialog.open({template: 'src/views/settings.html', data: {}, controller: "settings", showClose: true, className: "ngdialog-theme-default wnd-settings" });
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
            var url = "/csp/" + Connector.getNamespace() + "/_DeepSee.UserPortal.DashboardViewer.zen?DASHBOARD=" + $routeParams.path;
            window.open(host + url);
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
            $scope.model.visible = isVisible;
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
            $scope.model.onDashboard = isOnDashboard();
            $scope.model.searchText = "";
            $scope.model.canAdd = !favExists($routeParams.path);
            $scope.model.title = $routeParams.path || "InterSystems DeepSee™";
            $scope.model.title = $scope.model.title.replace(".dashboard", "");
            //var parts = $scope.model.title.split("/");
            //if (parts.length != "")
            $scope.model.namespace = $routeParams.ns || "Samples";
            var ns = localStorage.namespace;
            if (ns) ns = ns.toLowerCase();
            if (ns !== $scope.model.namespace) {
                localStorage.namespace = $scope.model.namespace;
                Connector.firstRun = true;
            }
        }
    }

    angular.module('app')
        .controller('menu', ['$scope', '$routeParams', 'Connector', '$window', '$rootScope', '$location', 'CONST', 'ngDialog', MenuCtrl] );

})();