import {BaseWidget, IWidgetOverride} from '../base-widget.class';
import {AfterViewInit, OnInit, Directive} from '@angular/core';
import {dsw} from '../../../../environments/dsw';
import * as numeral from 'numeral';
import {AxisTypeValue, YAxisOptions} from 'highcharts';
import {IButtonToggle} from '../../../services/widget.service';

// Highcharts
import * as  Highcharts from 'highcharts/highstock';
import More from 'highcharts/highcharts-more';

More(Highcharts);
import Tree from 'highcharts/modules/treemap';

Tree(Highcharts);
import Heatmap from 'highcharts/modules/heatmap';

Heatmap(Highcharts);
// Load the exporting module.
import Exporting from 'highcharts/modules/exporting';
import {Subscription} from 'rxjs';
// Initialize exporting module.
Exporting(Highcharts);
import HC_stock from 'highcharts/modules/stock';
import {ChartConfigComponent, IThemeColors} from '../../ui/chart-config/chart-config.component';
import {CURRENT_NAMESPACE} from '../../../services/namespace.service';

HC_stock(Highcharts);

export const DEF_ROW_COUNT = 20;
const DEF_COL_COUNT = 20;

@Directive()
export class BaseChartClass extends BaseWidget implements OnInit, AfterViewInit {

    widgetData = null;
    seriesTypes = [];
    protected _selectedPoint;
    chartConfig: Highcharts.Options;
    protected firstRun = true;

    private subPrint: Subscription;
    private subColorsConfig: Subscription;


    ngOnInit() {
        super.ngOnInit();

        this.widget.isChart = true;
        this.setupHeaderButtons();


        // Check for series types
        if (this.widget.overrides && this.widget.overrides[0] && this.widget.overrides[0].seriesTypes) {
            this.seriesTypes = this.widget.overrides[0].seriesTypes.split(',');
        }

        this.subPrint = this.bs.subscribe('print:' + this.widget.name, () => {
            if (this.chart) {
                const blob = new Blob(
                    [this.chart.getSVG()],
                    {type: 'image/svg+xml'}
                );
                const wnd = window.open(URL.createObjectURL(blob), '_blank');
                wnd.onload = () => {
                    const svg = wnd.document.querySelector('svg');
                    svg.setAttribute('width', '100%');
                    svg.setAttribute('height', '100%');
                    svg.style.height = 'auto';
                    wnd.print();
                };
                wnd.onafterprint = () => {
                    wnd.close();
                };
            }
        });
        this.setupChart();

        if (this.widget.inline) {
            this.setupInline();
        }

        this.subColorsConfig = this.bs.subscribe('charts:update-colors', (tc) => this.updateColors(tc));
    }

    ngAfterViewInit() {
        this.createChart();
        setTimeout(() => {
            this.chart.reflow();
        }, 100);
    }

    createChart() {
        this.chartConfig.chart.renderTo = this.el.nativeElement;
        if (this.widget.type.toLowerCase() === 'timechart') {
            this.chart = Highcharts.stockChart(this.chartConfig);
        } else {
            this.chart = Highcharts.chart(this.chartConfig);
        }
    }

    clearSeries() {
        if (!this.chart) {
            return;
        }
        while (this.chart.series.length > 0) {
            this.chart.series[0].remove(false);
        }
    }

    destroy() {
        if (this.subColorsConfig) {
            this.subColorsConfig.unsubscribe();
        }
        if (this.subPrint) {
            this.subPrint.unsubscribe();
        }
        super.destroy();
    }

    onHeaderButton(bt: IButtonToggle) {
        super.onHeaderButton(bt);
        switch (bt.name) {
            case 'isLegend':
                this.toggleLegend(bt.state);
                break;
            case 'showValues': {
                (this.chartConfig.plotOptions.series.dataLabels as Highcharts.PlotSeriesDataLabelsOptions).enabled = bt.state;
                this.updateChart();
                break;
            }
            case 'showZero':
                this.showZeroOnAxis();
                break;
            case 'isTop':
                this.limitSeriesAndData();
                break;
            case 'chartConfig':
                this.showChartConfig();
                break;
        }
    }

    /**
     * Updates chart. Using when configuration has been changed
     */
    updateChart(redraw = false, anim = false) {
        if (!this.chart) {
            return;
        }
        this.chart.update(this.chartConfig, redraw, false, anim);
    }

    // toggleValues() {
    //     this.toggleButton('showValues');
    // }

