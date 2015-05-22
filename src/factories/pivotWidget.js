(function() {
    'use strict';

    function PivotWidgetFact() {

        function PivotWidget($scope) {
            var _this = this;
            this.lpt = undefined;
            this.onInit = onInit;
            this.requestData = requestData;
            this.onResize = onResize;

            $scope.item.pivotMdx = _this.getMDX();
            $scope.$on("print:" + $scope.item.$$hashKey, print);
            function onInit(lpt) {
                _this.lpt = lpt;
            }

            function requestData() {
                if (_this.lpt) {
                    var newMdx = _this.getMDX();
                    if (_this.lpt.getActualMDX() != newMdx) _this.lpt.changeBasicMDX(newMdx);
                    _this.lpt.refresh();
                }
            }

            function onResize() {
                if (_this.lpt) _this.lpt.updateSizes();
            }

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