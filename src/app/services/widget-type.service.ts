import {Injectable, Type} from '@angular/core';
import {dsw} from '../../environments/dsw';
import {WTextComponent} from '../components/widgets/text/wtext.component';
import {WPivotComponent} from '../components/widgets/wpivot/pivot.component';
import {MapWidgetComponent} from '../components/widgets/map-widget/map-widget.component';
import {ColumnChartComponent} from '../components/widgets/charts/column-chart.component';
import {EmptyWidgetComponent} from '../components/widgets/empty-widget.component';
import {TreeMapComponent} from '../components/widgets/charts/tree-map.component';
import {BubbleChartComponent} from '../components/widgets/charts/bubble-chart.component';
import {LineChartComponent} from '../components/widgets/charts/line-chart.component';
import {HiLowChartComponent} from '../components/widgets/charts/hi-low-chart.component';
import {SpeedometerChartComponent} from '../components/widgets/charts/speedometer-chart.component';
import {AreaChartComponent} from '../components/widgets/charts/area-chart.component';
import {BullseyeChartComponent} from '../components/widgets/charts/bullseye-chart.component';
import {PieChartComponent} from '../components/widgets/charts/pie-chart.component';
import {XyChartComponent} from '../components/widgets/charts/xy-chart.component';
import {TimeChartComponent} from '../components/widgets/charts/time-chart.component';
import {BarChartComponent} from '../components/widgets/charts/bar-chart.component';
import {ScorecardWidgetComponent} from '../components/widgets/scorecard/scorecard-widget';
import {WSmileyComponent} from "../components/widgets/smiley/smiley.component";
import {WLightBarComponent} from "../components/widgets/light-bar/light-bar.component";
import {WTrafficLightComponent} from "../components/widgets/traffic-light/traffic-light.component";

export const ADDON_PREFIX = 'DSW.Addons.';

export interface IHeaderButton {
    id: string;
    text: string;
    icon: string;
    tooltip?: string;
    defValue?: boolean;
}

export interface IWidgetType {
    class?: Type<unknown>;
    type: string;
    chart: string;
    allowShowAsPivot: boolean;
    disableLegend?: boolean;
    headerButtons?: IHeaderButton[];
}

// TODO: add translation
const btnPieChart: IHeaderButton[] = [
    {
        id: 'btn.ShowAnnotations',
        text: 'Show annotations',
        tooltip: 'Show annotations',
        icon: 'assets/img/icons/text.svg',
        defValue: true
    },
    {
        id: 'btn.ShowPercents',
        text: 'Show percents',
        tooltip: 'Show percents',
        icon: 'assets/img/icons/percent.svg'
    }
];