    /*toggleButton(name: string) {
        this.widget[name] = !this.widget[name];
        const widgetsSettings = this.ss.getWidgetsSettings(this.widget.dashboard);
        if (!widgetsSettings[this.widget.name]) {
            widgetsSettings[this.widget.name] = {};
        }
        widgetsSettings[this.widget.name][name] = this.widget[name];
        this.ss.setWidgetsSettings(widgetsSettings, this.widget.dashboard);
    }*/

    hasOption(name: string) {
        const widgetsSettings = this.ss.getWidgetsSettings(this.widget.dashboard);
        if (!widgetsSettings[this.widget.name]) {
            return false;
        }
        if (widgetsSettings[this.widget.name][name] === undefined || widgetsSettings[this.widget.name][name] === false) {
            return false;
        }
        return true;
    }

    private saveSeriesVisiblilityState(name: string, visible: boolean) {
        const widgetsSettings = this.ss.getWidgetsSettings(this.widget.dashboard);
        if (!widgetsSettings[this.widget.name]) {
            widgetsSettings[this.widget.name] = {};
        }
        const ws = widgetsSettings[this.widget.name];
        if (!ws.series) {
            ws.series = {};
        }
        ws.series[name] = visible;
        this.ss.setWidgetsSettings(widgetsSettings, this.widget.dashboard);
    }

    // toggleSeries(index, visiblility) {
    //     this.widget[name] = !this.widget[name];
    //     const widgetsSettings = this.ss.getWidgetsSettings(this.widget.dashboard);
    //     if (!widgetsSettings[this.widget.name]) {
    //         widgetsSettings[this.widget.name] = {};
    //     }
    //     if (!widgetsSettings[this.widget.name].series) {
    //         widgetsSettings[this.widget.name].series = {};
    //     }
    //     if (!visiblility) {
    //         widgetsSettings[this.widget.name].series[index] = false;
    //     } else {
    //         delete widgetsSettings[this.widget.name].series[index];
    //     }
    //     this.ss.setWidgetsSettings(widgetsSettings, this.widget.dashboard);
    // }

    setYAxisMinToZero() {
        if (this.chartConfig.yAxis instanceof Array) {
            for (let i = 0; i < this.chartConfig.yAxis.length; i++) {
                (this.chartConfig.yAxis[i] as any).prevMin = (this.chartConfig.yAxis[i] as YAxisOptions).min;
                (this.chartConfig.yAxis[i] as any).min = 0;
                // this.chartConfig.yAxis[i].min = 0;
            }
        } else {
            (this.chartConfig.yAxis as any).prevMin = (this.chartConfig.yAxis as any).min;
            (this.chartConfig.yAxis as any).min = 0;
            // this.chartConfig.yAxis.min = 0;
        }
        this.updateChart();
    }

    showZeroOnAxis() {
        if (this.widget.showZero) {
            this.setYAxisMinToZero();
        } else {
            if (this.chartConfig.yAxis instanceof Array) {
                for (let i = 0; i < this.chartConfig.yAxis.length; i++) {
                    (this.chartConfig.yAxis[i] as any).min = (this.chartConfig.yAxis[i] as any).prevMin;
                }
            } else {
                (this.chartConfig.yAxis as any).min = (this.chartConfig.yAxis as any).prevMin;
            }
        }
        this.updateChart();
    }

    limitSeriesAndData() {
        this.requestData();
    }

    // showValues() {
    // this.toggleButton('showValues');
    // }


    /**
     * Toggles chart legend and save state in storage
     */
    toggleLegend(state: boolean) {
        if (this.chart) {
            this.chart.legend.update({
                enabled: state
            });
        }
    }

    initFormatForSeries(d) {
        const getFormat = (d) => {
            if (!d || !d.Info) {
                return '';
            }
            let fmt = '';
            for (let i = 0; i < d.Info.numericGroupSize; i++) {
                fmt += '#';
            }
            fmt += ',#.##';
            return fmt;
        };
        const series = this.chartConfig.series;
        for (let i = 0; i < series.length; i++) {
            if ((!series[i] as any).format) {
                (series[i] as any).format = getFormat(d);
            }
        }
    }

