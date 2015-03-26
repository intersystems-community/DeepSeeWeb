(function() {
    'use strict';

    function TypeMapSvc(AreaChart, BarChart, LineChart, ColumnChart, PieChart, XyChart, TimeChart) {
        var types = {
            piechart: PieChart,
            areachart: AreaChart,
            barchart: BarChart,
            linechart: LineChart,
            columnchart: ColumnChart,
            xychart: XyChart,
            timechart: TimeChart
        };

        this.getClass = function(name) {
            return types[name.toLowerCase()];
        };
    }

    angular.module('widgets')
        .service('TypeMap', ['AreaChart', 'BarChart', 'LineChart', 'ColumnChart', 'PieChart', 'XyChart', 'TimeChart', TypeMapSvc]);

})();