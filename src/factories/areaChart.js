(function() {
    'use strict';

    function AreaChartFact(BaseChart) {

        function AreaChart($scope) {
            BaseChart.apply(this, [$scope]);
            this.setType('area');
            this.requestData();
        }

        return AreaChart;
    }

    angular.module('widgets')
        .factory('AreaChart', ['BaseChart', AreaChartFact]);

})();