    /**
     * Callback for chart data request
     * @param {object} result chart data
     */
    retrieveData(result) {
        let i;
        this.hideLoading();
        // Clean up previous data
        while (this.chart.series.length > 0) {
            this.chart.series[0].remove();
        }

        // Store current widget data
        this.widgetData = JSON.parse(JSON.stringify(result));

        if (result.Error) {
            this.showError(result.Error);
            return;
        }
        if (result) {
            /*
             this is fix for incorrect minimum value calculation in bar chart
             if minimum is 1, highcharts will set it and values are not visible
             we must set it to zero, to fix this issue
             */
            const min = this.getMinValue(result.Data);
            if (min > 0 && min <= 10) {
                (this.chartConfig.yAxis as YAxisOptions).min = -10;
            }

            if (!result.Cols) {
                return;
            }

            if (result.Cols[0].tuples.length === 0) {
                // cerate default count parameter
                if (result.Data.length !== 0) {
                    result.Cols[0].tuples.push({caption: this.i18n.get('count')});
                }
            }
            this.parseData(result);

            if (this.widget.type.toLowerCase() === 'combochart') {
                for (i = 0; i < this.chart.series.length; i++) {
                    if (this.chart.series[i].type) {
                        continue;
                    }
                    switch (i % 3) {
                        case 0:
                            this.chart.series[i].options.type = this.seriesTypes[i] || 'bar';
                            this.chart.series[i].options.zIndex = 2;
                            this.chart.series[i].options.color = Highcharts.getOptions().colors[1];
                            this.chart.series[i].update(this.seriesTypes[i] || 'bar', true);
                            break;
                        case 1:
                            this.chart.series[i].options.type = this.seriesTypes[i] || 'line';
                            this.chart.series[i].options.yAxis = 1;
                            this.chart.series[i].options.color = Highcharts.getOptions().colors[2];
                            this.chart.series[i].options.zIndex = 0;
                            this.chart.series[i].update(this.seriesTypes[i] || 'line', true);
                            break;
                        case 2:
                            this.chart.series[i].options.type = this.seriesTypes[i] || 'area';
                            this.chart.series[i].update(this.seriesTypes[i] || 'area', true);
                            break;
                    }
                    // TODO: fix combo chart
                    this.chartConfig.yAxis[i].title = {
                        text: this.chart.series[i].name
                    };
                }
                this.updateChart();
            }
            if (this.widget.showZero) {
                this.setYAxisMinToZero();
            }
            if (this.firstRun) {

                // Load series toggle from settings
                let widgetsSettings = this.ss.getWidgetsSettings(this.widget.dashboard);
                if (!this.us.isEmbedded()) {
                    if (widgetsSettings[this.widget.name] && widgetsSettings[this.widget.name].series) {
                        for (i = 0; i < this.chartConfig.series.length; i++) {
                            if (widgetsSettings[this.widget.name].series[i] === false) {
                                this.chartConfig.series[i].visible = false;
                            }
                        }
                    }
                } else {
                    // For shared widgets hide series via hiddenSeries query param
                    const hidden = this.route.snapshot.queryParamMap.get('hiddenSeries');
                    let ser = [];
                    if (hidden) {
                        ser = hidden.split(',');
                    }
                    ser.forEach(k => {
                        if (!this.chartConfig.series[k]) {
                            return;
                        }
                        this.chartConfig.series[k].visible = false;
                    });
                }
                widgetsSettings = null;

                this.firstRun = false;
                this.onResize();
            }
        }
    }

    /**
     * Builds axis titles for chart
     * @param {object} result MDX response from mdx2json
     */
    buildAxisTitles(result) {
        if (this.chartConfig.chart.type !== 'column') {
            return;
        }

        let isDimensionX = false;
        let isDimensionY = false;
        const mdx = this.getMDX();
        let idx = mdx.indexOf('ON');
        let idx2 = -1;
        if (idx !== -1) {
            idx2 = mdx.indexOf('FROM', idx);
            if (idx2 !== -1) {
                const part = mdx.substring(idx, idx2);
                isDimensionY = part.toLowerCase().lastIndexOf('.members') !== -1;
            }
        }
        if (idx2 !== -1) {
            idx = idx2;
            idx2 = mdx.indexOf('FROM', idx);
            const part = mdx.substring(idx, idx2);
            isDimensionX = part.toLowerCase().lastIndexOf('.members') !== -1;
        }

        if (this.chartConfig.yAxis && result.Cols[0] && result.Cols[0].tuples && result.Cols[0].tuples.length) {
            (this.chartConfig.yAxis as Highcharts.YAxisOptions).title = {text: result.Cols[0].tuples.map(t => t.caption || '').join(' & ')};
        }

        if (this.chartConfig.xAxis && result.Cols[1] && result.Cols[1].tuples && result.Cols[1].tuples.length) {
            (this.chartConfig.xAxis as Highcharts.XAxisOptions).title = {text: result.Cols[1].tuples.map(t => t.caption || '').join(' & ')};
        }
    }

