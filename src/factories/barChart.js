/**
 * Bar chart class factory
 */
(function() {
    'use strict';

    function BarChartFact(BaseChart, Utils) {

        function BarChart($scope) {
            BaseChart.apply(this, [$scope]);
            this.setType('bar');
            if (this.desc.type.toLowerCase() === "barchartstacked") this.enableStacking();

            this.requestData();
        }

        return BarChart;
    }

    angular.module('widgets')
        .factory('BarChart', ['BaseChart', 'Utils', BarChartFact]);

})();