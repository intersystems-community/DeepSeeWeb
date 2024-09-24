#### 4.0.12
* internal build with dev feature for oAuth

#### 4.0.11
* internal build with dev feature for oAuth

#### 4.0.10
* fixed issue with addons loading when DSW uses authentication (#331)

#### 4.0.9
* internal build with dev feature for oAuth

#### 4.0.8
* fixed issue with empty map for non-geojson maps

#### 4.0.7
* fixed issue with colors on map widget

#### 4.0.6
* changing `tile push` option now applied immediately without page refresh (#310)

#### 4.0.5
* added KPI drillthrough support for charts (analytics/#421)  
* fixed issue with sharing dashboard/widgets using base64 (analytics/#270)
* added option to disable tile pushing (analytics/#310)

#### 4.0.4
* added support for exclude filters in KPI widgets (#303)

#### 4.0.3
* fixed issue with missing back button after drilldown in pivot table
* fixed issue with back button after back from drillthrough
* fixed issue with missing gauges charts
* fixed issue with switch data source control and first element in list
* fixed issue with treemap labels (#436)
* added notes about data format for map addon widget 

#### 4.0.2 beta
* fixed issue with treemap

#### 4.0.1 beta
* migrated to Angular 18:
    * rewritten application to use lazy loading, as a result "main.js" size reduced from **3Mb** to **500Kb**
    * all javascript modules in dist package now take up 3Mb, instead of 5Mb(previous version)
    * templates now uses new control flow
    * removed deprecated ComponentFactoryResolver, now dynamic component created using NgComponentOutlet
    * added many interfaces and types to make type checks and reduce runtime errors
    * updated addon systems to work with new Angular
    * new builder is used
    * rewritten a lot of code
    * updated HighCharts to 11.4, now it have new look
* rewritten charts data parser to support crossjoins/hierarchical data on all axis
* fixed issue with a thousand separator and float numbers when there is no format specified
* fixed issue with combo chart when only one series type specified
* fixed issue when user tries to show legend for widget with one series(legend for widget with one series always hidden, check #346). now if user enable legend it always visible even if there is only one series
* changed method of widget type change. now complex charts can be viewed as another complex chart, eg. "stacked chart" > "multiple pie charts"
* fixed styles for error message
* added new color picker
* fixed issue with dashboard folder item text color change
* fixed issue with changing color of pie/treemap/timechart series, also fixed issues with changing color on legend items
* changed application font to "Oxygen"

#### 3.2.26
* fixed default filter value with "Not" issue 

#### 3.2.25
* fixed issue with slow data refresh on chart widgets

#### 3.2.24
* MDX with cross joins now correctly displayed in line/area/bar/column charts (#417)

#### 3.2.23
* fixed issue with hiding series by clicking legend item on donut chart (#413)
* fixed issue for bar chart drilldown for inline widgets (#411)

#### 3.2.22
* fixed treemap legend saving state (#409)
* fixed issue with hiding series by clicking legend item on pie chart (#410)
* fixed issue for bar chart drilldown for inline widgets (#411)

#### 3.2.21
* added `autodrill=1` parameter in url to make automatic drilldown if only one data item received

#### 3.2.20
* fixed issue with drilldown on pie chart(was not implemented). added drill down by label click for pie chart
* fixed issue for drilling from context menu

#### 3.2.19
* fixed percentage formatting for pie/donut/treemap charts. now no needed to name data property as `percentageFormat`, dsw will automatically find it depending on data value binding

#### 3.2.18
* fixed support of related filters, only works if enabled in application settings (#388)

#### 3.2.17
* added support for range filters with `NOW` keyword for all widgets (#403)

#### 3.2.16
* added `Accept-Language: en-US` to all requests (#404)

#### 3.2.15
* temporary fix for scorecard columns filtering when axis contains children

#### 3.2.14
* temporary fix for dataProperties filtering when axis contains children

#### 3.2.13
* temporary fix for dataProperties filtering when axis contains children

#### 3.2.12
* fixed issue with filter default values. when the value is a number instead of a string

#### 3.2.11
* fixed issue with filter default values. when the value is a number instead of a string

#### 3.2.10
* added display by 4/5/6 columns for filter widget (#400)
* added support for filter url parameter for date filters (#398)
* added support for "NOW"/"NOW-x" as date string for both calendar and filters (#398)

#### 3.2.9
* changed locale of date picker to "en"

#### 3.2.8
* added workaround for invalid filter base64 urls with `%3D` at the end

#### 3.2.7
* * added url parameter to prevent applying of default filters: `nofilters=12
* 
* added url parameter to prevent applying of default filters: `nofilters=1`
* added options to share menu: "Deny widget resizing", "Deny widget moving", "Ignore filters"
* added workaround for invalid filter urls with `.{=&` & `,=&[` characters
* fixed url generation for shared dashboard if navigated to an invalid dsw link
 
#### 3.2.6
* added workaround for invalid filter urls with `=&` characters
* added option to encode filters as base64 string when sharing dashboard
* fixed issue with the invisible share button when opening the dashboard with filters 

#### 3.2.5 
* added workaround for invalid filter urls with `&` character
* fixed issue with dashboard loading without filters 

#### 3.2.4
* added workaround for invalid filter urls with `&` character

#### 3.2.3
* added support for dragging and resizing restrictions for widgets by URL parameters: `nodrag=1` and `noresize=1` (#392)
* pivot top left cell now empty (#391)

#### 3.2.2
* fixed issues with filter URLs on the shared dashboard (interval filters/multiple filters)
* added support for wrong escaped dashboard links. when "=" character has been escaped, but it shouldn't

#### 3.2.1
* fixed issue with default multiple filter text

#### 3.2.0
* added support for default multiple filters on the widget

#### 3.1.99
* fixed issue with filters panel position and size when opening the dashboard for the first time

#### 3.1.98
* fixed issue with filters panel position and size when opening the dashboard for the first time

#### 3.1.97
* fixed navigation to ZEN (#381)

#### 3.1.96
* fixed issue with chats without `override` (blank widgets)

#### 3.1.95
* added support for labels order (`overrides.chartLegend.legendLabels`) for base charts (#383, #385)
* added marker option support for charts (#383)

#### 3.1.94
* fixed issue with `donutChart3D` type

#### 3.1.93
* fixed navigation to ZEN if dsw installed not in the root (#381)
* added widget deletion. button placed in the editor panel footer and on the widget header in editor mode (#121)
* fixed issue trying to edit/add another widget when editor already opened
* new widget size and position now generated and saved for Zen (#121)
* added validation and messages support for the editor (#121)
* added validation for widget name/datasource/reference (#121)
* dev internal:
    * widget types converted to camelCase
    * changed styles for non-default modal buttons

#### 3.1.92
* fixed issue with an invisible header after login
* fixed fullscreen widget position and styles. prevent resizing in fullscreen. fixed sidebar overlap
* now fullscreen mode can be activated by double-clicking on the widget header
* added new icons for widgets
* fixed issue with search on the dashboard, when searching from folder
* fixed issue with a dashboard loading spinner
* fixed styling issue with bottom padding on dashboards
* fixed issue with context menu on empty widget
* fixed "Copy MDX" and "Share" dialog styles
* changed the style of the main scrollbar on the dashboard screen
* fixed styles for dashboard editor, new components used
* fixed styles for app settings
* fixed styles for theme settings
* fixed issue when pressing menu during editing folders screen
* fixed issue with widget resizing when there is an error displayed on widget (unable to resize)
* designer mode (#121):
    * added "Edit widget" context menu item
    * added widget saving
    * added restoring of dashboard and widget state after canceling editing
    * added message if the user has unsaved changes during widget creation/editing
    * added MDX generation for the edited widget
    * added ability to change the data source for the edited widget
    * added the ability to link widget to another
    * added ability to change the widget type
    * widget leaves fullscreen mode, if the "edit widget" menu item has been chosen from the context menu
    * header buttons are now hidden for the edited widget
    * context menu is now hidden for the edited widget
    * fixed Safari styling of input with the select button
* dev internal:
    * improved performance of widget rendering
    * optimized widget resizing
    * added `type=numeric` support for "dsw-input" component
    * optimized widget position and size saving
    * added minimum height support for modal dialogs, refactored modal size styles
    * widget list now is not using async pipe for rendering
    * refactored dashboard screen class
    * sidebar now can create components with single instance(used by widget editor)
  
#### 3.1.91
* fixed issue with invisible app header

#### 3.1.90
* fixes for mdx2json path

#### 3.1.89
* mdx2json endpoint now relative to dsw installation path (#379)
* fixed default color for Highcharts lines (#380)
* dev internal:
    * added search component
    * changed modal styles, refactored modals
    * changed styles for sidebar, refactored sidebar service
    * added support for navigation on sidebar keeping previous instances of component alive, this is used in the designer to be able to go back
* designer mode (#121):
    * added tabs, dropdown, input with picker, file selection components to use in designer
    * added designer panel and base sections
    * added data source selection and widget type list for designer
  
#### 3.1.88
* fixed back button issue after KPI drillthrough (#291)
* for KPI drillthrough data properties filtering now disabled (#291)
* added drillthrough action to text meters (#368)
* fixed datepicker issue with horolog and timezones (#338)
* added filter state display for widgets (#369)

#### 3.1.87
* fixed horizontal scroll in pivot tables (#366)
* fixed state of exclude filters (#367)
* fixed series reset after filtering (#140)

#### 3.1.86
* fixed issue with pivot table style (#311)
* changed date format for MDX requests for horolog (#338)
* fixed refresh issue for pivot table (#188)
* added "Open analyzer" context menu item for the widget (#364)
* now filter popup opens above filter field if there is not enough free space below field (#362)

#### 3.1.85
* added check for date picker filter by `targetPropertyDataType` equals to `%DeepSee.Time.DayMonthYear`

#### 3.1.84
* fixed issue with date picker and single date selection 

#### 3.1.83
* fixed issue with pivot table style (#311)
* changed date format for MDX requests for horolog (#338)
* fixed refresh issue for pivot table (#188)

#### 3.1.82
* added new design for pivot tables (#311)
* fixed issue with `embed=1` (#361)
* added support for `setFilter`, `setRowSpec` actions (#281)
* added `sourceURL` generation for addon files loaded at runtime for better access using dev tools
* fixed issue with highcharts map rendering charts
* fixed click filter for world map (#183)

#### 3.1.81
* fixed issue with click filter resetting 
 
#### 3.1.80
* added date picker support for filters with `%ZEN.Component.calendar` class (#338)
* added click filter for multiple widgets target defined as a comma-separated string
 
#### 3.1.79
* added drill filter support for pivot (#16)
* fixed hiding data labels on pie charts (#318)

#### 3.1.78
* fixes for images for DSW installed not in the root of the site
 
#### 3.1.77
* added support for new widget types: `smiley`, `light bar`, `traffic light`. fixed `gauge` widget (#1316)
* fixed issue with `combo chart` and overrides for series type (#357) 

#### 3.1.76
* fixed scorecard `sum%` issue if data has empty values
 
#### 3.1.75
* added support for scorecard columns without `display` property

#### 3.1.74
* added series filtering depending on data properties for KPI widgets (#354)
* removed ability to make drilldown for KPI widgets
* added support for future feature - listing for KPI. feature not present in this release, because have to be implemented on mdx2json side (#291)
 
#### 3.1.73
* fixed issue with saved filters when it is number
 
#### 3.1.72
* fixed issue with saved filters when it is number

#### 3.1.71
* fixed issue with invalid data on widgets with data properties (#358)
* scorecard widget now shows empty values as empty instead of '0.00' (#359)

#### 3.1.70
* **Warning! Now if `data properties` is present, only defined properties will be displayed for ALL widgets!** (#354) 
* added `sum%` support for scorecard (#350)
* changed format priority for text meters, low to high: `widget > data > data properties` (#352)
* added `target%` support for scorecard (#353)
* added support for non-numeric `rangeLower/rangeUpper`. when linked to a column by text name 
* now format from `overrides` always overwrites `dataProperties` format

#### 3.1.69
* fixed issue with multiple pie charts when only one axis was present in an MDX result
* legend is hidden for charts with one series (#346)

#### 3.1.68
* fixed issue with `rowcount` if MDX already contains HEAD
* fixed broken navigation after a page refresh
* fixed navigating to Iris BI issue
* fixed issue with a legend for speedometer, when visibility option has been saved on the client side
* now filters panel always fits to max height of the dashboard if no user settings for it
* now widgets perfectly fit to the screen, but if the widget is small - the widget becomes larger and the dashboard becomes scrollable. this solves the issue when there are many widgets on the dashboard
* added support of format that comes from widget info for text meters
* fixed issue with fitting widgets into the screen after the redesign
* fixed fullscreen widget bottom margin

#### 3.1.67
* fixed issue with KPI filters and `number` value in filter received from mdx2json

#### 3.1.66
* added support for ".term" for ChooseRowSpec, ChooseDataSource, ChooseColSpec
* legend for speedometer now hidden
* filter popup window now has limit to height, never can overflow window height

#### 3.1.65
* text widgets now show only customized meters, or all if no custom has been set
* fixed issue with drillthrough and "%MDX()"
* fixed issue with incorrect url after logging out and logging in
* added an implementation of pivot variables as filters
* changed design for "share widget"/"copy mdx" modal dialogs
* added a new share dashboard dropdown to the header
* added missing icons from the new design on the widget header
* changed the design of the login form
* fixed doubled series error for pie char when switching labels
* fixed console errors, pie charts without labels
* fixed issue when loading saved filters when mdx2json returns numbers instead of string
* migrated to Angular 15.1 & Highcharts 10.3.3
 
#### 3.1.64
* fixed issue when loading dashboard with saved filters in old format

#### 3.1.63
* fixed issue with filters on dashboard & datasource (no filter values for KPI widgets)
* added support for KPI filters. now widgets with kpitype uses `/KPI` filters feature to process filtering
* fixed issue with drillthrough with filters
* added loading indicator when pivot executes KPI requests
* added KPI support for non-pivot widgets
* now saved filters are always displayed in the filter dropdown, even if no user action for a filter request has been made
* fixed issue with app option "save filters" (doesn't work in some cases)
* fixed issue with saving filters that returned as numbers from mdx2json 

#### 3.1.62
* partially fixed filter saving for filters outside filter list 

#### 3.1.61
* added dropdown menu for breadcrumbs if path is long

#### 3.1.60
* extended scorecard widget. now it supports `targetValue` & `target%`, uses auto max value for `plotBox` axis

#### 3.1.59
* fixed `.termlist' issue 

#### 3.1.58
* compatibility termlist support for ChooseRowSpec, ChooseDataSource, ChooseColSpec

#### 3.1.57
* extended drag region for widget, now it covers full size of header
* updated icons for widget header actions
* added new design for menu & header
* added new design for folders screen
* added drillthrough by category for chart widgets

#### 3.1.56
* fixed meters widget 

#### 3.1.55
* added missing images from new design 

#### 3.1.54
* new design for default theme (other themes will be supported soon)
* fixed filter issue when deselecting selected value
* fixed filter popup closing issue when selecting search text
* fixed issue when clearing filter by "X" icon
* added support for several charts
* fixed issue when opening filter popup near edge of the screen
* fixed issue with navigating to ZEN when there are special characters in url
* added support for valuelist/displaylist properties for choose controls

#### 3.1.53
* fixed drilldown issue when drilling second time

#### 3.1.52
* **Warning! Beta version** of new drilldown/drillthrough implementation. Changed behavior for drilldown/drillthrough/clickfilter:
    * Clicking on the axis label will perform drilldown action
    * Clicking on the chart bar will perform a click filter action and if it is not available, then drillthrough action if possible
    * Context menu for chart bar now contains drilldown & drillthrough menu items
* fixed issue with default rowcount values
* 
#### 3.1.51
* fixed KPI scorecard widget
* fixed issue with switching on pivot table for scorecard widgets
* added support for incorrecrt mdx2json data for scorecard (returning number instead of string)
* changed `overrides` processing to JSON object after mdx2json fixes (removed unsafe eval)

#### 3.1.50
* fixed multiple filter issues

#### 3.1.49
* added rowCount control support
* fixed choose row spec control width issue when response is slow
* fixed issues with choose row spec
* fixed issue when auto-drill causes empty widget title

#### 3.1.48
* fixed multiple filter issues

#### 3.1.47
* fixed issue with negative values in linear chart
* added support for color formatting for text meters 
* added ChooseRowSpec filter support
* fixed LPT to work with empty rows response from mdx2json
* added support of show listing control for pivot tables
* updated highcharts to v10.3.1

#### 3.1.46
* added support for different chart types for combo chart with new mdx2json
* added pivot-view support for widgets
* added support for radio buttons in filters
* added support for ColumnChart3D and PieChart3D
* added support for navigate button

#### 3.1.45
* fixed issue with pie chart and "children" in "tuples" response from mdx2json 

#### 3.1.44
* fixed issue with reset click filter button on charts

#### 3.1.43
* prevent drill on chart widgets if widget have click filter

#### 3.1.42
* fixed issue with multiple click filter

#### 3.1.41
* updated mdx2json dependency version

#### 3.1.40
* added ability to override default widgets with custom addons, using `overrideBaseType` parameter defined in `AddonInfo` static variable
eg.:
```typescript
// Ecample for overriding default "Bar Chart" widget with custom addon
static AddonInfo: IAddonInfo = {
    version: 1,     
    type: 'custom',
    overrideBaseType: 'barchart'
};
```

#### 3.1.39
* added Embed mode support for the dashboard (#234)
* added `maxZoom` data property to specify maximum zoom level for map widget (#235) 

#### 3.1.38
* fixed issue with treemap tooltip values formatter (#228)

#### 3.1.37
* fixed issue with alpha value in color formula for map. now color formula supports hsla, rgba, etc.
* fixed issue with polygon name in popup
* added `tooltipStyles` data property. specify JSON with css properties to apply on a tooltip. e.g. `{ "padding": "10px", "font-size": "20px" }`
* added `popupStyles` data property. specify JSON with css properties to apply on a popup. e.g. `{ "padding": "10px", "font-size": "20px" }`

#### 3.1.36
* fixed issue with click filter and autodrill
* fixed issue with auto drillthrough (empty widgets)
* fixed issue with iframe communication with shared widgets. `index` now contains widget name, if widget shared by name
* fixed issue with `polygonTitleProperty`, now it displays correctly on polygons
* added formatting for `polygonTitleProperty` if value is number

#### 3.1.35
* added legend for tree map widget
* fixed issue with `decimalSeparator`, `numericGroupSeparator`, `numericGroupSize` options for widgets (#228)
* added `dataLabels` data property for map widget (#231). now values can be displayed directly on map.
set `dataLabels=1` to show values. `dataLabels` can be set to JSON with options to customize labels,
default values is `{ "size": 12, "font": "Calibri,Arial,sans-serif", "color": "#000", "stroke": "#FFF", "strokeWidth": 2 }`.
options can be defined in any combinations, e.g. `{ "color": "#F00", "size": 18 }`
* now shared widgets use name instead of index, e.g. `http://test.com/#/MAP/map/Map.dashboard?widget=UAMap.geojson` (#230)
* added `percentageFormat` data property, to set format of percents for widgets that show percentage values, e.g. `#.##` (#229)
* added `fixMinZoom` and `fixMaxZoom` data properties for map widget. To fix zoom out set `fixMinZoom=1`

#### 3.1.34
* added `tileUrl` data property for map widget to specify custom tiles, e.g. `https://tile-c.openstreetmap.fr/hot/{z}/{x}/{y}.png`

#### 3.1.33
* added url parameter for shared widgets `disableContextMenu`, when set to "1" disables context menu on shared widget

#### 3.1.32
* added data property `disableContextMenu`, when set to "1" disables context menu on widget

#### 3.1.31
* map widget settings changed from widget properties to data properties(because new mdx2json)
* `colorFormula` now taken from data properties and can define formula in a css way to calculate color of polygon:
  * default is `hsl((255-x)/255 * 120, 100%, 50%)`
  * rgb color also can be used, because it is valid in css: `rgb(0, x, 0)`
  * `x` - relative data value from 0(minimum value) to 255(maximum value)
  * e.g. for blue range of colors(on HUE it is 193-235), formula will be: `hsl(193 + x/255 * (235 - 193), 100%, 50%)`   

#### 3.1.30
* added support for value formatting for `popupProperty` 

#### 3.1.29
* added support for value formatting for `tooltipProperty` (#222)
* for map widget added ability to apply styles from parent window using `postMessage`:
```typescrip
  // hide map controls
  iframe.postMessage({ type: 'map.applyStyle', selector: '.ol-control', style: 'display', value:'none' });
```
* added documentation about applying styles to shared map widget from parent window

#### 3.1.28
* fixed issue with double request of widgets with custom data source
* for small shared widgets, mobile pager(from responsive design) now hidden
* fixed issue with button icons on pie chart if DSW hosted not in root (#219) 

#### 3.1.27
* fixed issue with setting current value of choose data source control if running as shared widget 
* now `datasource` url parameter changed while changing datasource on shared widget
* added `tooltipProperty` data property for map widget to define custom tooltips
* added support for html in map tooltips
* added communication with parent window using `postMessage` to avoid cross-domain restrictions:
```typescript
// Extended interface for widget event
export interface IWidgetEvent {
    type: WidgetEventType;
    index: number;
    widget: IWidgetInfo;
    drills?: IWidgetDrill[];
    filters?: string;
    datasource?: string;
}

// Example
window.addEventListener('message', e => {
    const event = e.data as IWidgetEvent;
    switch (event.type) {
        case 'drill':
            // code ... 
            break;
        case 'filter': 
            // code ... 
            break;
        case 'datasource': 
            // code ... 
            break;
    }
});
``` 
 
#### 3.1.26
* added event passing to parent window via `dsw` object for shared widgets.
Now shared widgets can pass drill and filter events to parent window
```typescript
// Define dsw object in window using this interface:
export interface IDSW {
    onFilter: (e: IWidgetEvent) => void;
    onDrill: (e: IWidgetEvent) => void;
}
// Widget event
export interface IWidgetEvent {
    index: number;
    widget: IWidgetInfo;
    drills?: IWidgetDrill[];
    filters?: string;
}
// Example:
window.dsw = {
    onDrill: (data) => {
         // handle drill event here
    }, 
    onFilter: (data) => {
         // handle filter event here
    }
}
```



#### 3.1.24
* added support for sharing linked widgets (#214)
* fixed map popup positioning issue (#213)
* fixed map popup drill up issue (#213)
* fullscreen button hidden on shared widgets (#211)
* added "noheader" URL parameter for shared widgets, eg. "&noheader=1" (#211)
* added "datasource" URL parameter for shared widgets, parameter value should be escaped. eg. "&datasource=map%2Frayon_5weights.pivot" (#210)
* added "drilldown" URL parameter for shared widgets, containing all paths separated by "~" character, parameter value should be escaped (#208)
* added "variables" URL parameter for shared widgets, eg. "&variables=selectedPeriod.105~testVariable.100" (#212)
* now "drilldown" url parameter changed while drilling on shared widget (#209)
* now "FILTERS" url parameter changed while filtering on shared widget (#209)
* fixed coloring of treemap and pie charts (#198)
* fixed linked widget in samples-bi. actual issue was: "no overrides for combo chart" (#196)
* added support for sharing drill levels  sharing widget 
* added data property "popupProperty" for map, to define which value show in popup
* fixed issue with linked inline widgets(widgets on tiles) 

#### 3.1.23
* added support for MDX order in drilldown (#205)
* added support for MDX order in lightpivottable (#205)
* added auto-drill for charts & treemap if there is only one item present as mdx result (#203)
* fixed issue with colorProperty, now read from dataProperties (#202)
* fixed issue with choose data source control default source display (#206) 
* fixed issue "no back button after drill" on some widgets

#### 3.1.22
* fixed issue with drilldown MDX generation

#### 3.1.21
* fixed issue with widget sharing (#193)

#### 3.1.20
* fixed issue with pie, bullseye, time, xy, hi/low, bubble charts rendering
  
#### 3.1.19
* fixed issue with tree chart rendering

#### 3.1.18
* increased performance of charts with big data sets

#### 3.1.17
* fixed issue with MultiPolygon in GeoJSON support (polygons with holes)
 
#### 3.1.16
* added "View As" options: "Stacked bar chart", "Stacked column chart" (#179)
* fixed formatting for charts (#185)
* added percentage display for pie chart (#187)
* added annotations display for pie chart (#186)
 
#### 3.1.15
* text widget changes meters direction depending on aspect ration. for tall widgets meters are to be displayed as rows, for wide widgets - as columns

#### 3.1.14
* fixed issue with filter values (#182)
* added error display if there isn't pivot variable exists
* added series for pie chart (#181)
* changed styles for text meters (#142)

#### 3.1.13
* added GeoJSON support for map widget:
   * type of widget should be "map"
   * name of the widget should be the same as GeoJSON file with extension, eg. "map.geojson"
   * use "coordsProperty" data property to set name of key field to link data with properties in GeoJSON (It's a must to have field in data named as "coordsProperty" value, so it can be linked with properties of GeoJSON)
   * to show custom tooltips on polygons - add "TooltipValue" field to data
* fixed issue with title on map popup   
        
#### 3.1.11
* fixed combo chart display issue
* added support for min/max values for combo chart percentage axis
* added support axis types for combo chart
* fixed issue with percentage axis labels rounding(eg. 52.33333333%)

#### 3.1.10
* added missing files

#### 3.1.9
* fixed issue with data values as empty string

#### 3.1.8
* fixed issue with settings loading and DefaultApp
* fixed styling issue with "Reset click filter" and "Back button"

#### 3.1.7
* fixed issue with map polygon loading

#### 3.1.6
* added missing main.js to dist

#### 3.1.5
* fixed polygon filename issue while loading polygons
* polygon in js format supported

#### 3.1.4
* added support for "horizontalControls"/"verticalControls" widgets
* added icon for PWA for Android/IOS 
* fixed issue with "Show Zero" button (#171)
* improved meter widget (#166):
  * added support for multiple meters
  * added display of labels
  * added display of threshold
  * added display of target value
  * fixed issue with values in range 0..1
* fixed issues with date interval filters (#167)
* fixed issues with dimension details (#172)
* removed '-' character from addons (#174)

#### 3.1.3
* fixed parallel addons loading issue

#### 3.1.2
* temporary disabled buildOptimizer to be able load addons on production releases
* added error logging for missing modules during addon loading

#### 3.1.1
* changed folder for built addons to `dist-addons`
* now all built addons are included in distribution under `addons` folder
* WoldMap and HtmlViewer now separated from build and bundled as addons
* updated addons documentation(added section about local testing, added portlet information)
* added highcharts missing modules for addons
* fixed issue with widget type comparison for addons

#### 3.1.0
* introduced new addon system. use `./src/addons/simple-addon.component.ts` as reference. ***Do not compile old addons - they won't work***.
Now there is no need to compile DSW with addon. Addon can be used in different build of DSW.
* added addon versioning support, checks and warning if inappropriate addon version loaded in DSW 
* added detailed addons documentation `Addons.md`
* added detailed addon example code with comments
* now addon builder produces correct and same names for addon files `my-addon.ts` > `my-addon.js` (previously, Angular CLI creates `addon-0`, `addon-1`, etc.)
* now, after addition of new services to base widget class, there is no need to recompile and redeploy all addons  
* updated to Angular 11.2.3 

#### 3.0.20
* fixed issue with column formatting in LPT

#### 3.0.19
* migrated to Angular 11
* updated Highcharts version
* fixed issue with values display button(series disappeared)
* fixed issue with changing type of chart
* added ability to remove widget from tile 

#### 3.0.18
* **added mobile support** 
* fixed issue with unable to choose a widget for tile
* fixed issue with no changes until refresh, after choosing widget for tile
* fixed white background issue for widgets on tiles
* fixed issue with a scroll during home screen setup
* after redirecting to login screen due to 401/403, previous url stored and user redirected back after successful login
* now login screen fills previous namespace or namespace from saved url after 401/403 redirect
 
#### 3.0.17
* removed "embed" parameter from navigate action
* service worker backend path fixes
* fixed contrast theme white text on map widget popup issue 

#### 3.0.16
* fixed service worker api issue(caching of api requests, leading to caching 401 or freezes requests)
* fixed build to prevent caching of app files 
 
#### 3.0.15
* deployment fix

#### 3.0.14
* removed non-complete styles from future release (issue with pivot colors)

#### 3.0.13
* added "tuples.children" data format support for map widget
* fixed issue with markers on map widget 
* added errors display for datasource requests
* fixed issue with incorrect initial view bounds for some maps

#### 3.0.12
* added support for "scorecard"("regular") widget type
* added support for DSZ min/max values for axis options
* added support for DSZ percent  display option (values and axis)
* added 403 handling as 401 due to new IRIS 2020.4 version
* changed title position on widget titles to left
* fixed issue with theming when there is no config file hosted 
* fixed issue with empty dashboard after navigating back or with breadcrumbs
* fixed issue with series order on charts. now order equal to mdx2json result
* fixed issue with color adjustment for charts with markers
* updated to new lightpivot version
* added support for errors display in light pivot
* fixed issue with invisible error messages
* updated mdx2json dependency to support new versions 

#### 3.0.11
* Added global theming for charts

**Note: if you store config on your server, then probably you need to reset charts color before use it, because colors are stored in your config. To do it: click on palette icon on chart header and press "Reset to default" button, then press "Apply". After that you can export new configuration file)**

* Added themes support via files placed in /css/themes/*.css
* Added inapp theme editor
* Added downloading of custom themes 
* fixed oAuth issue
* fixed issue with interval filters
* fixed issue with config reload on any route change
* fixed issue with chart color configuration
* fixed issue when closing chart color config via menu button
* fixed logout issue when not authorized
* fixed stacking bar chart issue  
* fixed issue with chart type switching on treemap charts

#### 3.0.10
* new feature: now visibility for series in legend stored in settings and can be predefined
* added share dashboard button
* fixed issue with fullscreen widget and context menu
* fixed issue with 401 and redirect to login page
* fixed issue with black borders on a chart after canceling color settings
* fixed issue with missing real logout

#### 3.0.9
* fixed issue with default(without user configuration) widget placement on dashboards

#### 3.0.8a
* added support for addons
* added settings menu
* most of the settings now can be changed in realtime
* added support for "ns" param on login screen
* added realtime customization of chart colors 
* optimized widget loading on dashboard
* added "view as" context menu item for charts
* added "export" to context menu
* improved context menu design
* added optimization for dashboard widget for future 'content-visibility' feature
* optimized speed of dashboard widgets loading and user interaction
* new implementation of chart printing(now printed as svg, faster and no flickering on main screen, as old implementation renders chart in DOM)
* changed behavior of widgets while dragging, now they have infinitive vertical scroll
* improved UX of context menu, if it opened near edge of the screen, it's to be opened opposite edge, so context menu can't never shown offscreen
* fixed issue with missing controls on empty widget
* small fix for sidebar positioning
* simplified layout for text widget(removed % calcs, etc. small performance increase)
* fixed issue during navigation when editing dashboard
* fixed few memory leaks due to forgotten subscriptions
* changed layout of sidebar menus
* small fixes for style variables of filter(for future correct themes support)

#### 3.0.7a
* added missing import to csv/xls
* added missing import to images (for charts)
* fixed style for context menu
* added sub menu items support for context menu
* changed logo for login screen
* fixed issue with chart series colors
* fixed issue with public dsw 
* added description for new url style in readme 


#### 3.0.6a
This is <b>alpha</b> release of newly rewritten DSW
with TypeScript and Angular 10 + service workers support.

This version comes with new UI and latest versions
of Highcharts, gridster and other libs.

This version is still <b>not supports</b>:
* user addons (base addons as map, html text, worldmap are included in bundle already) 
* changing app settings via UI(only configs supported)
* color adjustments and theming
* some specific widget settings or features(eg. changing type of chart)
Also this version can contain several bugs due to code rewrite

Do not install it, if you use features described above.
 
#### 2.1.51
* added formatting support for text widget

#### 2.1.50
* added support for "?theme" query param
* added fullscreen button for widgets

#### 2.1.49
* changed bubble size calculation algorithm and min/max sizes 

#### 2.1.48
* fixed tree chart hover issue 

#### 2.1.47
* fixed bubble chart data issue 

#### 2.1.46
* fixed bubble chart overflow issue

#### 2.1.45
* fixed issue with chart options
* added top records support for bubble chart
* fixed bubbles size on bubble chart
* changed data processing for bubble chart
* fixed localStorage.devAddons support for debug

#### 2.1.44
* fixed bubble chart

#### 2.1.42
* fixes for zpm

#### 2.1.42
* added col count control for charts
* changed opacity for map polygons to 0.65
* added initial support for gradient color on map polygons

#### 2.1.41
* Added oAuth

#### 2.1.40
* Fixed issue with widgets on tiles

#### 2.1.39
* Fixed issue with chooseColumnSpec

#### 2.1.38
* Fixed bubble chart "title" for radius issue
* Fixed bubble chart "undefined" series issue

#### 2.1.37
* Bubble chart KPI now show radius
* Fixed issue with dashboard filters
 
#### 2.1.36
* New version of Highcharts
* Fixed issue with chooseColumnSpec
* Added  initial support for oAuth

#### 2.1.35
* Fixed addons loading issue

#### 2.1.34
* Fixed issue with namespace detection on home screen
* Fixed issue whit zero values on charts
* Fixes for mobile version of app

#### 2.1.24
* Fixed issue with tiles config loading

#### 2.1.23
* Added namespace to main config
* Main config was moved to root "/config.json"
* Fixed issue with config loading
* Now DSW build includes config.json (copied only if there is no another one)

#### 2.1.22
* Added main config file "configs/config.json"
* Added support of changing mdx2json endpoint in config.json
* Added "Reset click filter" feature
* Fixed issue with text selection inside pivot table
* Fixed issue with 401 Auth error message during login phase
* Updated light pivot table

#### 2.1.21
* Now click filter can be removed by back button on dependent widget
* Now widget sharing include toolbar button state
* Fixed login error messages issue
* Fixed issue with related filters loading

#### 2.1.20
* Added default value for "Columns count" field in settings
* Added hint for "Widget height" field in settings
* Added support for intervals in shared widgets
* Now shared widgets, also shares filters
* Now shared widgets, also shares legend status
* Now shared widgets, don't takes into account default values of filters
* Fixed back button after drillthrough in graphical widgets
* Fixed sharing url generation issue with wrong url in some cases
* Fixed redirection url issue after expired session redirect 

#### 2.1.19
* added "Copy MDX" function to widget context menu

#### 2.1.18
* fixed sharing issues with some urls
* fixed small widgets sharing issue

#### 2.1.17
* fixed sharing issues with some urls
* fixed missing close tag for iframe in sharing code

#### 2.1.16
* fixed widget sharing logic

#### 2.1.13
* fixed issue with metro theme with new installation

#### 2.1.12
* prepeared for migration to new highcharts
* fixed some widget actions
* highcharts has been updated
* lightpivottable has been updated
* fixed pivot issue
* fixed actions issues

#### 2.1.11
* now color settings depends from theme
* added custom colors for widgets(cog icon on chart widget header)
* fixed issue with redundant back button on pivot

#### 2.1.10
* fixed issues with theme loading

#### 2.1.9
* added black theme
* added configuration for chart colors and some other colors as well
* added changelog tab
* fixed issue with widget height settings
* fixed bubble chart issue with displaying data
* removed useless "data source" button
* fixed issue with filtering sharing and filtering values from URL
