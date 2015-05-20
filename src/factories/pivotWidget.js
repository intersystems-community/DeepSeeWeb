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
        }

        return PivotWidget;
    }

    angular.module('widgets')
        .factory('PivotWidget', PivotWidgetFact);

})();