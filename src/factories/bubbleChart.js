/**
 * Bubble chart class factory
 */
(function() {
    'use strict';
    var DEF_ROW_COUNT = 20;
    function BuubleChartFact(BaseChart, Utils) {

        function BuubleChart($scope) {
            BaseChart.apply(this, [$scope]);
            var _this = this;
            this.thirdTitle = '';
            this.setType('bubble');
            this.parseData = bubbleDataConvertor;
            this.requestData();

            var ex = {
                plotOptions: {

                        bubble:{
                            // minSize:100,
                            //maxSize:200,
                            minSIze:'1%',
                            maxSize:'10%'
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
                    tickWidth: 10
                },
                tooltip: {
                    formatter: function () {
                        var fmt1 = this.series.userOptions.format1;
                        var fmt2 = this.series.userOptions.format2;
                        var fmt3 = this.series.userOptions.format3;
                        var v1 = this.x;
                        var v2 = this.y;
                        var v3 = this.point.z;
                        if (fmt1) v1 = numeral(v1).format(fmt1);
                        if (fmt2) v2 = numeral(v2).format(fmt2);
                        if (fmt3) v3 = numeral(v3).format(fmt3);
                        var thirdTitle = _this.thirdTitle || 'radius';
                        return this.series.name + '<br/>'+  $scope.chartConfig.xAxis.title.text + ':<b>' + v1 + '</b><br/>'+  $scope.chartConfig.yAxis.title.text + ':<b>' + v2 + '</b>' + (v3 ? ('<br>' + thirdTitle + ': <b>' + v3.toString() + '</b>') : '');
                    }
                }
            };
            Utils.merge($scope.chartConfig.options, ex);
			
			function getSeriesNames(data)
			{
				var ser = {};
				if(data.Cols[0].tuples.length == 4)
				{
					for (var i = 3; i < data.Data.length; i += 4)
					{
						ser[data.Data[i]] = true; 
					}
				}
				
				return Object.keys(ser);
			}
			
			function mapBySeries(data, uniqueSeries)
			{
				var seriesName_data = {};
					if (data.Cols[0].tuples.length == 4)
					{
						for (var key in uniqueSeries) 
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

            /**
             * Bubble chart data parser function. Creates series for bubble chart from data
             * @param {object} data Data
             */
            function bubbleDataConvertor(data) 
			{
				
				var uniqueSeries = getSeriesNames(data);			
				
                $scope.chartConfig.series = [];
                if (data.Cols[0].tuples.length >= 1) $scope.chartConfig.xAxis.title.text = data.Cols[0].tuples[0].caption;
                if (data.Cols[0].tuples.length >= 2) $scope.chartConfig.yAxis.title.text = data.Cols[0].tuples[1].caption;
                if (data.Cols[0].tuples.length >= 3) _this.thirdTitle = data.Cols[0].tuples[2].caption;
                var tempData = [];
				
				// if(data.Cols[0].tuples.length > 4)
				// {
				// 	_this.showError("Data converter for this bubble chart not implemented!");
				// }
				// else
                if (data.Cols[0].tuples[0].children) {
                    // TODO: Lang support
                    _this.showError("Data converter for this bubble chart not implemented!");
                } else {
					var offset = data.Cols[0].tuples.length;
                    var fmt1 = "";
                    var fmt2 = "";
                    var fmt3 = "";
                    if (data.Cols[0].tuples[0]) fmt1 = data.Cols[0].tuples[0].format;
                    if (data.Cols[0].tuples[1]) fmt2 = data.Cols[0].tuples[1].format;
                    if (data.Cols[0].tuples[2]) fmt3 = data.Cols[0].tuples[2].format;

					
					var seriesName_data = {}; // mapBySeries(data, uniqueSeries);

                    var isTop = false;
                    // Limit top records
                    if (_this.hasOption('isTop')) {
                        isTop = true;
                        var controls = _this.desc.controls || [];
                        var cont = controls.filter(function (el) {
                            return el.action === "setRowCount";
                        })[0];
                        var rowCount = cont ? (cont.value || DEF_ROW_COUNT) : DEF_ROW_COUNT;
                        //data.Cols[1].tuples = data.Cols[1].tuples.slice(0, rowCount * 3);
                    }

                    var cnt = (isTop ? rowCount : data.Data.length);
                    if (cnt > data.Data.length) {
                        cnt = data.Data.length;
                    }
                    for (var i = 0; i < cnt; i+=offset)
					{
                        var seriesName = data.Cols[1].tuples[Math.floor(i/offset)].caption;
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
							var tmp = {};
							tmp.x = data.Data[i];
							tmp.y = data.Data[i + 1];
							tmp.z = data.Data[i + 2];

							seriesName_data[seriesName].push(tmp);
						// }
                    }
					
					//console.log("seriesName_data ", seriesName_data);
					
					for (var key in seriesName_data) 
				    {	
						_this.addSeries({
                            				data: seriesName_data[key],
                            				name: key,
                            				format1: fmt1,
                           					format2: fmt2,
                           					format3: fmt3,
									   });
					}
                }
            }
        }
        return BuubleChart;
    }

    angular.module('widgets')
        .factory('BubbleChart', ['BaseChart', 'Utils', BuubleChartFact]);

})();