export const WIDGET_TYPES: { [t: string]: any } = {
    regular: {
        label: 'Scorecard chart',
        class: ScorecardWidgetComponent,
        allowShowAsPivot: true
    },
    fuelGauge: {
        class: SpeedometerChartComponent,
        type: 'chart',
        chart: 'solidgauge',
        allowShowAsPivot: true
    },
    bullseyeChart: {
        label: 'Bullseye chart',
        class: BullseyeChartComponent,
        type: 'chart',
        chart: 'pie',
        headerButtons: btnPieChart,
        allowShowAsPivot: true
    },
    speedometer: {
        class: SpeedometerChartComponent,
        type: 'chart',
        chart: 'gauge',
        allowShowAsPivot: true,
        disableLegend: true,
    },
    bubbleChart: {
        label: 'Bubble chart',
        class: BubbleChartComponent,
        type: 'chart',
        chart: 'bubble',
        allowShowAsPivot: true
    },
    treeMapChart: {
        label: 'Tree map chart',
        class: TreeMapComponent,
        type: 'chart',
        chart: 'treemap',
        allowShowAsPivot: true
        /*headerButtons: [{
            id: 'btn.ShowPercents',
            text: 'Show percents',
            tooltip: 'Show percents',
            icon: 'assets/img/icons/percentage.svg'
        }]*/
    },
    hilowChart: {
        label: 'Hi-low chart',
        class: HiLowChartComponent,
        type: 'chart',
        chart: 'boxplot',
        allowShowAsPivot: true
    },
    pieChart3D: {
        label: 'Pie chart 3D',
        class: PieChartComponent,
        type: 'chart',
        chart: 'pie',
        headerButtons: btnPieChart,
        allowShowAsPivot: true
    },
    donutChart3D: {
        label: 'Donut chart 3D',
        class: PieChartComponent,
        type: 'chart',
        chart: 'pie',
        headerButtons: btnPieChart,
        allowShowAsPivot: true
    },
    donutChart: {
        label: 'Donut chart',
        class: PieChartComponent,
        type: 'chart',
        chart: 'pie',
        headerButtons: btnPieChart,
        allowShowAsPivot: true
    },
    pieChart: {
        label: 'Pie chart',
        class: PieChartComponent,
        type: 'chart',
        chart: 'pie',
        headerButtons: btnPieChart,
        allowShowAsPivot: true
    },
    areaChart: {
        label: 'Area chart',
        class: AreaChartComponent,
        type: 'chart',
        chart: 'area',
        allowShowAsPivot: true
    },
    barChart: {
        label: 'Bar chart',
        class: BarChartComponent,
        type: 'chart',
        chart: 'bar',
        allowShowAsPivot: true
    },
    'isc.kkbanalitics.portlets.stacionarkkbportlet': {
        // class: BarChartPercent,
        type: 'chart',
        allowShowAsPivot: true
    },
    barChartStacked: {
        label: 'Bar chart stacked',
        class: BarChartComponent,
        type: 'chart',
        chart: 'bar',
        allowShowAsPivot: true
    },
    lineChart: {
        label: 'Linear chart',
        class: LineChartComponent,
        type: 'chart',
        chart: 'line',
        allowShowAsPivot: true
    },
    lineChartMarkers: {
        label: 'Linear chart with markers',
        class: LineChartComponent,
        type: 'chart',
        chart: 'line',
        allowShowAsPivot: true
    },
    comboChart: {
        label: 'Combo chart',
        class: LineChartComponent,
        type: 'chart',
        chart: 'line',
        allowShowAsPivot: true
    },
    columnChart: {
        label: 'Column chart',
        class: ColumnChartComponent,
        type: 'chart',
        chart: 'column',
        allowShowAsPivot: true
    },
    columnChart3D: {
        label: 'Column chart 3D',
        class: ColumnChartComponent,
        type: 'chart',
        chart: 'column',
        allowShowAsPivot: true
    },
    columnChartStacked: {
        label: 'Column chart stacked',
        class: ColumnChartComponent,
        type: 'chart',
        chart: 'column',
        allowShowAsPivot: true
    },
    xyChart: {
        label: 'XY chart',
        class: XyChartComponent,
        type: 'chart',
        chart: 'scatter',
        allowShowAsPivot: true
    },
    timeChart: {
        label: 'Time chart',
        class: TimeChartComponent,
        type: 'chart',
        allowShowAsPivot: true
    },
    pivot: {
        label: 'Table',
        class: WPivotComponent,
        type: 'pivot'
    },
    'deepsee.lightpivottable': {
        class: WPivotComponent,
        type: 'pivot'
    },
    textMeter: {
        label: 'Text meter',
        class: WTextComponent,
        type: 'text',
        allowShowAsPivot: true
    },
    map: {
        label: 'World map',
        class: MapWidgetComponent,
        type: 'map',
        allowShowAsPivot: true
    },
    'deepsee.enhancedmapportlet': {
        class: MapWidgetComponent,
        type: 'map',
        allowShowAsPivot: true
    },
    'rf.mapportlet': {
        class: MapWidgetComponent,
        type: 'map',
        allowShowAsPivot: true
    },
    horizontalControls: {
        class: EmptyWidgetComponent,
        type: 'empty'
    },
    verticalControls: {
        class: EmptyWidgetComponent,
        type: 'empty'
    },
    smiley: {
        class: WSmileyComponent,
        allowShowAsPivot: false
    },
    lightBar: {
        class: WLightBarComponent,
        allowShowAsPivot: false
    },
    trafficLight: {
        class: WTrafficLightComponent,
        allowShowAsPivot: false
    },
    /*'dsw.addons.htmlviewer': {
        class: HtmlViewerComponent
    },*/
    /*'dsw.addons.dsw.worldmap': {
        class: WorldMapComponent,
        allowShowAsPivot: true
    },
    'dsw.addons.worldmap': {
        class: WorldMapComponent,
        allowShowAsPivot: true
    }*/
};

