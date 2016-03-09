/**
 * Service to store widget type map. Returns appropriate class for specific type
 */
(function() {
    'use strict';

    function TypeMapSvc(CONST, AreaChart, BarChart, LineChart, ColumnChart, PieChart, XyChart, TimeChart, PivotWidget,
                        TextWidget, HiLowChart, TreeMapChart, BubbleChart, BullseyeChart, SpeedometerChart,
                        FuelGaugeChart, EmptyWidget, BarChartPercent, MapWidget, Storage, $injector) {
        var types = {
            fuelgauge: {
                class: FuelGaugeChart,
                type: "chart"
            },
            bullseyechart: {
                class: BullseyeChart,
                type: "chart"
            },
            speedometer: {
                class: SpeedometerChart,
                type: "chart"
            },
            bubblechart: {
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
            piechart3d: {
                class: PieChart,
                type: "chart"
            },
            donutchart3d: {
                class: PieChart,
                type: "chart"
            },
            donutchart: {
                class: PieChart,
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
            'isc.kkbanalitics.portlets.stacionarkkbportlet': {
                class: BarChartPercent,
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
            linechartmarkers: {
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
            columnchartstacked: {
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
            "deepsee.lightpivottable": {
                class: PivotWidget,
                type: "pivot"
            },
            textmeter: {
                class: TextWidget,
                type: "text"
            },
            map: {
                class: MapWidget,
                type: "map"
            },
            "deepsee.enhancedmapportlet": {
                class: MapWidget,
                type: "map"
            },
            "rf.mapportlet": {
                class: MapWidget,
                type: "map"
            }
        };

        types[CONST.emptyWidgetClass] = {
            class: EmptyWidget,
            type: "empty"
        };

        /**
         * Register new widget type
         * @param {string} name name in TypeMap
         * @param {string} type Widget type. "chart", "pivot", "map"
         * @param {string} cl Widget ckass
         */
        this.register = function(name, type, cl) {
            types[name] = {
                class: cl,
                type: type
            };
        };

        /**
         * Returns class based on type name
         * @param {string} name Type name
         * @returns {object|undefined} Class constructor function
         */
        this.getClass = function(name) {
            if (!types[name.toLowerCase()]) return undefined;
            return types[name.toLowerCase()].class;
        };

        /**
         * Returns type group based on type name
         * @param {string} name Type name
         * @returns {string|undefined} Type group
         */
        this.getType = function(name) {
            if (!types[name.toLowerCase()]) return undefined;
            return types[name.toLowerCase()].type;
        };

        var _this = this;
        // Register custom types
        var addons;
        try {
            addons = JSON.parse(Storage.getAddons() || "{}");
        } catch (e) {}
        if (addons && addons.widgets && addons.widgets.length !== 0) {
            for (var i = 0; i < addons.widgets.length; i++) {
                _this.register(addons.widgets[i].name, addons.widgets[i].type, $injector.get(addons.widgets[i].class));
            }
        }

    }

    angular.module('widgets')
        .service('TypeMap', ['CONST', 'AreaChart', 'BarChart', 'LineChart', 'ColumnChart', 'PieChart', 'XyChart', 'TimeChart',
            'PivotWidget', 'TextWidget', 'HiLowChart', 'TreeMapChart', 'BubbleChart', 'BullseyeChart', 'SpeedometerChart',
            'FuelGaugeChart', 'EmptyWidget', 'BarChartPercent', 'MapWidget', 'Storage', '$injector', TypeMapSvc]);

})();