import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';

@Component({
  selector: 'dsw-column-chart',
  template: '',
  standalone: true
})
export class ColumnChartComponent extends BaseChartClass implements OnInit {

  ngOnInit(): void {
    super.ngOnInit();
    this.widget.isBtnZero = true;
    this.widget.isBtnValues = true;

    if (this.widget.type.toLowerCase() === "columnchartstacked") {
      this.enableStacking();
    }
  }
}
