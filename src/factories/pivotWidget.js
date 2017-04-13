/**
 * Pivot table class factory
 */
(function() {
    'use strict';

    function PivotWidgetFact() {

        function PivotWidget($scope) {
            var _this = this;
            this.lpt = undefined;
            this.onInit = onInit;
            this.requestData = requestData;
            this.onResize = onResize;
            this._oldMdx = "";

            if (!$scope.item.pivotMdx) $scope.item.pivotMdx = _this.getMDX();
            $scope.$on("print:" + $scope.item.$$hashKey, print);
            $scope.item.onDrillDown = onDrillDown;
            $scope.item.onDrillThrough = onDrillThrough;
            $scope.item.drillUp = doDrillUp;
            /**
             * Called after pivot table was initialized
             * @param {object} lpt Pivot table object
             */
            function onInit(lpt) {
                _this.lpt = lpt;
            }

            function doDrillUp() {
                if (!_this._oldMdx) {
                    // Go back to chart if this is drillthrough from chart
                    if ($scope.item.isDrillthrough && _this.restoreWidgetType) {
                        $scope.item.isDrillthrough = null;
                        _this.restoreWidgetType();
                    }
                    return;
                }
                _this.lpt.changeBasicMDX(_this._oldMdx);
                $scope.item.backButton = false;
            }

            function onDrillThrough() {
                _this._oldMdx = _this.lpt.getActualMDX();
                $scope.item.backButton = true;
                return true;
            }

            /**
             * Called on drildown event. Broadcasts all dependent widgets to update their mdx based on pivot drill mdx
             * @param {object} p Pivot
             */
            function onDrillDown(p) {
                if (p.path) {
                    _this.doDrillFilter(p.path, _this.drills);
                    _this.drills.push({path: p.path, name: "", category: ""});
                } else {
                    _this.drills.pop();
                    _this.doDrillFilter(p.path, _this.drills);
                }

                _this.broadcastDependents(p.mdx);
            }

            /**
             * Requests pivot data
             */
            function requestData() {
                if (_this.lpt) {
                    var newMdx = _this.getMDX();
                    if (_this.lpt.isListing()) {
                        delete _this.lpt.CONFIG.initialData;
                        if (newMdx.toLowerCase().substr(0, 12) !== 'drillthrough') newMdx = _this.getDrillthroughMdx(newMdx);
                    }
                    if (newMdx === "") return;
                    if (_this.drillFilter) {
                        newMdx = newMdx + " %FILTER " + _this.drillFilter;
                    }
                    _this.broadcastDependents();
                    if (_this.lpt.getActualMDX() != newMdx) _this.lpt.changeBasicMDX(newMdx);
                    //_this.lpt.refresh();
                }
            }

            /**
             * Resize callback
             */
            function onResize() {
                if (_this.lpt) _this.lpt.updateSizes();
            }

            /**
             * Print pivot data (incomplete, don't use this function)
             */
            function print() {
                if (!_this.lpt) return;
                var p = _this.lpt.CONFIG.container;
                var h = $(p).find(".lpt-topHeader > table");
                var l = $(p).find(".lpt-leftHeader > table");
                var t = $(p).find(".lpt-tableBlock > table");
                if (!(h.length && l.length && t.length)) return;
                var table = { body: [] };

                var trs = $(h[0]).find("tr");
                var colCount = $(l[0]).find("tr:eq(0) th").length;
                // create first cell
                var row = [];
                var cell = {text: $(p).find(".lpt-headerValue").text(), rowSpan: trs.length, colSpan: colCount};
                row.push(cell);
                for (var r = 0; r < trs.length; r++) {
                    var tds = $(trs[r]).find("th");
                    for (var c = 0; c < tds.length; c++) {
                        var $c = $(tds[c]);
                        var rowSpan = $c.attr("rowspan") || 1;
                        var colSpan = $c.attr("colspan") || 1;
                        cell = {text: $c.text(), rowSpan: rowSpan, colSpan: colSpan};
                        row.push(cell);
                    }
                    table.body.push(row);
                    row = [];
                }

                //TODO: print trs

                var ct = [{table: table}];
                pdfMake.createPdf({
                    content: ct
                }).open();
            }
        }

        return PivotWidget;
    }

    angular.module('widgets')
        .factory('PivotWidget', PivotWidgetFact);

})();