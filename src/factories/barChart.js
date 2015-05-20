(function() {
    'use strict';

    function BarChartFact(BaseChart, Utils) {

        function BarChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;
            this.setType('bar');
            if (this.desc.type.toLowerCase() === "barchartstacked") this.enableStacking();

            this.requestData();
        }

        return BarChart;
    }

    angular.module('widgets')
        .factory('BarChart', ['BaseChart', 'Utils', BarChartFact]);

})();