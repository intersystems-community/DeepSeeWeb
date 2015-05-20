(function(){
    'use strict';

    function WidgetCtrl($scope, Lang, TypeMap, gridsterConfig, ngDialog, Filters, BaseWidget) {
        var _this = this;
        BaseWidget.apply(this, [$scope]);
        //this.changeType = function(newType) { changeType(null, newType); };
        $scope.model = {
            error: "",
            filters: Filters.getWidgetModelFilters(this.desc.name)
        };
        var type = TypeMap.getClass(_this.desc.type);
        if (type) type.apply(this, [$scope]); else {
            _this.supported = false;
            _this.showError(Lang.get("errWidgetNotSupported"));
        }
        if ($scope.model.filters.length === 0) this.hideToolbar();


        $scope.onInit = this.onInit;
        //$scope.onSizeChange = onSizeChange;
        $scope.requestData = this.requestData;
        $scope.toggleFilter = toggleFilter;

        $scope.$on("refresh:" + $scope.item.$$hashKey, function(){_this.requestData();});
        $scope.$on("filter" + _this.desc.name, applyFilter);
        $scope.$on("filterAll", applyFilter);
        //$scope.$on('resize', onResize);
        $scope.$on('gridster-item-transition-end', onResize);
        $scope.$on('gridster-resized', onResize);
        $scope.$watch('item.row', onMoveVertical, true);
        $scope.$watch('item.col', onMoveHorizontal, true);
        $scope.$watch('item.sizeX', onResizeHorizontal, true);
        $scope.$watch('item.sizeY', onResizeVertical, true);
        $scope.$on("resetWidgets", resetWidget);
        $scope.$on("setType:" + $scope.item.$$hashKey, changeType);
        /* $scope.$on('resizeWidget' + $scope.item.$$hashKey, function() {
             if (_this.chart) _this.chart.setSize(_this.size.width, _this.size.height, false);
             if (_this.lpt) _this.lpt.updateSizes();
         });*/
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /*function onSizeChange(newSize) {
            _this.size = newSize;
            //if (_this.lpt) _this.lpt.updateSizes();
        }*/

        function changeType(sc, t) {
            _this.desc.type = t;
            if ((_this.chart) && (t.indexOf("chart") != -1)) {
                _this.setType(t.replace("chart", ""));
            } else $scope.$broadcast("typeChanged");
        }

        function resetWidget() {
            delete localStorage["pos" + _this.desc.key + "x"];
            delete localStorage["pos" + _this.desc.key + "y"];
            delete localStorage["sizes" + _this.desc.key + "x"];
            delete localStorage["sizes" + _this.desc.key + "y"];
        }

        function onResize() {
            _this.onResize();
        }

        function applyFilter() {
            _this.updateFiltersText();
            _this.requestData();
        }

        function toggleFilter(idx, e) {
            var flt = Filters.getFilter(idx);
            if (!flt) return;
            var obj = e.currentTarget.tagName.toUpperCase() === "INPUT" ? e.currentTarget.nextElementSibling.offsetParent : e.currentTarget.offsetParent.offsetParent;
            if (obj) {
                var rect = obj.getBoundingClientRect();
                changeStyle(".ngdialog.ngdialog-theme-plain .ngdialog-content", "margin-left", rect.left + "px");
                changeStyle(".ngdialog.ngdialog-theme-plain .ngdialog-content", "margin-top", (rect.top + 16) + "px");
            }
            ngDialog.open({template: 'src/views/filter.html', data: flt, controller: "filter", showClose: false, className: "ngdialog-theme-plain" });
        }

        /*function onResizeWindow() {
            if (_this.chart) {
                if (!isNaN($scope.item.sizeX)) _this.chart.setSize($scope.item.sizeX * gridsterConfig.itemSize + ($scope.item.sizeX-1)*12, _this.chart.chartHeight);
                if (!isNaN($scope.item.sizeY)) _this.chart.setSize(_this.chart.chartWidth, $scope.item.sizeY * gridsterConfig.itemSize+ ($scope.item.sizeY-1)*12 - 50);
            }
        }*/

        function onMoveHorizontal(a, b, $scope){
            if (!gridsterConfig.isDragging) return;
            if (!isNaN($scope.item.row)) {
                localStorage["pos" + _this.desc.key + "x"] = $scope.item.col;
            }
        }

        function onMoveVertical(a, b, $scope){
            if (!gridsterConfig.isDragging) return;
            if (!isNaN($scope.item.row)) {
                localStorage["pos" + _this.desc.key + "y"] = $scope.item.row;
            }
        }

        function onResizeHorizontal(sx, sy, $scope){
            if (!gridsterConfig.isResizing) return;
            if (!isNaN($scope.item.sizeX)) {
                localStorage["sizes" + _this.desc.key + "x"] = $scope.item.sizeX;
                //_this.onResize();
               /* if (_this.chart) {
                    _this.chart.setSize($scope.item.sizeX * gridsterConfig.itemSize + ($scope.item.sizeX-1)*12, _this.chart.chartHeight, false);
                }*/
                //if (_this.lpt) _this.lpt.updateSizes();
            }
        }

        function onResizeVertical(sx, sy, $scope) {
            if (!gridsterConfig.isResizing) return;
            if (!isNaN($scope.item.sizeY)) {
                localStorage["sizes" + _this.desc.key + "y"] = $scope.item.sizeY;
                //_this.onResize();
               /* if (_this.chart) {
                    _this.chart.setSize(_this.chart.chartWidth, $scope.item.sizeY * gridsterConfig.itemSize+ ($scope.item.sizeY-1)*12 - 50, false);
                }*/
                //if (_this.lpt) _this.lpt.updateSizes();
            }
        }

        // function used to change ngDialog css rules to position it in desired place
        function changeStyle(selectorText, style, value) {
            var theRules = [];
            for (var i = 0; i < document.styleSheets.length; i++) {
                if (document.styleSheets[i].cssRules) {
                    theRules = document.styleSheets[i].cssRules;
                }
                else if (document.styleSheets[i].rules) {
                    theRules = document.styleSheets[i].rules;
                }
                for (var n in theRules) {
                    if (theRules[n].selectorText == selectorText) {
                        theRules[n].style[style] = value;
                    }
                }
            }
        }
    }

    angular.module('widgets')
        .controller('widget', ['$scope', 'Lang', 'TypeMap', 'gridsterConfig', 'ngDialog', 'Filters', 'BaseWidget', WidgetCtrl]);

})();