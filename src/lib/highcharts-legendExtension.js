// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS



/**
 * Extension for Highcharts3 and Highstocks1.3 to add the Chart some functions:
 * legendHide() , legendShow() , legendToggle([forceState])
 */
(function (Highcharts, UNDEFINED)
{	"use strict";


	if ( ! Highcharts )
	{
		return;
	}


	var chartProto = Highcharts.Chart.prototype
	  , legendProto = Highcharts.Legend.prototype
	  ;


	Highcharts.extend(chartProto ,
	{

		/**
		 * set the visibility of the legend
		 *
		 * @param {Boolean} display Whether to show or hide the legend
		 */
		legendSetVisibility : function (display)
		{

			var chart = this
			  , legend = chart.legend , legendAllItems , legendAllItem , legendAllItemLength
			  , legendOptions = (chart.options ? chart.options.legend : {})
			  , scroller , extremes
			  ;

			if ( legendOptions.enabled == display )
			{
				return;
			}

			legendOptions.enabled = display;

			if ( ! display )
			{
				legendProto.destroy.call(legend);

				{  // fix for ex-rendered items - so they will be re-rendered if needed
					legendAllItems = legend.allItems;
					if ( legendAllItems )
					{
						for ( legendAllItem=0, legendAllItemLength=legendAllItems.length ; legendAllItem<legendAllItemLength ; ++legendAllItem )
						{
							legendAllItems[legendAllItem].legendItem = UNDEFINED;
						}
					}
				}

				{ // fix for chart.endResize-eventListener and legend.positionCheckboxes()
					legend.group = {};
				}
			}

			chartProto.render.call(chart);

			if ( ! legendOptions.floating )
			{
				scroller = chart.scroller;
				if ( scroller && scroller.render )
				{ // fix scrolller // @see renderScroller() in Highcharts
					extremes = chart.xAxis[0].getExtremes();
					scroller.render(extremes.min, extremes.max);
				}
			}
		} ,

		/**
		 * hide the legend
		 */
		legendHide : function ()
		{
			this.legendSetVisibility(false);
		} ,

		/**
		 * show the legend
		 */
		legendShow : function ()
		{
			this.legendSetVisibility(true);
		} ,

		/**
		 * toggle the visibility of the legend
		 *
		 * @param {Boolean} [display] optional: whether to show or hide the legend
		 */
		legendToggle : function (display)
		{
			if ( typeof display != "boolean" )
			{
				display = ( this.options.legend.enabled ^ true );
			}

			this.legendSetVisibility(display);
		}

	});

}(Highcharts));
