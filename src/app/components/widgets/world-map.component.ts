import {Component, OnInit} from '@angular/core';
import {BaseWidget} from './base-widget.class';
import * as  Highcharts from 'highcharts/highstock';
import More from 'highcharts/highcharts-more';
More(Highcharts);
import  Tree from 'highcharts/modules/treemap';
Tree(Highcharts);
import  Heatmap from 'highcharts/modules/heatmap';
Heatmap(Highcharts);
// Load the exporting module.
import Exporting from 'highcharts/modules/exporting';
import {BaseChartClass} from './charts/base-chart.class';
// Initialize exporting module.
Exporting(Highcharts);
import Map from 'highcharts/modules/map';
Map(Highcharts);
// @ts-ignore
import worldMap from "@highcharts/map-collection/custom/world.geo.json";

@Component({
    template: '',
})
export class WorldMapComponent extends BaseChartClass implements OnInit {
    ngOnInit() {
        super.ngOnInit();
        const _this = this;
        this.chartConfig = {
            chart: {
                type: 'map',
                map: worldMap
            },
            title: {
                text: null
            },
            xAxis: {
                visible: false
            },
            yAxis: {
                visible: false
            },
            plotOptions: {
                series: {
                    point: {
                        events: {
                            click: function () {
                                _this.mapDrill(this);
                            }
                        }
                    }
                }
            },

            mapNavigation: {
                enabled: true
            },

            colorAxis: {
                min: 0,
                stops: [
                    [0, '#EFEFFF'],
                    [0.5, Highcharts.getOptions().colors[0]],
                    [1, new Highcharts.Color(Highcharts.getOptions().colors[0]).brighten(-0.5).get() as string]
                ]
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                verticalAlign: 'bottom'
            },
            series:  []
        };
    }

    mapDrill(data) {
        if (!this.widget.properties || !this.widget.properties.Data) {
            return;
        }
        const path = this.widget.properties.Data.replace('$name', data.name);
        this.doDrillFilter(path, this.drills);
    }

    retrieveData(data: any) {
        // TODO: solve kpi fired twice
        this.hideLoading();
        const d = [];
        for (let i = 0; i < data.Data.length; i+=2) {
            d.push({key: data.Data[i], value: data.Data[i+1]});
        }
        this.clearSeries();

        this.chart.addSeries({
            data: d,
            joinBy: ['name', 'key'],
            name: 'Value',
            states: {
                hover: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            dataLabels: {
                enabled: false
            }
        } as any, true);
    }

}
