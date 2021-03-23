import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {BaseWidget} from "../base-widget.class";
import {ChartComponent} from "ng-apexcharts";
import * as Highcharts from "highcharts/highstock";
import {YAxisOptions} from "highcharts";

export interface IApexChartOptions {
    chart: ApexChart;
    series: ApexAxisChartSeries | ApexNonAxisChartSeries;
    annotations?: ApexAnnotations;
    colors?: string[];
    dataLabels?: ApexDataLabels;
    stroke?: ApexStroke;
    labels?: string[];
    legend?: ApexLegend;
    fill?: ApexFill;
    tooltip?: ApexTooltip;
    plotOptions?: ApexPlotOptions;
    responsive?: ApexResponsive[];
    xaxis?: ApexXAxis;
    yaxis?: ApexYAxis | ApexYAxis[];
    grid?: ApexGrid;
    states?: ApexStates;
    title?: ApexTitleSubtitle;
    subtitle?: ApexTitleSubtitle;
    theme?: ApexTheme;
}

@Component({
    selector: 'dsw-apex-chart',
    template: `
        <apx-chart
            #achart
            [chart]="chartOptions.chart"
            [series]="chartOptions.series"
            [title]="chartOptions.title"
        >
        </apx-chart>
        `
        /**/
})
export class ApexChartComponent extends BaseWidget implements OnInit, AfterViewInit {
    widgetData = null;

    @ViewChild('achart') achart: ChartComponent;
    chartOptions: IApexChartOptions = {
        chart: {
            type: 'line',
            height: 400
        },
        series: [],
        /*xaxis: {
            categories: [1991,1992,1993,1994,1995,1996,1997, 1998,1999]
        },*/
        title: {
            text: ''
        }
    };

    // private achart: ChartComponent;

    ngOnInit(): void {
        super.ngOnInit();

        const typeDesc = this.wts.getDesc(this.widget.type);
        // this.chartOptions.chart.type = typeDesc?.chart || 'column';

        this.widget.isBtnZero = true;
        this.widget.isBtnValues = true;

        if (this.widget.type.toLowerCase() === 'barchartstacked') {
            // this.enableStacking();
        }
    }

    ngAfterViewInit() {
        this.createChart();
    }

    createChart() {
      /*  var options = {
            chart: {
                type: 'line'
            },
            series: [{
                name: 'sales',
                data: [30,40,35,50,49,60,70,91,125]
            }],
            xaxis: {
                categories: [1991,1992,1993,1994,1995,1996,1997,1998,1999]
            }
        };
        this.achart = new ApexCharts(this.el.nativeElement, options) as any;

        this.achart.render();*/
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

        // TODO: implement data limiting
        // this.limitData(d);

        if (d && d.Info) {
            this.dataInfo = d.Info;
        }

        // TODO: implement axis setup
        // this.setupAxisMinMax(data.Data);

        // TODO: implement categories
        /*this.chartConfig.series = [];
        (this.chartConfig.xAxis as Highcharts.XAxisOptions).categories = [];
        for (i = 0; i < data.Cols[1].tuples.length; i++) {
            (this.chartConfig.xAxis as Highcharts.XAxisOptions).categories.push(data.Cols[1].tuples[i].caption.toString());
        }*/


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
                            name: data.Cols[0].tuples[t].caption, // + '/' + data.Cols[0].tuples[t].children[c].caption,
                            format: data.Cols[0].tuples[t].children[c].format
                        });
                    } else {
                        this.addSeries({
                            data: tempData,
                            name: data.Cols[0].tuples[t].caption,
                            format: data.Cols[0].tuples[t].format
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
                    format
                });
            }
        }
        /*const series = this.chartConfig.series;
             for (let k = 0; k < series.length; k++) {
                 series[k].yAxis = series.length - 1 - k;
             }
         }*/
        // this.chart.update(this.chartConfig);
        //this.updateChart();
        //this.chart.redraw(true);
    }

    /**
     * Callback for chart data request
     * @param {object} result chart data
     */
    retrieveData(result) {
        let i;
        this.hideLoading();
        // Clean up previous data
        this.chartOptions.series = [];
       /* while (this.chart.series.length > 0) {
            this.chart.series[0].remove();
        }*/

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

            /*
            // TODO: implement this
            const min = this.getMinValue(result.Data);
            if (min > 0 && min <= 10) {
                (this.chartConfig.yAxis as YAxisOptions).min = -10;
            }*/

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

            if (this.widget.showZero) {
                // TODO: implement showinf zero
                // this.setYAxisMinToZero();
            }
            if (this.firstRun) {
                // Load series toggle from settings
                let widgetsSettings = this.ss.getWidgetsSettings(this.widget.dashboard);
                if (!this.us.isEmbedded()) {
                    // TODO: implement series toggle
                    /*if (widgetsSettings[this.widget.name] && widgetsSettings[this.widget.name].series) {
                        for (i = 0; i < this.chartConfig.series.length; i++) {
                            if (widgetsSettings[this.widget.name].series[i] === false) {
                                this.chartConfig.series[i].visible = false;
                            }
                        }
                    }*/
                } else {
                    // For shared widgets hide series via hiddenSeries query param
                    // TODO: implement series hidding
                    /*const hidden = this.route.snapshot.queryParamMap.get('hiddenSeries');
                    let ser = [];
                    if (hidden) {
                        ser = hidden.split(',');
                    }
                    ser.forEach(k => {
                        if (!this.chartConfig.series[k]) {
                            return;
                        }
                        this.chartConfig.series[k].visible = false;
                    });*/
                }
                widgetsSettings = null;

                this.firstRun = false;
                this.onResize();
            }
        }
    }

    addSeries(s: any) {
        this.chartOptions.series.push({
            name: s.name,
            data: s.data.map(el => el.y)
        } as any);
        (this.chartOptions.series as any) = [...this.chartOptions.series];
        // this.chartConfig.series = [...this.chartConfig.series];
    }

    /**
     * Callback for resize event
     */
    onResize() {
        super.onResize();
        if (this.achart) {
            this.achart.render();
        }
    }
}
