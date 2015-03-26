(function() {
    'use strict';

    function LineChartFact(BaseChart) {

        function LineChart($scope) {
            BaseChart.apply(this, [$scope]);
            this.setType('line');
            this.requestData();
        }

        return LineChart;
    }

    angular.module('widgets')
        .factory('LineChart', ['BaseChart', LineChartFact]);

})();