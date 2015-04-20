(function(){
    'use strict';

    function MenuCtrl($scope, $routeParams, Connector, Lang, $rootScope, $location, CONST) {
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
            hideFolders: CONST.hideFolders
        };
        $scope.search = search;
        $scope.resetWidgets = resetWidgets;
        $scope.onSingoutClick = onSingoutClick;
        $scope.addToFavorites = addToFavorites;
        $scope.removeFromFav = removeFromFav;
        $scope.navigateFav = navigateFav;
        $scope.toogleFolders = toogleFolders;
        $rootScope.$on('toogleMenu', toggleMenu);

        function search(txt) {
            $rootScope.$broadcast("search:dashboard", txt);
        }

        function toogleFolders() {
            CONST.hideFolders = !CONST.hideFolders;
            localStorage.hideFolders = CONST.hideFolders;
            $scope.model.hideFolders = CONST.hideFolders;
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
            _this.favs.splice(idx, 1);
            $scope.model.favs = getFavs();

            $scope.model.canAdd = !favExists($routeParams.path);
            saveFav();
        }

        function navigateFav(fav) {
            if (!_this.favs[fav.idx]) return;
            $location.path("/dashboard/" + _this.favs[fav.idx]);
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
            $scope.model.canAdd = !favExists($routeParams.path);
        });
    }

    angular.module('app')
        .controller('menu', ['$scope', '$routeParams', 'Connector', 'Lang', '$rootScope', '$location', 'CONST', MenuCtrl] );

})();