(function() {
    'use strict';

    function TypeMapSvc(AreaChart, BarChart, LineChart, ColumnChart, PieChart, XyChart, TimeChart, PivotWidget, TextWidget) {
        var types = {
            piechart: {
                class: PieChart,
                type: "chart"
            },
            areachart: {
                class: AreaChart,
                type: "chart"
            },
            barchart: {
                class: BarChart,
                type: "chart"
            },
            barchartstacked: {
                class: BarChart,
                type: "chart"
            },
            linechart: {
                class: LineChart,
                type: "chart"
            },
            combochart: {
                class: LineChart,
                type: "chart"
            },
            columnchart: {
                class: ColumnChart,
                type: "chart"
            },
            xychart: {
                class: XyChart,
                type: "chart"
            },
            timechart: {
                class: TimeChart,
                type: "chart"
            },
            pivot: {
                class: PivotWidget,
                type: "pivot"
            },
            textmeter: {
                class: TextWidget,
                type: "text"
            }
        };

        this.getClass = function(name) {
            if (!types[name.toLowerCase()]) return undefined;
            return types[name.toLowerCase()].class;
        };

        this.getType = function(name) {
            if (!types[name.toLowerCase()]) return undefined;
            return types[name.toLowerCase()].type;
        };
    }

    angular.module('widgets')
        .service('TypeMap', ['AreaChart', 'BarChart', 'LineChart', 'ColumnChart', 'PieChart', 'XyChart', 'TimeChart', 'PivotWidget', 'TextWidget', TypeMapSvc]);

})();