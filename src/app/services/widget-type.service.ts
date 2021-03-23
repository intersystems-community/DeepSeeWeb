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
import {FuelGaugeChartComponent} from '../components/widgets/charts/fuel-gauge-chart.component';
import {AreaChartComponent} from '../components/widgets/charts/area-chart.component';
import {BullseyeChartComponent} from '../components/widgets/charts/bullseye-chart.component';
import {PieChartComponent} from '../components/widgets/charts/pie-chart.component';
import {XyChartComponent} from '../components/widgets/charts/xy-chart.component';
import {TimeChartComponent} from '../components/widgets/charts/time-chart.component';
import {BarChartComponent} from '../components/widgets/charts/bar-chart.component';
import {ScorecardWidgetComponent} from '../components/widgets/scorecard/scorecard-widget';
import {StorageService} from "./storage.service";
import {ApexChartComponent} from "../components/widgets/apex-charts/apex-chart-base.component";

export const ADDON_PREFIX = 'DSW.Addons.';

export interface IWidgetType {
    class?: Type<unknown>;
    type: string;
    chart: string;
    allowShowAsPivot: boolean;
}

const TYPES = {
    regular: {
        class: ScorecardWidgetComponent,
        allowShowAsPivot: true
    },
    fuelgauge: {
        class: FuelGaugeChartComponent,
        type: 'chart',
        chart: 'gauge',
        allowShowAsPivot: true
    },
    bullseyechart: {
        class: BullseyeChartComponent,
        type: 'chart',
        chart: 'pie',
        allowShowAsPivot: true
    },
    speedometer: {
        class: SpeedometerChartComponent,
        type: 'chart',
        chart: 'gauge',
        allowShowAsPivot: true
    },
    bubblechart: {
        class: BubbleChartComponent,
        type: 'chart',
        chart: 'bubble',
        allowShowAsPivot: true
    },
    treemapchart: {
        class: TreeMapComponent,
        type: 'chart',
        chart: 'treemap',
        allowShowAsPivot: true
    },
    hilowchart: {
        class: HiLowChartComponent,
        type: 'chart',
        chart: 'boxplot',
        allowShowAsPivot: true
    },
    piechart3d: {
        class: PieChartComponent,
        type: 'chart',
        chart: 'pie',
        allowShowAsPivot: true
    },
    donutchart3d: {
        class: PieChartComponent,
        type: 'chart',
        chart: 'pie',
        allowShowAsPivot: true
    },
    donutchart: {
        class: PieChartComponent,
        type: 'chart',
        chart: 'pie',
        allowShowAsPivot: true
    },
    piechart: {
        class: PieChartComponent,
        type: 'chart',
        chart: 'pie',
        allowShowAsPivot: true
    },
    areachart: {
        class: AreaChartComponent,
        type: 'chart',
        chart: 'area',
        allowShowAsPivot: true
    },
    barchart: {
        class: BarChartComponent,
        apexClass: ApexChartComponent,
        type: 'chart',
        chart: 'bar',
        allowShowAsPivot: true
    },
    'isc.kkbanalitics.portlets.stacionarkkbportlet': {
        // class: BarChartPercent,
        type: 'chart',
        allowShowAsPivot: true
    },
    barchartstacked: {
        class: BarChartComponent,
        type: 'chart',
        chart: 'bar',
        allowShowAsPivot: true
    },
    linechart: {
        class: LineChartComponent,
        apexClass: ApexChartComponent,
        type: 'chart',
        chart: 'line',
        allowShowAsPivot: true
    },
    linechartmarkers: {
        class: LineChartComponent,
        apexClass: ApexChartComponent,
        type: 'chart',
        chart: 'line',
        allowShowAsPivot: true
    },
    combochart: {
        class: LineChartComponent,
        type: 'chart',
        chart: 'line',
        allowShowAsPivot: true
    },
    columnchart: {
        class: ColumnChartComponent,
        apexClass: ApexChartComponent,
        type: 'chart',
        chart: 'column',
        allowShowAsPivot: true
    },
    columnchartstacked: {
        class: ColumnChartComponent,
        type: 'chart',
        chart: 'column',
        allowShowAsPivot: true
    },
    xychart: {
        class: XyChartComponent,
        type: 'chart',
        chart: 'scatter',
        allowShowAsPivot: true
    },
    timechart: {
        class: TimeChartComponent,
        type: 'chart',
        allowShowAsPivot: true
    },
    pivot: {
        class: WPivotComponent,
        type: 'pivot'
    },
    'deepsee.lightpivottable': {
        class: WPivotComponent,
        type: 'pivot'
    },
    textmeter: {
        class: WTextComponent,
        type: 'text',
        allowShowAsPivot: true
    },
    map: {
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
    horizontalcontrols: {
        class: EmptyWidgetComponent,
        type: 'empty'
    },
    verticalcontrols: {
        class: EmptyWidgetComponent,
        type: 'empty'
    }
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

TYPES[dsw.const.emptyWidgetClass] = {
    class: EmptyWidgetComponent,
    type: 'empty'
};

@Injectable({
    providedIn: 'root'
})
export class WidgetTypeService {

    constructor(private ss: StorageService) {
    }

    initialize() {
        const addons = dsw.addons;
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
        TYPES[name] = {
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
    getClass(name: string): Type<unknown> {
        let key = name.toLowerCase();
        if (!TYPES[key]) {
            key = key.replace('dsw.addons.', '');
        }
        if (!TYPES[key]) {
            return;
        }

        if (TYPES[key].chart) {
            const settings = this.ss.getAppSettings();
            if (settings.isApexCharts && TYPES[key].apexClass) {
                return TYPES[key].apexClass;
            }
        }
        return TYPES[key].class;
    }

    /**
     * Get description for type
     * @param {string} name Type name
     * @returns {object} Type description
     */
    getDesc(name: string): any {
        let key = name.toLowerCase();
        if (!TYPES[key]) {
            key = key.replace('dsw.addons.', '');
        }
        return TYPES[key];
    }

    /**
     * Returns type group based on type name
     * @param {string} name Type name
     * @returns {string|undefined} Type group
     */
    getType(name: string): string {
        let key = name.toLowerCase();
        if (!TYPES[key]) {
            key = key.replace('dsw.addons.', '');
        }
        if (!TYPES[key]) {
            return '';
        }
        return TYPES[key].type;
    }
}
