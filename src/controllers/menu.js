(function(){
    'use strict';

    function MenuCtrl($scope, $routeParams, Connector, $window, $rootScope, $location, CONST) {
        var _this = this;
        this.favs = [];
        loadFav();

        $scope.model = {
            ver: CONST.ver,
            searchText: "",
            canAdd: !favExists($routeParams.path),
            username: localStorage.userName || "",
            visible: true,
            favs: getFavs(),
            onDashboard: isOnDashboard(),
            hideFolders: CONST.hideFolders,
            namespace: $routeParams.ns || "Samples",
            title: $routeParams.folder,
            isMetro: localStorage.isMetro === "true" || false,
            showImages: CONST.showImages
        };
        $scope.search = search;
        $scope.setMetroStyle = setMetroStyle;
        $scope.gotoDeepSee = gotoDeepSee;
        $scope.resetWidgets = resetWidgets;
        $scope.onHomeClick = onHomeClick;
        $scope.onSingoutClick = onSingoutClick;
        $scope.addToFavorites = addToFavorites;
        $scope.removeFromFav = removeFromFav;
        $scope.navigateFav = navigateFav;
        $scope.toogleFolders = toogleFolders;
        $scope.toogleImages = toogleImages;
        $rootScope.$on('toogleMenu', toggleMenu);
        $rootScope.$on('menu:changeTitle', changeTitle);

        function setMetroStyle() {
            $scope.model.isMetro = !$scope.model.isMetro;
            localStorage.isMetro = $scope.model.isMetro;
            $window.location.reload();
        }

        function changeTitle(sc, title) {
            if (title) $scope.model.title = title.replace(".dashboard", "");
        }

        function gotoDeepSee() {
            if (!isOnDashboard()) return;
            var host = "";
            if ($location.$$host === "test.deepsee.com") host = "http://146.185.143.59";
            var url = "/csp/" + Connector.getNamespace() + "/_DeepSee.UserPortal.DashboardViewer.zen?DASHBOARD=" + $routeParams.path;
            window.open(host + url);
        }

        function search(txt) {
            $rootScope.$broadcast("search:dashboard", txt);
        }

        function onHomeClick() {
            $location.path("/");
        }

        function toogleFolders() {
            CONST.hideFolders = !CONST.hideFolders;
            localStorage.hideFolders = CONST.hideFolders;
            $scope.model.hideFolders = CONST.hideFolders;
            $rootScope.$broadcast("refresh");
        }

        function toogleImages() {
            CONST.showImages = !CONST.showImages;
            localStorage.showImages = CONST.showImages;
            $scope.model.showImages = CONST.showImages;
            $rootScope.$broadcast("refresh");
        }

        function saveFav() {
            if (_this.favs.length === 0) delete localStorage.favs;
            localStorage.favs = JSON.stringify(_this.favs);
        }

        function loadFav() {
            if (!localStorage.favs) return;
            _this.favs = JSON.parse(localStorage.favs);
        }

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

        function addToFavorites() {
            var favPath = $routeParams.path;
            if (favExists(favPath)) return;
            Connector.addFavorite(favPath);
            _this.favs.push(favPath);
            $scope.model.favs = getFavs();

            $scope.model.canAdd = !favExists($routeParams.path);
            saveFav();
        }

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

        function navigateFav(fav) {
            if (!_this.favs[fav.idx]) return;
            $location.path("/d/" + _this.favs[fav.idx]);
        }

        function favExists(path) {
            for (var i = 0; i < _this.favs.length; i++) if (_this.favs[i] === path) return true;
            return false;
        }

        function onSingoutClick() {
            Connector.signOut();
        }

        function toggleMenu(event, isVisible) {
            if (isVisible) $scope.model.username = localStorage.userName || "";
            $scope.model.visible = isVisible;
        }

        function resetWidgets() {
            $rootScope.$broadcast("resetWidgets");
        }

        function isOnDashboard() {
            if (!$routeParams.path) return false;
            return $routeParams.path.indexOf(".dashboard") !== -1;
        }

        $scope.$on('$routeChangeSuccess', function () {
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
        });
    }

    angular.module('app')
        .controller('menu', ['$scope', '$routeParams', 'Connector', '$window', '$rootScope', '$location', 'CONST', MenuCtrl] );

})();