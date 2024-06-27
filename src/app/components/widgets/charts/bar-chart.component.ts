import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';

@Component({
  selector: 'dsw-bar-chart',
  template: '',
  standalone: true
})
export class BarChartComponent extends BaseChartClass implements OnInit {

  ngOnInit(): void {
    super.ngOnInit();
    this.widget.isBtnZero = true;
    this.widget.isBtnValues = true;

    if (this.widget.type.toLowerCase() === 'barchartstacked') {
      this.enableStacking();
    }
  }

}
