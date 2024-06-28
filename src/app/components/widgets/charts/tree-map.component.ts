import {Component, OnInit} from '@angular/core';
import {BaseChartClass} from './base-chart.class';

@Component({
  selector: 'dsw-tree-map',
  template: '',
  standalone: true
})
export class TreeMapComponent extends BaseChartClass implements OnInit {
  private isPercent = true;
  private totalSum = 0;
  private prevData = null;
  protected override baseSeriesType = 'treemap';

  ngOnInit() {
    super.ngOnInit();
    this.totalSum = 0;

    // Check for percentage
    if (this.widget.overrides && this.widget.overrides[0] && this.widget.overrides[0].showPercentage === 0) {
      this.isPercent = false;
    }

    // Load isLegend option if exists
    /*if (this.hasOption('isLegend')) {
        this.isPercent = this.widget.isLegend;
    }*/
    const _this = this;
    const ex = {
      levels: [
        {
          level: 1,
          layoutAlgorithm: 'sliceAndDice',
          dataLabels: {
            enabled: true,
            align: 'left',
            verticalAlign: 'top',
            style: {
              fontSize: '15px',
              fontWeight: 'bold'
            }
          }
        }
      ],
      legend: {
        enabled: this.widget.isLegend
      },
      plotOptions: {
        series: {
          animation: false,
          colorByPoint: true,
          legendType: 'point'
        },
        treemap: {
          // colorByPoint: true,
          dataLabels: {
            enabled: true,
            // useHTML: true,
            formatter(this: any) {
              // Define custom label formatter
              // if (_this.widget['btn.ShowPercents'] && _this.totalSum) {
              if (_this.totalSum) {
                let percent: number | string = (this.point.value / _this.totalSum * 100);
                percent = _this.formatNumber(percent, _this.getDataPropByDataValue(this.series?.userOptions?.dimension)?.format || '#.##');
                return `${this.point.caption}<br>${percent}%`;
              } else {
                // const v = _this.formatNumber(this.point.value, '');
                // return `${this.point.caption}<br>${v}`;
                return `${this.point.caption}`;
              }
            }
          }
        }
      },
      tooltip: {
        formatter(this: any) {
          const cap = this.series.userOptions.caption;
          const fmt = this.series.userOptions.format;
          let v = this.point.value;
          v = _this.formatNumber(v, fmt);
          /*if (fmt) {
              v = numeral(v).format(fmt);
          }*/
          return this.point.caption + '<br>' + cap + ': <b>' + v + '</b>';
        }
      }
    };

    this.us.mergeRecursive(this.chartConfig, ex);

    delete this.chartConfig.plotOptions?.series?.dataLabels;


    /*this.us.mergeRecursive(this.chartConfig, {
      series: [{
        type: 'treemap',
        layoutAlgorithm: 'stripes',
        alternateStartingDirection: true,
        borderRadius: 6,
        dataLabels: {
          style: {
            textOutline: 'none'
          }
        },
        levels: [{
          level: 1,
          layoutAlgorithm: 'sliceAndDice',
          dataLabels: {
            enabled: true,
            align: 'left',
            verticalAlign: 'top',
            style: {
              fontSize: '15px',
              fontWeight: 'bold'
            }
          }
        }],
        data: [{
          id: 'A',
          name: 'Nord-Norge',
          color: '#50FFB1'
        }, {
          id: 'B',
          name: 'Trøndelag',
          color: '#F5FBEF'
        }, {
          id: 'C',
          name: 'Vestlandet',
          color: '#A09FA8'
        }, {
          id: 'D',
          name: 'Østlandet',
          color: '#E7ECEF'
        }, {
          id: 'E',
          name: 'Sørlandet',
          color: '#A9B4C2'
        }, {
          name: 'Troms og Finnmark',
          parent: 'A',
          value: 70923
        }, {
          name: 'Nordland',
          parent: 'A',
          value: 35759
        }, {
          name: 'Trøndelag',
          parent: 'B',
          value: 39494
        }, {
          name: 'Møre og Romsdal',
          parent: 'C',
          value: 13840
        }, {
          name: 'Vestland',
          parent: 'C',
          value: 31969
        }, {
          name: 'Rogaland',
          parent: 'C',
          value: 8576
        }, {
          name: 'Viken',
          parent: 'D',
          value: 22768
        }, {
          name: 'Innlandet',
          parent: 'D',
          value: 49391
        },
          {
            name: 'Oslo',
            parent: 'D',
            value: 454
          },
          {
            name: 'Vestfold og Telemark',
            parent: 'D',
            value: 15925
          },
          {
            name: 'Agder',
            parent: 'E',
            value: 14981
          }]
      }],
      title: {
        text: 'Norwegian regions and counties by area',
        align: 'left'
      },
      subtitle: {
        text:
          'Source: <a href="https://snl.no/Norge" target="_blank">SNL</a>',
        align: 'left'
      },
      tooltip: {
        useHTML: true,
        pointFormat:
          'The area of <b>{point.name}</b> is <b>{point.value} km<sup>' +
          '2</sup></b>'
      }
    });*/
  }


  /*    onHeaderButton(bt: IButtonToggle) {
          if (bt.name === 'isLegend') {
              this.isPercent = bt.state;
              this.chart.redraw(false);
          } else {
              super.onHeaderButton(bt);
          }
      }*/

  async parseData(data) {
    this.prevData = data;

    if (data && data.Info) {
      this.dataInfo = data.Info;
    }

    // this.chartConfig.series = [];
    let tempData: any[] = [];
    if (!data.Cols[0].tuples.length) {
      return;
    }

    if (data.Cols[0].tuples[0].children) {
      console.error('Data converter for this treemap chart not implemented!');
    } else {
      // Make drilldown if there is only one item after filtering
      if (await this.checkForAutoDrill(data)) {
        return;
      }

      tempData = [];
      let total = 0;
      for (let i = 0; i < data.Data.length; i++) {
        total += parseFloat(data.Data[i]);
      }
      for (let i = 0; i < data.Cols[1].tuples.length; i++) {
        tempData.push({
          caption: data.Cols[1].tuples[i].caption,
          id: data.Cols[1].tuples[i].caption + '<br>' + parseFloat((parseFloat(data.Data[i] as any) / total * 100) as any).toFixed(2).toString() + '%',
          value: parseFloat(data.Data[i]),
          y: parseFloat(data.Data[i]),
          path: data.Cols[1].tuples[i].path,
          name: data.Cols[1].tuples[i].caption
        });
      }

      let cap = '';
      let fmt = '';
      if (data.Cols[0].tuples[0]) {
        cap = data.Cols[0].tuples[0].caption;
        fmt = data.Cols[0].tuples[0].format;
      }
      this.totalSum = data.Data.map(d => parseFloat(d) || 0).reduce((a, b) => a + b, 0);

      // const xAxis = this.chartConfig.xAxis as XAxisOptions;
      // xAxis.categories = ['fdsfds', 'fdsdfs'];

      this.addSeries({
        data: tempData,
        name: '',
        layoutAlgorithm: 'squarified',
        caption: cap,
        dimension: data.Cols[0].tuples[0].dimension,
        format: fmt,
        // layoutAlgorithm: 'strip',
        dataLabels: {
          enabled: true
        }
      }, undefined, undefined, true);
    }

    // TODO: temporary workaround. check after updating lib
    this.toggleLegend(this.widget.isLegend);
  }

  /*setType(type) {
      this.clearSeries();
      /!*this.chartConfig.chart.type = type;
      this.updateChart();*!/
      super.setType(type);

      this.parseData(this.prevData);
  }*/
}
