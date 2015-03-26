(function() {
    'use strict';

    function BarChartFact(BaseChart) {

        function BarChart($scope) {
            BaseChart.apply(this, [$scope]);
            this.setType('bar');
            this.requestData();
        }

        return BarChart;
    }

    angular.module('widgets')
        .factory('BarChart', ['BaseChart', BarChartFact]);

})();