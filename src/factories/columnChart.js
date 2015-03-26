(function() {
    'use strict';

    function ColumnChartFact(BaseChart) {

        function ColumnChart($scope) {
            BaseChart.apply(this, [$scope]);
            this.setType('column');
            this.requestData();
        }

        return ColumnChart;
    }

    angular.module('widgets')
        .factory('ColumnChart', ['BaseChart', ColumnChartFact]);

})();