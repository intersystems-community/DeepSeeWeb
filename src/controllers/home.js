/**
 * Controller for main screen, contains dashboard list as tiles
 * @view views/home.html
 */
(function() {
    'use strict';

    function DashboardListCtrl($scope, $location, $routeParams, Connector, Error, CONST, Lang, Filters, Storage) {
        var _this = this;
        var settings = Storage.getAppSettings();
        var icons = CONST.icons;
        this.search = "";
        var itemDescs = [];
        Filters.clear();

        this.getFolderItems = getFolderItems;
        this.setCurrentFolder = setCurrentFolder;
        this.retrieveData = retrieveData;
        this.requestData = requestData;

        $scope.model = {
            editing: false,
            colors: CONST.bgColorClasses,
            fontColors: settings.isMetro ? CONST.fontColorsMetro : CONST.fontColors,
            icons: icons,
            edItem: null,
            optW: 0,
            optH: 0,
            opt: false
        };
        $scope.tilesOpt = {
            minRows: 4,
            margins: [10,10],
            draggable: {
                enabled: false
            },
            resizable: {
                enabled: false
            }
        };
        $scope.enableEditing = enableEditing;
        $scope.onItemClick = onItemClicked;
        $scope.setTileColor = setTileColor;
        $scope.setFontColor = setFontColor;
        $scope.setIcon = setIcon;
        $scope.getDesc = getDesc;
        $scope.$on("refresh", function() {_this.requestData();});
        $scope.$on("search:dashboard", onSearchDashboard);

        this.setCurrentFolder();
        this.requestData();

        /**
         * Save tiles configuration to storage
         */
        function saveTiles() {
            var t = Storage.getTilesSettings();
            var path = "/";
            if (!settings.hideFolders) path = _this.curFolder;
            for (var i = 0; i < $scope.dashboards.length; i++) {
                var item = $scope.dashboards[i];
                if (!t[path]) t[path] = {};
                if (!t[path][item.title]) t[path][item.title] = {};
                t[path][item.title].row = item.row;
                t[path][item.title].col = item.col;
                t[path][item.title].sizeX = item.sizeX;
                t[path][item.title].sizeY = item.sizeY;
                t[path][item.title].color = item.color;
                t[path][item.title].fontColor = item.fontColor;
                t[path][item.title].icon = item.icon;
                t[path][item.title].hideTitle = item.hideTitle;
                if (item.widget !== null && item.widget !== "") t[path][item.title].widget = parseInt(item.widget); else delete t[path][item.title].widget;

                if (item.customTitle !== undefined) t[path][item.title].title = item.customTitle;
            }

            Storage.setTilesSettings(t);

            // Refresh only if widget id changed
            for (i = 0; i < $scope.dashboards.length; i++) {
                if ($scope.dashboards[i].widget !== $scope.dashboards[i].requestedWidget) {
                    _this.requestData();
                    return;
                }
            }
        }

        /**
         * Get full description of tile item
         * @param {number} idx Item index
         * @returns {object} Item description
         */
        function getDesc(idx) {
            return itemDescs[idx];
        }

        /**
         * Set tile background color
         * @param {number} c Color index. Colors stored in CONST.bgColorClasses
         */
        function setTileColor(c) {
            if (!$scope.model.edItem) return;
            $scope.model.edItem.color = c;
        }

        /**
         * Set tile font color
         * @param {number} c Color index. Colors stored in CONST.fontColorsMetro or CONST.fontColors, depending on current ui style
         */
        function setFontColor(c) {
            if (!$scope.model.edItem) return;
            $scope.model.edItem.fontColor = c;
        }

        /**
         * Set tile icon
         * @param {number} c Icon index. Icons stored in CONST.icons
         */
        function setIcon(c) {
            if (!$scope.model.edItem) return;
            $scope.model.edItem.icon = c;
        }

        /**
         * Toggle editing mode
          */
        function enableEditing() {
            $scope.model.editing = !$scope.model.editing;
            $scope.tilesOpt.draggable.enabled = $scope.model.editing;
            $scope.tilesOpt.resizable.enabled = $scope.model.editing;
            if (!$scope.model.editing) {
                $scope.model.edItem = null;
                saveTiles();
            }
        }

        /**
         * Callback for searching on dashboard
         * @param {object} sc Scope
         * @param {string} txt Text to search
         */
        function onSearchDashboard(sc, txt) {
            _this.search = txt;
            if (!sessionStorage.dashboarList) return;
            $scope.dashboards = _this.getFolderItems(JSON.parse(sessionStorage.dashboarList), _this.curFolder);
        }

        /**
         * Set current folder from address hash
         */
        function setCurrentFolder() {
            _this.curFolder = "";
            if ($routeParams.folder) _this.curFolder = $routeParams.folder;
            if (_this.curFolder !== "") {
                if (_this.curFolder[_this.curFolder.length - 1] != "/") _this.curFolder += "/";
            }
        }

        /**
         * Tile click event handler
         * @param {object} item Tile item clicked
         */
        function onItemClicked(item) {
            if ($scope.model.editing) {
                $scope.model.edItem = item;
                return;
            }
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
        }

        /**
         * Request dashboard list
          */
        function requestData() {
            // Request server only first time
            if (!sessionStorage.dashboarList || Connector.firstRun) {
                Connector.getDashboards().then(_this.retrieveData);
            } else {
                $scope.dashboards = _this.getFolderItems(JSON.parse(sessionStorage.dashboarList), _this.curFolder);
            }
        }

        /**
         * Process retrieved dashboard list
         * @param {object} result Server response contains dashboard list
         */
        function retrieveData(result) {
            if (result.data) if (result.data.Error) {
                Error.show(result.data.Error);
                return;
            }
            if (result.data) {
                if (result.data.children.length === 0) Error.show(Lang.get("errNoDashboards"));
                try {
                    sessionStorage.dashboarList = JSON.stringify(result.data);
                } catch (e) {
                    console.error(e);
                }
                $scope.dashboards = _this.getFolderItems(result.data, _this.curFolder);
            }
        }

        /**
         * Process retrieved dashboard list to setup initial values, etc.
         * @param dashboards
         */
        function setupList(dashboards) {
            for (var i = 0; i < dashboards.length; i++) {
                if (!settings.showImages) dashboards[i].Cover = "";

                if (dashboards[i].Cover) {
                    //dashboards[i].Cover = "http://146.185.143.59/" + dashboards[i].Cover;
                    dashboards[i].icon = 0;
                }

                if (dashboards[i].widget !== null) {
                    dashboards[i].Cover = "";
                    dashboards[i].icon = 0;
                    dashboards[i].requestedWidget = dashboards[i].widget;
                    Connector.getWidgets(dashboards[i].path).success(createDataCallback(dashboards[i]));
                }
            }
        }

        /**
         * Creates callback on data request, for widget placed on tile
         * @param {object} widget Widget description object
         * @returns {Function} Callback function
         */
        function createDataCallback(widget) {
            return function(data) {
                retriveWidgetData(data, widget);
            };
        }

        /**
         * Get items for specified folder
         * @param {object} data Dashboard list
         * @param {string} folder Folder name
         * @returns {Array} Items in folder
         */
        function getFolderItems(data, folder) {
            var dashboards = [];
            var i;
            var item;
            var path;
            var c;
            var conf = Storage.getTilesSettings();
            conf = conf[(settings.hideFolders || settings.hideFolders === undefined) ? '\\' : _this.curFolder] || {};

            if (settings.hideFolders || _this.search) {
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

                for (i = 0; i < dashboards.length; i++) {
                    c = conf[dashboards[i].title] || {};
                    if (c.hideTitle !== undefined) dashboards[i].hideTitle = c.hideTitle;
                    if (c.row !== undefined) dashboards[i].row = c.row; else dashboards[i].row = parseInt(i / 12);
                    if (c.col !== undefined) dashboards[i].col = c.col; else dashboards[i].col = i % 12;

                    dashboards[i].widget = null;
                    dashboards[i].requestedWidget = null;
                    if (c.widget !== undefined) dashboards[i].widget = parseInt(c.widget);
                    dashboards[i].template = "";
                    dashboards[i].sizeX = c.sizeX || 1;
                    dashboards[i].sizeY = c.sizeY || 1;
                    if (c.icon !== undefined) dashboards[i].icon = c.icon; else dashboards[i].icon = (dashboards[i].title === "" ? (icons.length - 1) : dashboards[i].isFolder ? 2 : 1);
                    dashboards[i].color = c.color || (dashboards[i].title === "" ? 2 : dashboards[i].isFolder ? 3 : 1);
                    dashboards[i].fontColor = c.fontColor || 0;
                    //if (dashboards[i].widget === null) dashboards[i].customTitle = c.title || dashboards[i].title; else dashboards[i].title = "";
                    dashboards[i].customTitle = c.title || dashboards[i].title;
                }

                setupList(dashboards);

                return dashboards;
            }
            var parts;
            function filter(a) {
                return a.title == parts[0];
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
            if (_this.curFolder !== "") dashboards.splice(0, 0, {title: "", path: "", isFolder: true, isBack: true, Cover: ""});
            /*for (var i = 0; i < dashboards.length; i++) {
                if (dashboards[i].bookCover) if (dashboards[i].bookCover !== "") {
                    //dashboards[i].bookCover = JSON.parse(dashboards[i].bookCover);
                }
            }*/

            dashboards = dashboards.sort(function (a, b) {
                if (a.isFolder && !b.isFolder) return -1;
                if (b.isFolder && !a.isFolder) return 1;
                if (a.title > b.title) return 1; else return -1;
            });

            for (i = 0; i < dashboards.length; i++) {
                c = conf[dashboards[i].title] || {};
                if (c.hideTitle !== undefined) dashboards[i].hideTitle = c.hideTitle;
                if (c.row !== undefined) dashboards[i].row = c.row; else dashboards[i].row = parseInt(i / 12);
                if (c.col !== undefined) dashboards[i].col = c.col; else dashboards[i].col = i % 12;

                dashboards[i].widget = null;
                dashboards[i].requestedWidget = null;
                if (c.widget !== undefined) dashboards[i].widget = parseInt(c.widget);
                dashboards[i].template = "";
                dashboards[i].sizeX = c.sizeX || 1;
                dashboards[i].sizeY = c.sizeY || 1;
                if (c.icon !== undefined) dashboards[i].icon = c.icon; else dashboards[i].icon = (dashboards[i].title === "" ? (icons.length - 1) : dashboards[i].isFolder ? 2 : 1);
                dashboards[i].color = c.color || (dashboards[i].title === "" ? 2 : dashboards[i].isFolder ? 3 : 1);
                dashboards[i].fontColor = c.fontColor || 0;
                //if (dashboards[i].widget === null) dashboards[i].customTitle = c.title || dashboards[i].title; else dashboards[i].title = "";
                dashboards[i].customTitle = c.title || dashboards[i].title;
            }

            setupList(dashboards);
            return dashboards;
        }

        /**
         * Callback for widget data retrieved
         * @param {object} result Widget data
         * @param {object} tile Tile on which widget is placed
         */
        function retriveWidgetData(result, tile) {
            if (!result.widgets[tile.widget]) {
                console.warn("Can't find widget with index " + tile.widget);
                return;
            }
            // TODO: replace inline with tile. checking (tile != undefined) is enough to know if this widget in inline mode
            result.widgets[tile.widget].inline = true;
            result.widgets[tile.widget].tile = tile;
            itemDescs.push(result.widgets[tile.widget]);
            tile.idx = itemDescs.length - 1;
            tile.template = "src/views/tile.html";
        }
    }

    var dashboard = angular.module('dashboard');
    dashboard.controller('home', ['$scope', '$location', '$routeParams', 'Connector', 'Error', 'CONST', 'Lang', 'Filters', 'Storage', DashboardListCtrl]);

})();