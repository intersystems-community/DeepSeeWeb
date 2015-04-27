(function() {
    'use strict';

    function PieChartFact(BaseChart) {

        function PieChart($scope) {
            BaseChart.apply(this, [$scope]);

            $scope.chartConfig.options.plotOptions = {series: {allowPointSelect: true, stickyTracking: false}};
            this.setType('pie');

           /* this.parseData = function(data) {
                var values = [];

                $scope.chartConfig.series = [];
                $scope.chartConfig.series.push({});
                $scope.chartConfig.series[0].name = data.Cols[0].caption;
                for (var d = 0; d < data.Cols[1].tuples.length; d++) {
                    values.push([data.Cols[1].tuples[d].caption, data.Data[d]]);
                }

                $scope.chartConfig.series[0].data = values;
                $scope.chartConfig.series[0].name = data.Cols[0].tuples[0].caption;
                $scope.chartConfig.series[0].format = data.Cols[0].tuples[0].format;
            };*/

            this.requestData();
        }

        return PieChart;
    }

    angular.module('widgets')
        .factory('PieChart', ['BaseChart', PieChartFact]);

})();