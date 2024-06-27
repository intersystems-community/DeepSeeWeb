import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';
import numeral from 'numeral';
import Highcharts from 'highcharts/highstock';

@Component({
  selector: 'dsw-hi-low-chart',
  template: '',
  standalone: true
})
export class HiLowChartComponent extends BaseChartClass implements OnInit {

  ngOnInit(): void {
    super.ngOnInit();

    const ex = {
      series: {
        fillColor: '#dddddF'
      },
      plotOptions: {
        boxplot: {
          fillColor: '#fafafF',
          whiskerLength: 0,
          colorByPoint: true,
          lineWidth: 3,
          stemWidth: 0
        }
      },
      tooltip: {
        formatter: function (this: any) {
          // TODO: Lang support
          const cap1 = this.series.userOptions.caption1 || 'Minimum';
          const cap2 = this.series.userOptions.caption2 || 'Maximum';
          const fmt1 = this.series.userOptions.format1;
          const fmt2 = this.series.userOptions.format2;

          let v1 = this.point.low;
          let v2 = this.point.high;

          if (fmt1) {
            v1 = numeral(v1).format(fmt1);
          }
          if (fmt2) {
            v2 = numeral(v2).format(fmt2);
          }

          return this.key + '<br/>' + cap2 + ':<b>' + v2 + '</b><br/>' + cap1 + ':<b>' + v1 + '</b>';
        }
      }
    };
    this.us.mergeRecursive(this.chartConfig, ex);
  }

  async parseData(data: any) {
    const xAxis = this.chartConfig.xAxis as Highcharts.XAxisOptions;
    xAxis.categories = [];
    for (let i = 0; i < data.Cols[1].tuples.length; i++) {
      xAxis.categories.push(data.Cols[1].tuples[i].caption.toString());
    }
    this.chartConfig.series = [];
    const tempData: any[] = [];

    if (data.Cols[0].tuples[0].children) {
      // TODO: lang support
      this.showError("Data converter for this hi-low chart not implemented!");
    } else {
      for (let i = 0; i < data.Cols[1].tuples.length; i++) {
        tempData.push({
          q1: data.Data[i * 2],
          q3: data.Data[i * 2 + 1],
          low: data.Data[i * 2],
          high: data.Data[i * 2 + 1],
          cube: data.Info.cubeName,
          path: data.Cols[1].tuples[i].path
        });
      }
      //this.fixData(tempData);

      let cap1 = '';
      let cap2 = '';
      let fmt1 = '';
      let fmt2 = '';
      if (data.Cols[0].tuples[0]) {
        cap1 = data.Cols[0].tuples[0].caption;
        fmt1 = data.Cols[0].tuples[0].format;
      }
      if (data.Cols[0].tuples[1]) {
        cap2 = data.Cols[0].tuples[1].caption;
        fmt2 = data.Cols[0].tuples[1].format;
      }

      this.addSeries({data: tempData, caption1: cap1, caption2: cap2, format1: fmt1, format2: fmt2});
    }
    this.updateChart(true);
  }
}
