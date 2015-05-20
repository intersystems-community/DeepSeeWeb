(function() {
    'use strict';

    function DashboardListCtrl($scope, $location, $routeParams, Connector, Error, CONST, Lang) {
        var _this = this;
        _this.search = "";

        $scope.$on("search:dashboard", onSearchDashboard);

        function onSearchDashboard(sc, txt) {
            _this.search = txt;
            if (!sessionStorage.dashboarList) return;
            $scope.dashboards = _this.getFolderItems(JSON.parse(sessionStorage.dashboarList), _this.curFolder);
        }

        // Get current folder from address hash
        this.getCurrentFolder = function() {
            this.curFolder = "";
            if ($routeParams.folder) this.curFolder = $routeParams.folder;
            if (this.curFolder !== "") {
                if (this.curFolder[this.curFolder.length - 1] != "/") this.curFolder += "/";
            }
        };

        // Redirect when item clicked
        this.onItemClicked = function(item) {
            if (item.isFolder) {
                if (item.title === "") {
                    var parts = _this.curFolder.split("/");
                    parts.splice(parts.length - 2, 2);
                    if (parts.length === 0) $location.path("/"); else
                        $location.path("/f/" + parts.join("/"));
                } else {
                    _this.curFolder += item.title;
                    $location.path("/f/" + _this.curFolder);
                }
            } else {
                $location.path("/d/" + item.path);
            }
        };

        // Request dashboard list
        this.requestData = function() {
            // Request server only first time
            if (!sessionStorage.dashboarList || Connector.firstRun) {
                Connector.getDashboards().then(this.retrieveData);
            } else {
                $scope.dashboards = this.getFolderItems(JSON.parse(sessionStorage.dashboarList), _this.curFolder);
            }
        };

        // Process retrieved dashboard list
        this.retrieveData = function(result) {
            if (result.data) if (result.data.Error) {
                Error.show(result.data.Error);
                return;
            }
            if (result.data) {
                if (result.data.children.length === 0) Error.show(Lang.get("errNoDashboards"));
                sessionStorage.dashboarList = JSON.stringify(result.data);
                $scope.dashboards = _this.getFolderItems(result.data, _this.curFolder);
            }
        };

        // Get items for specified folder
        this.getFolderItems = function(data, folder) {
            var dashboards = [];
            var i;
            var item;
            var path;

            if (CONST.hideFolders || _this.search) {
                for (i = 0; i < data.children.length; i++) {
                    item = data.children[i];
                    if (item.path.toLocaleLowerCase().indexOf(_this.search.toLocaleLowerCase()) === -1) continue;
                    path = item.path;
                    if (path.substr(0, folder.length).toLowerCase() != folder.toLowerCase()) continue;
                    path = path.substr(folder.length, path.length);
                    parts = path.split("/");
                    if (parts.length === 0) continue;
                    item.title = parts[parts.length - 1];
                    item.title = item.title.replace(".dashboard", "");
                    dashboards.push(item);
                }

                return dashboards;
            }
            var parts;
            function filter(a) {
                if (a.title == parts[0]) return true;
                return false;
            }


            for (i = 0; i < data.children.length; i++) {
                item = data.children[i];
                path = item.path;
                if (path.substr(0, folder.length).toLowerCase() != folder.toLowerCase()) continue;
                path = path.substr(folder.length, path.length);
                parts = path.split("/");
                if (parts.length === 0) continue;
                if (parts.length === 1) {
                    if (item.title === "") {
                        item.title = parts[0];
                        item.title = item.title.replace(".dashboard", "");
                    }
                    dashboards.push(item);
                } else {
                    if (dashboards.filter(filter).length === 0) {
                        dashboards.push({title: parts[0], path: "", isFolder: true, Cover: "" });
                    }
                }
            }
            if (_this.curFolder !== "") dashboards.push({title: "", path: "", isFolder: true, isBack: true, Cover: ""});
            /*for (var i = 0; i < dashboards.length; i++) {
                if (dashboards[i].bookCover) if (dashboards[i].bookCover !== "") {
                    //dashboards[i].bookCover = JSON.parse(dashboards[i].bookCover);
                }
            }*/

            return dashboards.sort(function (a, b) {
                if (a.isFolder && !b.isFolder) return -1;
                if (b.isFolder && !a.isFolder) return 1;
                if (a.title > b.title) return 1; else return -1;
            });
        };

        this.getCurrentFolder();
        $scope.onItemClick = this.onItemClicked;
        $scope.$on("refresh", function() {_this.requestData();});

        this.requestData();
    }

    var dashboard = angular.module('dashboard');
    dashboard.controller('dashboardList', ['$scope', '$location', '$routeParams', 'Connector', 'Error', 'CONST', 'Lang', DashboardListCtrl]);

})();