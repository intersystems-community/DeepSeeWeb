import {Component, OnInit} from '@angular/core';
import {BaseChartClass, DEF_ROW_COUNT} from './base-chart.class';
import * as numeral from 'numeral';
import {XAxisOptions, YAxisOptions} from 'highcharts';

@Component({
    selector: 'dsw-bubble-chart',
    template: ''
})
export class BubbleChartComponent extends BaseChartClass implements OnInit {
    private thirdTitle = '';

    ngOnInit(): void {
        super.ngOnInit();
        const _this = this;
        const ex = {
            plotOptions: {
                bubble:{
                    //minSize:30,
                    //maxSize:100,
                    minSize:'5%',
                    maxSize:'35%',
                    sizeBy: 'width'
                },

                series: {
                    cursor: null,
                    point: {
                        events: {
                            click: null
                        }
                    }
                }
            },
            chart: {
                zoomType: 'xy'
            },
            legend: {
                enabled: true
            },
            xAxis: {
                tickWidth: 10,
                title: {
                    enabled: true
                }
            },
            tooltip: {
                formatter: function () {
                    const fmt1 = this.series.userOptions.format1;
                    const fmt2 = this.series.userOptions.format2;
                    const fmt3 = this.series.userOptions.format3;
                    let v1 = this.x;
                    let v2 = this.y;
                    let v3 = this.point.z;
                    if (fmt1) { v1 = numeral(v1).format(fmt1); }
                    if (fmt2) { v2 = numeral(v2).format(fmt2); }
                    if (fmt3) { v3 = numeral(v3).format(fmt3); }
                    const thirdTitle = _this.thirdTitle || 'radius';
                    return this.series.name + '<br/>' +
                        (_this.chartConfig.xAxis as XAxisOptions).title.text + ':<b>' + v1 + '</b><br/>' +
                        (_this.chartConfig.yAxis as YAxisOptions).title.text + ':<b>' + v2 + '</b>' +
                        (v3 ? ('<br>' + thirdTitle + ': <b>' + v3.toString() + '</b>') : '');
                }
            }
        };
        this.us.mergeRecursive(this.chartConfig, ex);
    }

    getSeriesNames(data)
    {
        const ser = {};
        if(data.Cols[0].tuples.length == 4)
        {
            for (let i = 3; i < data.Data.length; i += 4)
            {
                ser[data.Data[i]] = true;
            }
        }

        return Object.keys(ser);
    }

    mapBySeries(data, uniqueSeries)
    {
        const seriesName_data = {};
        if (data.Cols[0].tuples.length == 4)
        {
            for (let key in uniqueSeries)
            {
                if (uniqueSeries.hasOwnProperty(key))
                {
                    seriesName_data[uniqueSeries[key]] = [];
                }
            }
        }
        else
        {
            let name = 'default';
            if (data.Cols[1] && data.Cols[1].tuples[0]) {
                name = data.Cols[1].tuples[0].caption;
            }
            seriesName_data[name] = [];
        }
        return seriesName_data;
    }

    parseData(data) {

        const uniqueSeries = this.getSeriesNames(data);

        this.clearSeries();

        if (data.Cols[0].tuples.length >= 1) {
            (this.chartConfig.xAxis as XAxisOptions).title.text = data.Cols[0].tuples[0].caption;
        }
        if (data.Cols[0].tuples.length >= 2) {
            (this.chartConfig.yAxis as YAxisOptions).title.text = data.Cols[0].tuples[1].caption;
        }
        if (data.Cols[0].tuples.length >= 3) {
            this.thirdTitle = data.Cols[0].tuples[2].caption;
        }
        const tempData = [];

        // if(data.Cols[0].tuples.length > 4)
        // {
        // 	_this.showError("Data converter for this bubble chart not implemented!");
        // }
        // else
        if (data.Cols[0].tuples[0].children) {
            // TODO: Lang support
            this.showError("Data converter for this bubble chart not implemented!");
        } else {
            const offset = data.Cols[0].tuples.length;
            let fmt1 = "";
            let fmt2 = "";
            let fmt3 = "";
            if (data.Cols[0].tuples[0]) { fmt1 = data.Cols[0].tuples[0].format; }
            if (data.Cols[0].tuples[1]) { fmt2 = data.Cols[0].tuples[1].format; }
            if (data.Cols[0].tuples[2]) { fmt3 = data.Cols[0].tuples[2].format; }


            const seriesName_data = {}; // mapBySeries(data, uniqueSeries);

            let isTop = false;
            let rowCount;
            // Limit top records
            if (this.hasOption('isTop')) {
                isTop = true;
                const controls = this.widget.controls || [];
                const cont = controls.filter(function (el) {
                    return el.action === "setRowCount";
                })[0];
                rowCount = cont ? (cont.value || DEF_ROW_COUNT) : DEF_ROW_COUNT;
                //data.Cols[1].tuples = data.Cols[1].tuples.slice(0, rowCount * 3);
            }

            let cnt = (isTop ? rowCount : data.Data.length);
            if (cnt > data.Data.length) {
                cnt = data.Data.length;
            }
            for (let i = 0; i < cnt; i+=offset)
            {
                const seriesName = data.Cols[1].tuples[Math.floor(i/offset)].caption;
                if (!seriesName_data[seriesName]) {
                    seriesName_data[seriesName] = [];
                }
                // let name = 'default';
                // if (data.Cols[1] && data.Cols[1].tuples[0]) {
                //     name = data.Cols[1].tuples[0].caption;
                // }
                // var seriesName = (data.Cols[0].tuples.length == 4)? data.Data[offset * i + 3]:name;
                // if (!seriesName_data[seriesName]) {
                //     seriesName_data[seriesName] = [];
                // }
                // if (data.Cols[0].tuples.length == 2)
                // {
                //     seriesName_data[seriesName].push([parseFloat(data.Data[offset * i]), parseFloat(data.Data[offset * i + 1]), 1]);
                // }
                // else
                // {
                const tmp = {
                    x: data.Data[i],
                    y: data.Data[i + 1],
                    z: data.Data[i + 2]
                };

                seriesName_data[seriesName].push(tmp);
                // }
            }

            for (let key in seriesName_data)
            {
                this.addSeries({
                    data: seriesName_data[key],
                    name: key,
                    format1: fmt1,
                    format2: fmt2,
                    format3: fmt3,
                });
            }
        }
        this.updateChart(true);
    }

}
