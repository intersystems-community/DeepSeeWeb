/**
 * Column chart class factory
 */
(function() {
    'use strict';

    function ColumnChartFact(BaseChart) {

        function ColumnChart($scope) {
            BaseChart.apply(this, [$scope]);
            this.setType('column');
            $scope.item.isBtnZero = true;
            $scope.item.isBtnValues = true;
            if (this.desc.type.toLowerCase() === "columnchartstacked") this.enableStacking();

            this.requestData();
        }

        return ColumnChart;
    }

    angular.module('widgets')
        .factory('ColumnChart', ['BaseChart', ColumnChartFact]);

})();