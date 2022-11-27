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
