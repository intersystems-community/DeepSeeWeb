import {Injectable, Type} from '@angular/core';
import {dsw} from '../../environments/dsw';
import {WTextComponent} from '../components/widgets/text/wtext.component';
import {WPivotComponent} from '../components/widgets/wpivot/pivot.component';
import {MapWidgetComponent} from '../components/widgets/map-widget/map-widget.component';
import {ColumnChartComponent} from '../components/widgets/charts/column-chart.component';
import {EmptyWidgetComponent} from '../components/widgets/empty-widget.component';
import {TreeMapComponent} from '../components/widgets/charts/tree-map.component';
import {HtmlViewerComponent} from '../components/widgets/html-viewer.component';
import {WorldMapComponent} from '../components/widgets/world-map.component';
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

export const ADDON_PREFIX = 'DSW.Addons.';

interface IWidgetType {
    class?: Type<unknown>;
    type: string;
}

const TYPES = {
    fuelgauge: {
        class: FuelGaugeChartComponent,
        type: 'chart',
        chart: 'gauge'
    },
    bullseyechart: {
        class: BullseyeChartComponent,
        type: 'chart',
        chart: 'pie'
    },
    speedometer: {
        class: SpeedometerChartComponent,
        type: 'chart',
        chart: 'gauge'
    },
    bubblechart: {
        class: BubbleChartComponent,
        type: 'chart',
        chart: 'bubble'
    },
    treemapchart: {
        class: TreeMapComponent,
        type: 'chart',
        chart: 'treemap'
    },
    hilowchart: {
        class: HiLowChartComponent,
        type: 'chart',
        chart: 'boxplot'
    },
    piechart3d: {
        class: PieChartComponent,
        type: 'chart',
        chart: 'pie'
    },
    donutchart3d: {
        class: PieChartComponent,
        type: 'chart',
        chart: 'pie'
    },
    donutchart: {
        class: PieChartComponent,
        type: 'chart',
        chart: 'pie'
    },
    piechart: {
        class: PieChartComponent,
        type: 'chart',
        chart: 'pie'
    },
    areachart: {
        class: AreaChartComponent,
        type: 'chart',
        chart: 'area'
    },
    barchart: {
        class: ColumnChartComponent,
        type: 'chart',
        chart: 'bar'
    },
    'isc.kkbanalitics.portlets.stacionarkkbportlet': {
        // class: BarChartPercent,
        type: 'chart'
    },
    barchartstacked: {
        class: ColumnChartComponent,
        type: 'chart',
        chart: 'bar'
    },
    linechart: {
        class: LineChartComponent,
        type: 'chart',
        chart: 'line'
    },
    linechartmarkers: {
        class: LineChartComponent,
        type: 'chart',
        chart: 'line'
    },
    combochart: {
        class: LineChartComponent,
        type: 'chart',
        chart: 'line'
    },
    columnchart: {
        class: ColumnChartComponent,
        type: 'chart',
        chart: 'column'
    },
    columnchartstacked: {
        class: ColumnChartComponent,
        type: 'chart',
        chart: 'column'
    },
    xychart: {
        class: XyChartComponent,
        type: 'chart',
        chart: 'scatter'
    },
    timechart: {
        class: TimeChartComponent,
        type: 'chart'
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
        type: 'text'
    },
    map: {
        class: MapWidgetComponent,
        type: 'map'
    },
    'deepsee.enhancedmapportlet': {
        class: MapWidgetComponent,
        type: 'map'
    },
    'rf.mapportlet': {
        class: MapWidgetComponent,
        type: 'map'
    },
    'dsw.addons.htmlviewer': {
        class: HtmlViewerComponent
    },
    'dsw.addons.dsw.worldmap': {
        class: WorldMapComponent
    },
    'dsw.addons.worldmap': {
        class: WorldMapComponent
    }

};

TYPES[dsw.const.emptyWidgetClass] = {
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
            addonInfo
        };
    }

    /**
     * Returns class based on type name
     * @param {string} name Type name
     * @returns {object|undefined} Class constructor function
     */
    getClass(name: string): Type<unknown> {
        if (!TYPES[name.toLowerCase()]) {
            return;
        }
        return TYPES[name.toLowerCase()].class;
    }

    /**
     * Get description for type
     * @param {string} name Type name
     * @returns {object} Type description
     */
    getDesc(name: string): any {
        return TYPES[name.toLowerCase()];
    }

    /**
     * Returns type group based on type name
     * @param {string} name Type name
     * @returns {string|undefined} Type group
     */
    getType(name: string): string {
        if (!TYPES[name.toLowerCase()]) {
            return '';
        }
        return TYPES[name.toLowerCase()].type;
    }
}