WIDGET_TYPES[dsw.const.emptyWidgetClass] = {
    class: EmptyWidgetComponent,
    type: 'empty'
};

@Injectable({
    providedIn: 'root'
})
export class WidgetTypeService {

    constructor() {
    }

    initialize() {
        const addons: string[] = dsw.addons;
        if (addons) {
            if (addons && addons.length) {
                for (let i = 0; i < addons.length; i++) {
                    let a = addons[i].split('/').pop();
                    a = ADDON_PREFIX + a;
                    try {
                        // TODO: load addon
                        // this.register(a.toLowerCase(),  $injector.get(a).type || 'custom', $injector.get(a), $injector.get(a));
                    } catch (ex) {
                        console.error(`Can't register addon: ${a}. Be aware that all names is case sensitive!`);
                    }
                }

            }
        } else {
            // Register custom types
            // TODO: broadcast
            // $rootScope.$on('addons:loaded', function(addons) {
            //     if (addons && addons.length) {
            //         for (var i = 0; i < addons.length; i++) {
            //             a = addons[i].split('/').pop();
            //             a = ADDON_PREFIX + a.split('.').slice(0, -1);
            //             try {
            //                 _this.register(a.toLowerCase(), $injector.get(a).type || 'custom', $injector.get(a), $injector.get(a));
            //             } catch (ex) {
            //                 console.error(`Can't register addon: ${a}. Be aware that all names is case sensitive!`);
            //             }
            //         }
            //     }
            //
            // });
        }
    }

    /**
     * Register new widget type
     * @param {string} name name in TypeMap
     * @param {string} type Widget type. "chart", "pivot", "map"
     * @param {string} cl Widget class
     * @param {object} [addonInfo] Addon information
     */
    register(name: string, type: string, cl: any, addonInfo: any) {
        WIDGET_TYPES[name] = {
            class: cl,
            type,
            ...addonInfo,
        };
    }

    /**
     * Returns class based on type name
     * @param {string} name Type name
     * @returns {object|undefined} Class constructor function
     */
    getClass(name: string): Type<any> | undefined {
        let key = name.toLowerCase();
        if (!WIDGET_TYPES[key]) {
            key = key.replace('dsw.addons.', '');
        }
        if (!WIDGET_TYPES[key]) {
            return;
        }
        return WIDGET_TYPES[key].class;
    }

    /**
     * Get description for type
     * @param {string} name Type name
     * @returns {object} Type description
     */
    getDesc(name: string): any {
        //let key = name.toLowerCase();
        let key = name;
        if (!WIDGET_TYPES[key]) {
            key = key.replace('dsw.addons.', '');
        }
        return WIDGET_TYPES[key];
    }

    /**
     * Returns type group based on type name
     * @param {string} name Type name
     * @returns {string|undefined} Type group
     */
    getType(name: string): string {
        let key = name;
        if (!WIDGET_TYPES[key]) {
            key = key.replace('dsw.addons.', '');
        }
        if (!WIDGET_TYPES[key]) {
            return '';
        }
        return WIDGET_TYPES[key].type;
    }
}
