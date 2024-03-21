"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeatmapChartComponent = void 0;
const core_1 = require("@angular/core");
const base_chart_class_1 = require("../app/components/widgets/charts/base-chart.class");
/**
 * Example Data property
 *
 * {"padding": 1, "borderColor": "#FFFFFF", "minColor": "rgba(0,0,255,0.51)", "maxColor": "rgba(82,255,28,0.6)", "stops": [["", "#000000", "Empty"], [2, "#00FF00", "Category 1"], [14, "#0000FF"], [15, "#FF0000"]]}
 *
 */
// Mock data for testing
// const d = {
//     "Info": {"Error": "", "KpiName": "SleepRecord.kpi"}, "Result": {
//         "Properties": [{"name": 1, "caption": 12, "columnNo": 1}, {
//             "name": 2,
//             "caption": 13,
//             "columnNo": 2
//         }, {"name": 3, "caption": 14, "columnNo": 3}, {"name": 4, "caption": 15, "columnNo": 4}, {
//             "name": 5,
//             "caption": 16,
//             "columnNo": 5
//         }, {"name": 6, "caption": 17, "columnNo": 6}, {"name": 7, "caption": 18, "columnNo": 7}, {
//             "name": 8,
//             "caption": 19,
//             "columnNo": 8
//         }, {"name": 9, "caption": 20, "columnNo": 9}, {"name": 10, "caption": 21, "columnNo": 10}, {
//             "name": 11,
//             "caption": 22,
//             "columnNo": 11
//         }, {"name": 12, "caption": 23, "columnNo": 12}, {"name": 13, "caption": 24, "columnNo": 13}, {
//             "name": 14,
//             "caption": 1,
//             "columnNo": 14
//         }, {"name": 15, "caption": 2, "columnNo": 15}, {"name": 16, "caption": 3, "columnNo": 16}, {
//             "name": 17,
//             "caption": 4,
//             "columnNo": 17
//         }, {"name": 18, "caption": 5, "columnNo": 18}, {"name": 19, "caption": 6, "columnNo": 19}, {
//             "name": 20,
//             "caption": 7,
//             "columnNo": 20
//         }, {"name": 21, "caption": 8, "columnNo": 21}, {"name": 22, "caption": 9, "columnNo": 22}, {
//             "name": 23,
//             "caption": 10,
//             "columnNo": 23
//         }, {"name": 24, "caption": 11, "columnNo": 24}],
//         "Series": [{
//             "1": "",
//             "2": "",
//             "3": "",
//             "4": 2,
//             "5": 2,
//             "6": "",
//             "7": "",
//             "8": "",
//             "9": "",
//             "10": "",
//             "11": "",
//             "12": 15,
//             "13": 15,
//             "14": 15,
//             "15": 15,
//             "16": 15,
//             "17": 15,
//             "18": 15,
//             "19": 15,
//             "20": 15,
//             "21": 15,
//             "22": 15,
//             "23": 15,
//             "24": 15,
//             "%series": "01/06/2020"
//         }, {
//             "1": 15,
//             "2": 15,
//             "3": 0.25,
//             "4": "",
//             "5": "",
//             "6": "",
//             "7": "",
//             "8": "",
//             "9": "",
//             "10": "",
//             "11": "",
//             "12": 14,
//             "13": 14,
//             "14": 14,
//             "15": 14,
//             "16": 14,
//             "17": 14,
//             "18": 14,
//             "19": 14,
//             "20": 14,
//             "21": 14,
//             "22": 14,
//             "23": 14,
//             "24": 14,
//             "%series": "02/06/2020"
//         }, {
//             "1": 14,
//             "2": "",
//             "3": "",
//             "4": 2,
//             "5": 2,
//             "6": 0.25,
//             "7": "",
//             "8": "",
//             "9": "",
//             "10": "",
//             "11": "",
//             "12": "",
//             "13": "",
//             "14": "",
//             "15": "",
//             "16": "",
//             "17": "",
//             "18": "",
//             "19": "",
//             "20": "",
//             "21": "",
//             "22": "",
//             "23": "",
//             "24": "",
//             "%series": "03/06/2020"
//         }, {
//             "1": "",
//             "2": "",
//             "3": "",
//             "4": "",
//             "5": "",
//             "6": "",
//             "7": "",
//             "8": "",
//             "9": "",
//             "10": "",
//             "11": "",
//             "12": 15,
//             "13": 15,
//             "14": 15,
//             "15": 15,
//             "16": 15,
//             "17": 15,
//             "18": 15,
//             "19": 15,
//             "20": 15,
//             "21": 15,
//             "22": 15,
//             "23": 15,
//             "24": 15,
//             "%series": "04/06/2020"
//         }, {
//             "1": 15,
//             "2": 15,
//             "3": 2,
//             "4": 2,
//             "5": "",
//             "6": "",
//             "7": "",
//             "8": "",
//             "9": "",
//             "10": "",
//             "11": "",
//             "12": 14,
//             "13": 14,
//             "14": 14,
//             "15": 14,
//             "16": 14,
//             "17": 14,
//             "18": 14,
//             "19": 14,
//             "20": 14,
//             "21": 14,
//             "22": 14,
//             "23": 14,
//             "24": 14,
//             "%series": "05/06/2020"
//         }, {
//             "1": 1,
//             "2": 0.25,
//             "3": "",
//             "4": "",
//             "5": "",
//             "6": "",
//             "7": "",
//             "8": "",
//             "9": "",
//             "10": "",
//             "11": 15,
//             "12": 15,
//             "13": 15,
//             "14": 15,
//             "15": 15,
//             "16": 15,
//             "17": 15,
//             "18": 15,
//             "19": 15,
//             "20": 15,
//             "21": 15,
//             "22": 15,
//             "23": 15,
//             "24": 15,
//             "%series": "06/06/2020"
//         }, {
//             "1": 15,
//             "2": 0.25,
//             "3": 2,
//             "4": 2,
//             "5": "",
//             "6": "",
//             "7": "",
//             "8": "",
//             "9": "",
//             "10": "",
//             "11": "",
//             "12": 15,
//             "13": 15,
//             "14": 15,
//             "15": 15,
//             "16": 15,
//             "17": 15,
//             "18": 15,
//             "19": 15,
//             "20": 15,
//             "21": 15,
//             "22": 15,
//             "23": 15,
//             "24": 15,
//             "%series": "07/06/2020"
//         }]
//     }
// };
// const d = {"Info":{"Error":"","KpiName":"SleepRecord.kpi"},"Result":{"Properties":[{"name":1,"caption":12,"columnNo":1},{"name":2,"caption":13,"columnNo":2},{"name":3,"caption":14,"columnNo":3},{"name":4,"caption":15,"columnNo":4},{"name":5,"caption":16,"columnNo":5},{"name":6,"caption":17,"columnNo":6},{"name":7,"caption":18,"columnNo":7},{"name":8,"caption":19,"columnNo":8},{"name":9,"caption":20,"columnNo":9},{"name":10,"caption":21,"columnNo":10},{"name":11,"caption":22,"columnNo":11},{"name":12,"caption":23,"columnNo":12},{"name":13,"caption":24,"columnNo":13},{"name":14,"caption":1,"columnNo":14},{"name":15,"caption":2,"columnNo":15},{"name":16,"caption":3,"columnNo":16},{"name":17,"caption":4,"columnNo":17},{"name":18,"caption":5,"columnNo":18},{"name":19,"caption":6,"columnNo":19},{"name":20,"caption":7,"columnNo":20},{"name":21,"caption":8,"columnNo":21},{"name":22,"caption":9,"columnNo":22},{"name":23,"caption":10,"columnNo":23},{"name":24,"caption":11,"columnNo":24}],"Series":[{"1":"","2":"","3":"","4":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 120 mins\"}","5":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 120 mins\"}","6":"","7":"","8":"","9":"","10":"","11":"","12":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","13":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","14":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","15":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","16":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","17":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","18":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","19":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","20":"{\"value:\".75,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","21":"","22":"","23":"","24":"","%series":"01/06/2020"},{"1":"","2":"","3":"","4":"","5":"","6":"","7":"","8":"","9":"","10":"","11":"","12":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 600 mins\"}","13":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 600 mins\"}","14":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 600 mins\"}","15":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 600 mins\"}","16":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 600 mins\"}","17":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 600 mins\"}","18":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 600 mins\"}","19":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 600 mins\"}","20":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 600 mins\"}","21":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 600 mins\"}","22":"","23":"","24":"","%series":"02/06/2020"},{"1":"","2":"","3":"","4":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 135 mins\"}","5":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 135 mins\"}","6":"{\"value:\".25,\"tooltip\":\"Event: Sleep\\nDuration: 135 mins\"}","7":"","8":"","9":"","10":"","11":"","12":"","13":"","14":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 615 mins\"}","15":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 615 mins\"}","16":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 615 mins\"}","17":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 615 mins\"}","18":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 615 mins\"}","19":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 615 mins\"}","20":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 615 mins\"}","21":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 615 mins\"}","22":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 615 mins\"}","23":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 615 mins\"}","24":"{\"value:\".25,\"tooltip\":\"Event: Sleep\\nDuration: 615 mins\"}","%series":"03/06/2020"},{"1":"","2":"","3":"","4":"","5":"","6":"","7":"","8":"","9":"","10":"","11":"","12":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 540 mins\"}","13":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 540 mins\"}","14":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 540 mins\"}","15":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 540 mins\"}","16":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 540 mins\"}","17":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 540 mins\"}","18":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 540 mins\"}","19":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 540 mins\"}","20":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 540 mins\"}","21":"","22":"","23":"","24":"","%series":"04/06/2020"},{"1":"","2":"","3":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 105 mins\"}","4":"{\"value:\".75,\"tooltip\":\"Event: Sleep\\nDuration: 105 mins\"}","5":"","6":"","7":"","8":"","9":"","10":"","11":"","12":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 585 mins\"}","13":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 585 mins\"}","14":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 585 mins\"}","15":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 585 mins\"}","16":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 585 mins\"}","17":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 585 mins\"}","18":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 585 mins\"}","19":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 585 mins\"}","20":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 585 mins\"}","21":"{\"value:\".75,\"tooltip\":\"Event: Sleep\\nDuration: 585 mins\"}","22":"","23":"","24":"","%series":"05/06/2020"},{"1":"{\"value:\".75,\"tooltip\":\"Event: Sleep\\nDuration: 45 mins\"}","2":"","3":"","4":"","5":"","6":"","7":"","8":"","9":"","10":"","11":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","12":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","13":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","14":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","15":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","16":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","17":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","18":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","19":"{\"value:\".75,\"tooltip\":\"Event: Sleep\\nDuration: 525 mins\"}","20":"","21":"","22":"","23":"","24":"","%series":"06/06/2020"},{"1":"","2":"","3":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 105 mins\"}","4":"{\"value:\".75,\"tooltip\":\"Event: Sleep\\nDuration: 105 mins\"}","5":"","6":"","7":"","8":"","9":"","10":"","11":"","12":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 570 mins\"}","13":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 570 mins\"}","14":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 570 mins\"}","15":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 570 mins\"}","16":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 570 mins\"}","17":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 570 mins\"}","18":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 570 mins\"}","19":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 570 mins\"}","20":"{\"value\":1,\"tooltip\":\"Event: Sleep\\nDuration: 570 mins\"}","21":"{\"value:\".5,\"tooltip\":\"Event: Sleep\\nDuration: 570 mins\"}","22":"","23":"","24":"","%series":"07/06/2020"}]}};
let HeatmapChartComponent = class HeatmapChartComponent extends base_chart_class_1.BaseChartClass {
    constructor() {
        super(...arguments);
        this.stops = [];
    }
    ngOnInit() {
        super.ngOnInit();
        this.widget.isBtnValues = true;
        let padding = 4;
        let minColor = 'rgba(0,0,255,0.51)';
        let maxColor = 'rgba(255,82,28,0.6)';
        let borderColor = '#FFFFFF';
        if (this.widget.properties) {
            const userConfData = this.widget.properties.Data;
            if (userConfData) {
                try {
                    const obj = JSON.parse(userConfData);
                    if (obj.padding !== undefined) {
                        padding = obj.padding;
                    }
                    if (obj.minColor !== undefined) {
                        minColor = obj.minColor;
                    }
                    if (obj.maxColor !== undefined) {
                        maxColor = obj.maxColor;
                    }
                    if (obj.borderColor !== undefined) {
                        borderColor = obj.borderColor;
                    }
                    if (obj.stops !== undefined) {
                        this.stops = obj.stops;
                    }
                }
                catch (e) {
                    console.warn('Invalid data for heatmap: ', userConfData);
                }
            }
        }
        // Highcharts.seriesTypes.heatmap.prototype.axisTypes =  ['xAxis', 'yAxis'],
        // Highcharts.seriesTypes.heatmap.prototype.optionalAxis =  null;
        const _this = this;
        const ex = {
            legend: {
                enabled: true
            },
            plotOptions: {
                heatmap: {
                    allowPointSelect: false,
                    borderWidth: padding,
                    borderColor,
                    dataLabels: {
                        format: '{point.value}',
                        enabled: this.widget.showValues,
                        color: '#FFF',
                        shadow: false,
                        style: {
                            textOutline: 'none',
                            fontWeight: 'normal'
                        }
                    }
                }
            },
            colorAxis: {
                minColor,
                maxColor,
                dataClasses: _this.stops.map(s => ({ from: s[0], to: s[0], color: s[1], name: s[2] || s[0] || 'No value' }))
            }
        };
        this.us.mergeRecursive(this.chartConfig, ex);
        // this.chartConfig.options.plotOptions.heatmap = {
        //     pointPadding: 51
        // };
        this.chartConfig.tooltip = {
            formatter() {
                const p = this.point;
                if (p.tooltipData) {
                    return p.tooltipData.replace(/(?:\r\n|\r|\n)/g, '<br>');
                }
                return _this.chartConfig.yAxis.categories[this.point.y] + '<br>' +
                    _this.chartConfig.xAxis.categories[this.point.x] + '<br>Value: <b>' +
                    (this.point.value || '0') + '</b>';
            }
        };
        // this.KPIInverted = true;
        //
        // this.parseData = parseMultivalueData;
        // this.requestData();
    }
    onHeaderButton(bt) {
        if (bt.name === 'showValues') {
            this.chartConfig.plotOptions.heatmap.dataLabels.enabled = bt.state;
            this.updateChart();
            return;
        }
        super.onHeaderButton(bt);
    }
    retrieveData(data) {
        let i;
        let currentAxis = 0;
        this.chartConfig.series = [];
        const xAxis = this.chartConfig.xAxis;
        xAxis.categories = [];
        for (i = 0; i < data.Cols[0].tuples.length; i++) {
            xAxis.categories.push((data.Cols[0].tuples[i].caption || '').toString());
        }
        this.chartConfig.series = [];
        const yAxis = this.chartConfig.yAxis;
        yAxis.categories = [];
        for (i = data.Cols[1].tuples.length - 1; i >= 0; i--) {
            yAxis.categories.push((data.Cols[1].tuples[i].caption || '').toString());
        }
        let k = 0;
        const tempData = [];
        for (let i = data.Cols[1].tuples.length - 1; i >= 0; i--) {
            for (let j = 0; j < data.Cols[0].tuples.length; j++) {
                /*let oIdx = data.Cols[0].tuples[j].originalIndex;
                if (oIdx === undefined) {
                    oIdx = j;
                }*/
                // var row = [];
                // row.push(j);
                // row.push(i);
                const v = this.getValue(data.Data[k]);
                // row.push(v.value);
                k++;
                // tempData.push(row);
                tempData.push({ x: j, y: i, value: v.value, tooltipData: v.tooltip });
                const stop = this.stops.find(s => s[0] === v.value);
                if (stop) {
                    tempData[tempData.length - 1].color = stop[1];
                }
            }
        }
        this.addSeries({
            data: tempData,
            name: 'Test'
        });
    }
    /**
     * Returns value. Checks if it json object or simple value
     */
    getValue(d) {
        if (typeof d === 'string') {
            // Check if it simple format
            if (d.indexOf('{') !== -1) {
                let v = 0;
                let tooltip = "";
                try {
                    const obj = JSON.parse(d);
                    v = obj.value;
                    tooltip = obj.tooltip;
                }
                catch (e) {
                }
                return { value: v, tooltip };
            }
        }
        return { value: d };
    }
};
HeatmapChartComponent.AddonInfo = {
    type: 'chart',
    chart: 'heatmap'
};
HeatmapChartComponent = __decorate([
    (0, core_1.Component)({
        selector: 'dsw-heatmap-chart',
        template: ''
    })
], HeatmapChartComponent);
exports.HeatmapChartComponent = HeatmapChartComponent;
