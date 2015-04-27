(function() {
    'use strict';

    function TypeMapSvc(AreaChart, BarChart, LineChart, ColumnChart, PieChart, XyChart, TimeChart, PivotWidget,
                        TextWidget, HiLowChart, TreeMapChart, BubbleChart, BullseyeChart, SpeedometerChart,
                        FuelGaugeChart) {
        var types = {
            fuelgauge: {
                class: FuelGaugeChart,
                type: "chart"
            }, bullseyechart: {
                class: BullseyeChart,
                type: "chart"
            }, speedometer: {
                class: SpeedometerChart,
                type: "chart"
            }, bubblechart: {
                class: BubbleChart,
                type: "chart"
            },
            treemapchart: {
                class: TreeMapChart,
                type: "chart"
            },
            hilowchart: {
                class: HiLowChart,
                type: "chart"
            },
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
        .service('TypeMap', ['AreaChart', 'BarChart', 'LineChart', 'ColumnChart', 'PieChart', 'XyChart', 'TimeChart',
            'PivotWidget', 'TextWidget', 'HiLowChart', 'TreeMapChart', 'BubbleChart', 'BullseyeChart', 'SpeedometerChart',
            'FuelGaugeChart', TypeMapSvc]);

})();