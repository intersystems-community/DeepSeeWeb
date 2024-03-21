import { Component, OnInit } from '@angular/core';
import {BaseChartClass} from './base-chart.class';

@Component({
    selector: 'dsw-area-chart',
    template: '',
    standalone: true
})
export class AreaChartComponent extends BaseChartClass implements OnInit {

  ngOnInit(): void {
      super.ngOnInit();
      this.widget.isBtnZero = true;
      this.widget.isBtnValues = true;

      const ex = {
          plotOptions: {
              series: {
                  colorByPoint: false
              },
              area: {
                  //stacking: 'percent',
                  stacking: 'normal',
                  marker: {
                      enabled: false
                  }
              }
          }
      };
      this.us.mergeRecursive(this.chartConfig, ex);
  }

}