    /**
     * Adds series to chart
     * @param {object} data Series data
     */
    addSeries(data) {
        if (data && data.data && data.data.length !== 0) {
            let isEmpty = true;
            let exists = false;
            for (let i = 0; i < data.data.length; i++) {
                const v = data.data[i];
                if (typeof v !== 'object') {
                    continue;
                }
                if (v instanceof Array) {
                    continue;
                }
                exists = true;
                if (v.y !== 0 && v.y !== '' && v.y !== null && v.y !== undefined) {
                    isEmpty = false;
                    break;
                }
            }
            if (isEmpty && exists) {
                data.showInLegend = false;
            }
        }
        const cols = this.tc.hcColors || Highcharts.getOptions().colors;
        data.color = cols[(this.chart.series.length % cols.length) || 0];

        // Check chart type
        const curIdx = this.chartConfig.series.length;
        if (this.seriesTypes && this.seriesTypes[curIdx]) {
            data.type = this.seriesTypes[curIdx];
        }

        data.visible = true;
        // Show or hide series depending on settings
        if (this.widgetsSettings && this.widgetsSettings[this.widget.name] && this.widgetsSettings[this.widget.name].series) {
            const sd = this.widgetsSettings[this.widget.name].series;
            if (sd[data.name] === false) {
                data.visible = false;
            }
        }
        this.chart.addSeries(data);
    }

