import { Component, OnInit } from '@angular/core';
import {BaseChartClass} from './base-chart.class';

@Component({
  selector: 'dsw-line-chart',
  template: ''
})
export class LineChartComponent extends BaseChartClass implements OnInit {

  ngOnInit() {
      super.ngOnInit();
      this.widget.isBtnZero = true;
      this.widget.isBtnValues = true;
      let ex = {};
      if (this.widget.type.toLowerCase() !== 'combochart') {
          ex = {
              plotOptions: {
                  series: {
                      lineWidth: 3,
                      marker: {
                          enabled: false
                      }
                  }
              },
          };
      }

      if (this.widget.type.toLowerCase() === 'linechartmarkers') {
          ex = {
              series: {
                  marker: {
                      enabled: true
                  }
              }
          };
      }
      this.us.mergeRecursive(this.chartConfig, ex);
  }
}