    /**
     * Enables chart stacking
     */
    enableStacking() {
        // this.chartConfig.plotOptions.series.stacking = 'normal';
        const ex = {
            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            }
        };
        this.us.mergeRecursive(this.chartConfig, ex);
    }

    /**
     * Set chart type
     * @param {string} type Chart type
     */
    setType(type) {
        this.chartConfig.chart.type = type;
        this.updateChart();
    }

    /**
     * Fix data. Removes empty values
     * @param {Array} tempData Data
     */
    fixData(tempData) {
        for (let g = 0; g < tempData.length; g++) {
            if (!tempData[g].y && tempData[g].y !== 0) {
                tempData[g].y = null;
            }
            if (tempData[g].y === '' || tempData[g].y === undefined) {
                tempData[g].y = null;
            }
        }
    }

    /**
     * Returns minimum value of data array
     * @param {Array} data Data
     * @returns {Number} Minimum value
     */
    getMinValue(data) {
        let min = Infinity;
        for (let i = 0; i < data.length; i++) {
            if (data[i] < min) {
                min = data[i];
            }
        }
        return min;
    }

    limitData(d) {
        let i, j, c;
        const controls = this.widget.controls || [];
        const cont = controls.filter((el) => {
            return el.action === 'setRowCount';
        })[0];
        const rowCount = cont ? (cont.value || DEF_ROW_COUNT) : DEF_ROW_COUNT;
        // rowCount = 20;
        if (this.chartConfig.plotOptions.series.stacking === 'normal' || !this.chartConfig.plotOptions.series.stacking) {
            const cats = d.Cols[1].tuples;
            const ser = d.Cols[0].tuples;
            if (this.widget.isTop) {
                if (ser.length === 1) {
                    let found = true;
                    while (found) {
                        found = false;
                        let k;
                        for (k = 0; k < d.Data.length - 1; k++) {
                            if (d.Data[k] < d.Data[k + 1]) {
                                found = true;
                                let tmp = d.Data[k];
                                d.Data[k] = d.Data[k + 1];
                                d.Data[k + 1] = tmp;
                                tmp = d.Cols[1].tuples[k];
                                d.Cols[1].tuples[k] = d.Cols[1].tuples[k + 1];
                                d.Cols[1].tuples[k + 1] = tmp;
                            }
                        }
                    }
                    d.Cols[1].tuples.splice(rowCount, d.Cols[1].tuples.length - rowCount);
                } else {
                    // As discussed with Shvarov, only reduction of categories
                    // should be performed without sorting
                    // So now this code will look like this
                    d.Cols[1].tuples.splice(rowCount, d.Cols[1].tuples.length - rowCount);
                    return;

                    // var value = ser.length;
                    // var found = true;
                    // while (found) {
                    //     found = false;
                    //     var k;
                    //     var tmpData=[];
                    //     var counter = 0;
                    //
                    //     for(k=0;k<d.Data.length-1;k=k++){
                    //         var tmbObjOne =[];
                    //         for(var t = 0;t<value;t++){
                    //             tmbObjOne.push(d.Data[k]);
                    //             k++;
                    //         }
                    //
                    //         var count = 0;
                    //         for(t = 0; t < tmbObjOne.length; t++)
                    //         {
                    //             count = count + +tmbObjOne[t];
                    //         }
                    //         tmbObjOne.push(count);
                    //         tmbObjOne.push(d.Cols[1].tuples[counter]);
                    //         counter++;
                    //         tmpData.push(
                    //             tmbObjOne
                    //         );
                    //     }
                    //
                    //     for (k = 0; k < tmpData.length - 1; k++) {
                    //         if(tmpData[k][value]<tmpData[k+1][value]){
                    //             found = true;
                    //             var tmp1 = tmpData[k];
                    //             tmpData[k] =  tmpData[k + 1];
                    //             tmpData[k + 1] = tmp1;
                    //         }
                    //     }
                    //     counter = 0;
                    //     for(k = 0; counter < tmpData.length; k=k++){
                    //         for(t =0;t<value;t++){
                    //             d.Data[k] = tmpData[counter][t];
                    //             k++;
                    //         }
                    //         d.Cols[1].tuples[counter] = tmpData[counter][value+1];
                    //         counter++;
                    //     }
                    // }
                }
            }
        }
    }

    /**
     * Parse data and create chart series
     * @param {object} d Data
     */
    parseData(d) {
        const data = d;
        let i;
        const currentAxis = 0;
        // Add non exists axis as count
        if (!data.Cols[1]) {
            data.Cols[1] = {tuples: []};
        }
        if (data.Cols[1].tuples.length === 0) {
            data.Cols[1].tuples.push({caption: this.i18n.get('count')});
        }

        this.limitData(d);

        if (d && d.Info) {
            this.dataInfo = d.Info;
        }

        this.setupAxisMinMax(data.Data);

        this.chartConfig.series = [];
        (this.chartConfig.xAxis as Highcharts.XAxisOptions).categories = [];
        for (i = 0; i < data.Cols[1].tuples.length; i++) {
            (this.chartConfig.xAxis as Highcharts.XAxisOptions).categories.push(data.Cols[1].tuples[i].caption.toString());
        }
        const tempData = [];
        let hasChildren = false;
        const colCountControl = this.widget.controls.find(c => c.action.toLowerCase() === 'setcolumncount');
        if (data.Cols[0].tuples.length !== 0) {
            if (data.Cols[0].tuples[0].children && data.Cols[0].tuples[0].children.length !== 0) {
                hasChildren = true;
            }
        }
        if (hasChildren) {
            let k = 0;
            for (let t = 0; t < data.Cols[0].tuples.length; t++) {
                const len = data.Cols[0].tuples[t].children ? data.Cols[0].tuples[t].children.length : 1;
                for (let c = 0; c < len; c++) {
                    const tempData = [];
                    for (let g = 0; g < data.Cols[1].tuples.length; g++) {
                        tempData.push({
                            y: +data.Data[data.Cols[0].tuples.length * len * g + t * len + c],
                            cube: data.Info.cubeName,
                            drilldown: true,
                            path: data.Cols[1].tuples[g].path,
                            title: data.Cols[1].tuples[g].title
                        });
                        k++;
                    }
                    this.fixData(tempData);
                    if (data.Cols[0].tuples[t].children) {
                        this.addSeries({
                            data: tempData,
                            name: data.Cols[0].tuples[t].caption + '/' + data.Cols[0].tuples[t].children[c].caption,
                            format: data.Cols[0].tuples[t].children[c].format || this.getFormat(data)
                        });
                    } else {
                        this.addSeries({
                            data: tempData,
                            name: data.Cols[0].tuples[t].caption,
                            format: data.Cols[0].tuples[t].format || this.getFormat(data)
                        });
                    }
                }
            }
        } else {
            for (let j = 0; j < data.Cols[0].tuples.length; j++) {

                if (colCountControl) {
                    if (j >= colCountControl.value) {
                        continue;
                    }
                }

                const tempData = [];
                for (i = 0; i < data.Cols[1].tuples.length; i++) {
                    tempData.push({
                        y: +data.Data[i * data.Cols[0].tuples.length + j],
                        drilldown: true,
                        cube: data.Info.cubeName,
                        path: data.Cols[1].tuples[i].path,
                        name: data.Cols[1].tuples[i].caption,
                        title: data.Cols[1].tuples[i].title,
                    });
                }
                this.fixData(tempData);
                let name = this.i18n.get('count');
                let format = '';
                if (data.Cols[0].tuples[j]) {
                    name = data.Cols[0].tuples[j].caption;
                    format = data.Cols[0].tuples[j].format;
                }
                this.addSeries({
                    data: tempData,
                    name,
                    format: format || this.getFormat(data)
                });
            }
        }

        // Set axis for combo chart
        if (this.widget.type.toLowerCase() === 'combochart') {
            const series = this.chartConfig.series;
            for (let k = 0; k < series.length; k++) {
                series[k].yAxis = series.length - 1 - k;
            }
        }
        // this.chart.update(this.chartConfig);
        this.updateChart();
        this.chart.redraw(true);
    }

    getFormat(data) {
        if (!data.Info) {
            return '';
        }
        return;
    }

    /**
     * Callback for resize event
     */
    onResize() {
        super.onResize();
        if (this.chart) {
            this.chart.reflow();
        }
    }

    private setupChart() {
        const _this = this;
        const typeDesc = this.wts.getDesc(this.widget.type);

        function axisFormatter() {
            let v = this.value;
            const ov = _this.override;
            const fmt = ov?.valueLabelFormat;
            const t = _this.baseType;
            if (ov?.yAxisList[0]?.axisType === 'percent' ||
                (ov?.xAxis.axisType === 'percent' && (t === 'barChart' || t === 'barChartStacked'))) {
                v = _this.formatNumber(v, '#%');
            }
            return v;
        }

        this.chartConfig = {
            drilldown: {
                activeAxisLabelStyle: {
                    color: this.tc.hcTextColor
                },
                activeDataLabelStyle: {
                    color: this.tc.hcTextColor
                }
            },
            legend: {
                enabled: this.widget.isLegend,
                itemStyle: {
                    color: this.tc.hcTextColor
                }
            },
            navigation: {
                buttonOptions: {
                    align: 'center'
                }
            },
            chart: {
                type: typeDesc?.chart || 'column',
                backgroundColor: this.tc.hcBackground || 'transparent'
            },
            credits: {
                enabled: false
            },
            tooltip: {
                formatter() {
                    const ov = _this.override;
                    /* jshint ignore:start */
                    const t: any = this;
                    /* jshint ignore:end */
                    const fmt = ov?.valueLabelFormat || (t.series.options as any).format;
                    let val = t.y;
                    if (fmt) {
                        val = _this.formatNumber(val, fmt);
                    }
                    let a = (t.point.name || t.x || '') + '<br>' + (t.point.title ? (t.point.title + '<br>') : '') + t.series.name + ': <b>' + val + '</b><br>';
                    if (t.point.percentage) {
                        a += parseFloat(t.point.percentage).toFixed(2).toString() + '%';
                    }
                    return a;
                }
            },
            exporting: {
                enabled: false
            },
            plotOptions: {
                column: {
                    borderColor: this.tc.hcBorderColor || undefined
                },
                bar: {
                    borderColor: this.tc.hcBorderColor || undefined
                },
                pie: {
                    borderColor: this.tc.hcBorderColor || undefined
                },
                treemap: {
                    borderColor: this.tc.hcBorderColor || undefined
                },
                series: {
                    opacity: this.tc.hcOpacity,
                    cursor: 'pointer',
                    point: {
                        events: {
                            click(e: any) {
                                if (!e.point) {
                                    return;
                                }
                                if (dsw.mobile) {
                                    if (_this._selectedPoint !== e.point) {
                                        _this._selectedPoint = e.point;
                                        return;
                                    }
                                }
                                _this.showLoading();
                                _this.doDrill(e.point.path, e.point.name, e.point.category)
                                    .finally(() => {
                                        _this.hideLoading();
                                    });
                            }
                        }
                    },
                    dataLabels: {
                        color: this.tc.hcTextColor,
                        enabled: this.widget.showValues === true,
                        formatter() {
                            const ov = _this.override;
                            /* jshint ignore:start */
                            const t = this;
                            /* jshint ignore:end */
                            const fmt = ov?.valueLabelFormat || (t.series.options as any).format;
                            let val = t.y;

                            if (fmt) {
                                val = _this.formatNumber(val, fmt);
                            }
                            return val;
                        }

                    },
                    events: {
                        hide: (e: any) => this.saveSeriesVisiblilityState(e.target.name, e.target.visible),
                        show: (e: any) => this.saveSeriesVisiblilityState(e.target.name, e.target.visible)
                    }
                }
            },
            yAxis: {
                events: {},
                title: {
                    text: ''
                },
                labels: {
                    style: {
                        color: this.tc.hcTextColor,
                        textOverflow: 'none'
                    },
                    formatter: axisFormatter
                },
                minorGridLineColor: this.tc.hcLineColor,
                gridLineColor: this.tc.hcLineColor,
                lineColor: this.tc.hcLineColor,
                tickColor: this.tc.hcLineColor
            },
            xAxis: {
                events: {},
                title: {
                    text: ''
                },
                labels: {
                    // formatter: axisFormatter,
                    style: {
                        color: this.tc.hcTextColor,
                        textOverflow: 'none'
                    }
                },
                minorGridLineColor: this.tc.hcLineColor,
                gridLineColor: this.tc.hcLineColor,
                lineColor: this.tc.hcLineColor,
                tickColor: this.tc.hcLineColor
            },
            series: [],
            title: {
                text: ''
            }
        };
        this.showZeroOnAxis();
        // Set navigator style
        this.chartConfig.navigator = {
            outlineColor: this.tc.hcLineColor,
            xAxis: {
                gridLineColor: this.tc.hcLineColor
            },
            yAxis: {
                gridLineColor: this.tc.hcLineColor
            }
        };


        // Check for combo chart
        if (this.widget.type.toLowerCase() === 'combochart') {
            this.chartConfig.yAxis = [{
                events: {},
                gridLineColor: this.tc.hcLineColor,
                lineColor: this.tc.hcLineColor,
                tickColor: this.tc.hcLineColor,
                labels: {
                    style: {
                        color: this.tc.hcTextColor
                    }
                }
            }, {
                events: {},
                opposite: true,
                gridLineColor: this.tc.hcLineColor,
                lineColor: this.tc.hcLineColor,
                tickColor: this.tc.hcLineColor,
                labels: {
                    style: {
                        color: this.tc.hcTextColor
                    }
                }
            }];
            if (this.widget.overrides && this.widget.overrides[0] && this.widget.overrides[0]._type === 'comboChart') {
                const combo = this.widget.overrides[0];
                const l = combo.yAxisList;
                if (l && l.length) {
                    for (let k = 0; k < l.length; k++) {
                        if (l[k].title) {
                            if (!this.chartConfig.yAxis[k].title) {
                                this.chartConfig.yAxis[k].title = {};
                            }
                            this.chartConfig.yAxis[k].title.text = l[k].title;
                        }
                        (this.chartConfig.yAxis[k] as YAxisOptions).type = l[k].axisType as AxisTypeValue;
                        if (l[k].axisType === 'percent') {
                            this.chartConfig.yAxis[k].labels = {
                                formatter() {
                                    return this.value * 100 + '%';
                                }
                            };
                        }
                    }
                }

            }
        }
    }

    private setupHeaderButtons() {
        if (this.widget.isBtnZero === undefined) {
            this.widget.isBtnZero = false;
        }
        if (this.widget.isBtnValues === undefined) {
            this.widget.isBtnValues = false;
        }
        if (this.widget.isLegend === undefined) {
            this.widget.isLegend = true;
        }
    }

    private setupInline() {
        this.chartConfig.chart.backgroundColor = null;
        this.chartConfig.plotOptions = {
            series: {
                enableMouseTracking: false
            }
        };
        this.chartConfig.legend = {
            enabled: false
        };
        if (this.widget.tile) {
            const opt = {
                xAxis: {
                    events: {},
                    labels: {
                        style: {
                            color: window.getComputedStyle(document.querySelector('.' + dsw.const.fontColors[this.widget.tile.fontColor])).getPropertyValue('color')
                        }
                    }
                },
                yAxis: {
                    events: {},
                    labels: {
                        style: {
                            color: window.getComputedStyle(document.querySelector('.' + dsw.const.fontColors[this.widget.tile.fontColor])).getPropertyValue('color')
                        }
                    }
                }
            };
            this.us.mergeRecursive(this.chartConfig, opt);
        }
    }

    /**
     * Shows chart config on sidebar
     */
    private showChartConfig() {
        const name = this.widget.name;
        const widgetsSettings = this.ss.getWidgetsSettings(this.widget.dashboard) || {};
        const save = () => {
            this.ss.setWidgetsSettings(widgetsSettings, this.widget.dashboard);
            // $window.location.reload();
        };

        // Create settings if not exists
        if (!widgetsSettings[name]) {
            widgetsSettings[name] = {};
        }
        // Create theme if not exists
        if (!widgetsSettings[name].themeColors) {
            widgetsSettings[name].themeColors = {};
        }
        // ngDialog.open({template: 'src/views/settings.html', data: {isWidgetSettings: true,  });
        // }
        this.sbs.sidebarToggle.next({
            component: ChartConfigComponent,
            inputs: {
                widgetSettings: widgetsSettings[name],
                onSave: save,
                onUpdate: tc => this.updateColors(tc),
                chart: this.chart
            }
        });
    }

    /**
     * Updates chart colors via direct access to chart svg
     * Used when configuring chart colors
     * @param themeColors
     */
    updateColors(themeColors: IThemeColors) {
        this.zone.runOutsideAngular(() => {

            // Series fill color
            if (themeColors.hcColors) {
                for (let i = 0; i < this.chart.series.length; i++) {
                    const series = this.chart.series[i];
                    const color = themeColors.hcColors[i % themeColors.hcColors.length];

                    // For charts with lines
                    const el = series.graph?.element;
                    if (el) {
                        el.setAttribute('stroke', color);
                    }

                    series.data.forEach((d: any) => {
                        d.color = color;
                        const el = d.graphic?.element;
                        if (el) {
                            el.setAttribute('fill', color);
                            el.setAttribute('stroke', color);
                        }
                    });
                    const l = (this.chart.legend.allItems[i] as any);
                    if (l && l.legendSymbol) {
                        [l.legendSymbol.element, l.legendLine.element].forEach(el => {
                            if (el) {
                                el.setAttribute('fill', color);
                                el.setAttribute('stroke', color);
                            }
                        });
                    }

                    this.chart.series[i].options.color = color;
                    // this.chart.series[i].update(this.chart.series[i].options, false);
                }
            }

            // Series border color
            if (themeColors.hcBorderColor) {
                for (let i = 0; i < this.chart.series.length; i++) {
                    const series = this.chart.series[i];
                    series.data.forEach((d: any) => {
                        const el = d.graphic?.element;
                        if (el) {
                            el.setAttribute('stroke', themeColors.hcBorderColor);
                        }
                    });
                }
            }

            // Backgorund color
            if (themeColors.hcBackground) {
                const bg = (this.chart as any).chartBackground.element;
                bg.setAttribute('fill', themeColors.hcBackground);
                bg.setAttribute('stroke', themeColors.hcBackground);
                this.chart.options.chart.backgroundColor = themeColors.hcBackground;
            }

            // Axis line color
            if (themeColors.hcLineColor) {
                const col = themeColors.hcLineColor;
                this.chart.yAxis.forEach((a: any) => {
                    this.chart.yAxis[0].options.minorGridLineColor = col;
                    a.gridGroup.element.setAttribute('stroke', col);
                    a.gridGroup.element.childNodes.forEach(c => {
                        c.setAttribute('stroke', col);
                    });
                });
                this.chart.xAxis.forEach((a: any) => {
                    a.axisGroup.element.setAttribute('stroke', col);
                    a.axisGroup.element.childNodes.forEach(c => {
                        c.setAttribute('stroke', col);
                    });
                });
            }

            // Text color
            const col = themeColors.hcTextColor;
            if (col) {
                // Set axis labels color
                const processAxis = (a: any) => {
                    a.labelGroup.element.setAttribute('fill', col);
                    for (let i = 0; i < a.labelGroup.element.children.length; i++) {
                        const child = a.labelGroup.element.children[i];
                        child.setAttribute('fill', col);
                        child.setAttribute('color', col);
                        child.style.color = col;
                        child.style.fill = col;
                    }
                };
                this.chart.xAxis.forEach(processAxis);
                this.chart.yAxis.forEach(processAxis);
                // Set legend labels color
                this.chart.options.legend.itemStyle.color = col;
                this.chart.legend.allItems.forEach((l: any) => {
                    /* l.color = col; */
                    l.options.color = col;
                    l.legendItem.element.setAttribute('color', col);
                    l.legendItem.element.setAttribute('fill', col);
                    l.legendItem.element.style.fill = col;
                    l.legendItem.element.style.color = col;
                });
                // Set data labels color
                this.chart.series.forEach((s: any) => s.data.forEach(d => {
                    const st = d.dataLabel?.element?.children[0]?.style;
                    if (st) {
                        st.color = col;
                        st.fill = col;
                    }
                }));
            }
        });
    }

    /**
     * Setups min and max values for chart axis
     * Uses overrides or calculated from data
     * @param data
     */
    private setupAxisMinMax(data) {
        const ov = this.override;
        const yAxis = this.chartConfig.yAxis as Highcharts.YAxisOptions;
        const xAxis = this.chartConfig.xAxis as Highcharts.XAxisOptions;

        yAxis.min = 0;
        let axis = ov?.yAxisList[0];

        // Swap axis for bar charts
        if (this.baseType === 'barChart' || this.baseType === 'barChartStacked') {
            axis = ov?.xAxis;
        }

        if (axis?.minValue !== undefined) {
            yAxis.min = axis.minValue;
        }
/*
        else {
            yAxis.min = this.getMinValue(data);
        }
*/
        if (axis?.maxValue !== undefined) {
            yAxis.max = axis.maxValue;
        }
    }
}
