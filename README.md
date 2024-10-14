# DeepSeeWeb
![Build Angular](https://github.com/intersystems-community/DeepSeeWeb/actions/workflows/angular-build.yml/badge.svg)
![Test UI](https://github.com/intersystems-community/DeepSeeWeb/actions/workflows/test-ui.yml/badge.svg)
[![Gitter](https://img.shields.io/badge/chat-on%20telegram-blue.svg)](https://t.me/joinchat/FoZ4M0xJSMDPlCQBLPRosw)

DeepSeeWeb is an Angular UI layer for IRIS BI (DeepSee) dashboards

# Map widget changes in 4.0.13
Detailed information about map usage can be found here: [Map widget](#map-widget)

To use **old map widget (will be removed in future versions)** add `oldmap=1` to query parameters.

In DSW version 4.0.13 map widget has been changed:
* widget was rewritten to use GeoJSON as base format
* widget was simplified, for easy usage without need of complex configuration
* by default widget uses world GeoJSON, if no custom GeoJSON provided
* added auto-detection of markers mode, map can switch modes(polygons/markers) based on data provided
* popup was replaced with tooltip and tooltip now always visible during hovering
* tooltip now display all data for marker/polygon, no need to set up custom tooltip field(custom tooltip still supported)
* fixed issue when tooltip can be rendered offscreen, now tooltip always shown in bounds of widget frame
* improved performance
* added new design for tooltip
* some data properties no longer supported

# What's new in 4.0
* migrated to Angular 18:
  * rewritten application to use lazy loading, as a result "main.js" size reduced from **3Mb** to **500Kb**
  * all javascript modules in dist package now take up 3Mb, instead of 5Mb(previous version)
  * templates now uses new control flow
  * removed deprecated ComponentFactoryResolver, now dynamic component created using NgComponentOutlet
  * added many interfaces and types to make type checks and reduce runtime errors
  * updated addon systems to work with new Angular
  * now new Angular 18 builder is used
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

Note, that new charts looks a bit different, also new font helps with readability. Compare UI of DSW 3.x vs DSW 4.x:

DSW 3.x
![DSW3](https://raw.githubusercontent.com/gnibeda/gnibeda.github.io/master/images/dsw-3.png)
DSW 4.x
![DSW3](https://raw.githubusercontent.com/gnibeda/gnibeda.github.io/master/images/dsw-4.png)

# Whats new in 3.0
This is newly rewritten DeepSeeWeb with TypeScript & Angular 10!

<b>Current version is alpha!</b>
 
Some features of new version:
* Clean navigation

![DeepSeeNavigation](https://github.com/gnibeda/gnibeda.github.io/blob/master/images/nav1.png?raw=true)

Now user can clearly see and navigate to dashboards via breadcrumbs, changing namespace, etc.
Query parameter "ns" for namespace was gone. Now url constructed by following rule 
"/namespace/folder/folder/.../dashboard.dashboard",
eg. http://mysite.com/dsw/#/IRISAPP/Test/Countries.dashboard
* Redesigned login screen

![DeepSeeLogin](https://github.com/gnibeda/gnibeda.github.io/blob/master/images/login.png?raw=true) 
* New sidebar with main menu

![DeepSeeSidebar](https://github.com/gnibeda/gnibeda.github.io/blob/master/images/sidebar1.png?raw=true)

Now user can easly see options available for each screen and change settings

![DeepSeeSidebar](https://github.com/gnibeda/gnibeda.github.io/blob/master/images/sidebar2.png?raw=true)
* More clean dashboards. Colors adjusted to show important data, whilst other information displayed in light colors.
Also new design is more suitable for large screens. 
Top - new design, buttom - old:

![DeepSeeDashboard](https://github.com/gnibeda/gnibeda.github.io/blob/master/images/dash.png?raw=true)
* Clean widget actions

![DeepSeeActions](https://github.com/gnibeda/gnibeda.github.io/blob/master/images/actions.png?raw=true)
* Redesigned styles for filters, modals
* Added service workers to improve application startup
* Now all libs(eg. Highcharts, gridster) can be easily updated via npm
* Removed a lot of old code(300k+ lines) and refactored services
* Changed widget classes to more OOP style, removed all prototypes, etc.
* Changed templates to take advantage of component approach
  
## Not supported in alpha:
* user addons, beacuse old addons has been written on Angular1 (but base addons as map, html text, worldmap are included in bundle already) 
* changing app settings via UI(only configs supported)
* color adjustments and theming
* some specific widget settings or features(eg. changing type of chart)

This features will be implemented soon and are to be included in RC
  
  
# Supported widgets
* Area chart
* Line chart
* Chart with markers
* Bar chart
* Column chart
* Pie chart
* Time chart
* Pivot table
* Text widget
* Combo chart
* Bubble chart
* Hi-Low chart
* Quadtree chart
* Bullseye chart
* Speedometer
* Fuel gauge

# Installation
1. Install IPM
2. Use IPM to install DSW, run in Iris session terminal:
```
zpm "install dsw"
```

# Configuring endpoints 
You can set your endpoint and namespace in an appropriate file config.json located in the root directory

# Known issues:

Sometimes after installation you can see umlyauts in the client. like in the shot:
![Install](/installbug.png?raw=true "Installbug screenshot")
To fix this there are tow ways:
* Copy index.html to index.csp and try to connect to it same way you do with index.html page. Symbols should go in Unicode now.

Or:

* Write your current codepage setting in CSP Gateway for the files:
```
zw ^%SYS("CSP","DefaultFileCharset")
```
This setting should be "utf-8". If there is another setting, save it somewhere and change to "utf-8" 

So this should fix it:
```
set ^%SYS("CSP","DefaultFileCharset")="utf-8"
```

# Embedding widgets

Widgets can be embedded in other pages. Easiest way to embed a widget is to navigate to the widget, set it into a desired state, press RMB to open context menu and press `Share` button. It would show a url for embedding. 

Embedded URL is generated as follows. Start with a dashboard URL and add required `widget` parameter. Optionally add other URL parameters. All parameter values MUST be URL escaped. Available parameters are: 

| Name       | Value                                                  | Value, escaped                                                                                                                                                                                                    | Description                                                                                        |
| ---------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| widget     | 1                                                      | 1                                                                                                                                                                                                                 | Which widget from the dashboard to show (in order of widget definition).                           |
| FILTERS    | `TARGET:*;FILTER:[period].[H1].[period].&[10\]`        | `TARGET:*;FILTER:%5Bperiod%5D.%5BH1%5D.%5Bperiod%5D.%26%5B104%5D`                                                                                                                                                 | Filters to use. Follows InterSystems BI [FILTERS url parameter](https://docs.intersystems.com/irislatest/csp/docbook/DocBook.UI.Page.cls?KEY=D2IMP_ch_dashboards#D2IMP_dashboard_url_parameters). |
| variables  | `variable1.value1`<br>`variable1.value1~variable2.XYZ` | `variable1.value1`<br>`variable1.value1~variable2.XYZ`                                                                                                                                                            | Provide pivot variable values. Variables are separated by `~`. Variable and value are separated by `.`. |
| drilldown  | `level1`<br>`level1~level2`<br>`[regionD].[H1].[regionL].&[23]~[regionD].[H1].[rayonL].&[56043]` | `level1`<br>`level1~level2`<br>`%5BregionD%5D.%5BH1%5D.%5BregionL%5D.%26%5B23%5D~%5BregionD%5D.%5BH1%5D.%5BrayonL%5D.%26%5B56043%5D` | Drilldown on a widget. Drilldown levels are separated by `~`.                                                                         |
| noheader   | `1 `                                                   | `1`                                                                                                                                                                                                               | Do not display header information. Defaults to `0`.                                                |
| datasource | `map/weights.pivot`                                    | `map%2Fweights.pivot`                                                                                                                                                                                             | What datasource to use for widget.                                                                 |

## Embedded widgets callbacks

Embedded widgets interact with a parent in two ways:

1. Communicate with parent window using event passing via `dsw` object for shared widgets:

```typescript
// Define dsw object in a parent window using this interface:
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

2. Communicate with parent window using [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) (supports CORS and crossdomain setup where DSW and parent app are on a separate servers/domains):

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

// Example listener in parent
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
3. Apply styles for map widget
```typescript
  // hide map controls, assuming widget in iframe element
  iframe.postMessage({ type: 'map.applyStyle', selector: '.ol-control', style: 'display', value:'none' });
```
4. Disable context menu on widgets
Use `disableContextMenu=1` data property to disable DSW context menu on any widget. Also, context menu can be disabled on shared widget by passing url parameter `disableContextMenu=1` 

# Map widget
Map can show polygons or markers depending on data source.
If data contains latitude/longitude fields map will display markers, otherwise polygons are shown.

Without setting GeoJSON file, will use bundled `/assets/countries.json` file with world countries.
![Map with polygons](https://github.com/gnibeda/gnibeda.github.io/blob/master/images/map-with-polygons.png?raw=true)

## How to create map widget
To create a map widget you'll need:
1. Get a polygon file. [GeoJSON](https://en.wikipedia.org/wiki/GeoJSON) is supported, and there's also support for a [legacy js format](https://github.com/intersystems-community/dsw-map/tree/master/src/js). Widget can use bundled `/assets/countries.json` file by default if no custom file exists on server. For default mode ignore step 2.
2. Save a polygon file into a root directory of a default web application of your namespace.
3. Create a widget with type: `map` and name equal to the GeoJSON file. For default mode name doesn't matter.
4. If you want to use specific name of widget but still able to load polygon file, use `polygonFile` data property with value equal to file name of polygons file.
5. Prepare data source for map. Data source formats described here: [map data source](#map-data-source).
6. Setup [data properties](#map-data-properties) if needed.

## Map data source
Map widget can work with following data sources:
1. Simple data variant 1.

   Keys(name of a country) defined as Axis 2, Axis 1 contain numeric value 
2. Simple data variant 2. 

   Axis 1 contains pairs `[country-name, value]`, Axis 2 can hold anything
3. Complex data
4. Markers data. Data with latitude/longitude fields

### Simple data variant 1
In this mode map will display simple data.

Axis 2 must contains countries names and Axis 1 contains numeric values:

Example:

Axis 1: "Count"

Axis 2: "Iceland", "Madagascar", "Venezuela"

|            |      |
|------------|------|
| Iceland    | 12   |
| Madagascar | 15   |
| Venezuela  | 10   |
### Simple data variant 2
Axis 1 contains pairs `[country-name, value]`, Axis 2 can hold anything.

Example:

Axis 1: "Name", "Count"

Axis 2: "Id 1", "Id 2", "Id 3"

|        |            |     |
|--------|------------|-----|
| Id 1   | Iceland    | 12  |
| Id 2   | Madagascar | 15  |
| Id 3   | Venezuela  | 10  |

### Complex data
In this mode map can use any data source to display polygons. But some fields must exists in data source to be able to link data with polygons and display colors.

Required fields: 
1. "Key" - field used to link data record with GeoJSON polygon `name` property.
2. "Value" - field contains numeric value used to color polygon. Color of polygon is a gradient from green(minimum value) to red(maximum value).

You can use field with different names as well. In this case use `key`/`value` data properties and define field names as values of these properties respectively. 

Example 1:

|        | Custom1 | Key        | Value | Custom2 |
|--------|---------|------------|-------|---------|
| Id 1   | 10      | Iceland    | 12    | test1   |
| Id 2   | 20      | Madagascar | 15    | test2   |
| Id 3   | 30      | Venezuela  | 10    | test3   |

Example 2:

|        | Custom1 | Field33    | Field44 | Custom2 |
|--------|---------|------------|---------|---------|
| Id 1   | 10      | Iceland    | 12      | test1   |
| Id 2   | 20      | Madagascar | 15      | test2   |
| Id 3   | 30      | Venezuela  | 10      | test3   |

Data property `key` = "Field33", data property `value` = "Field44"

### Markers data
Map can display markers(pins) on coordinates specified in data.
![Map with markers](https://github.com/gnibeda/gnibeda.github.io/blob/master/images/map-with-markers.png?raw=true)
Widget data source, must contain fields `Latitude`/`Longitude` in EPSG:4326 projection.
You can use field with different names as well. In this case use `latitude`/`longitude` data properties and define field names as values of these properties respectively.

Other fields can hold any data. This data will be displayed in a marker tooltip:

![Map tooltip](https://github.com/gnibeda/gnibeda.github.io/blob/master/images/map-tooltip.png?raw=true)

Example 1:

|        | Revenue | Latitude | Units Sold | Longitude |
|--------|---------|----------|------------|-----------|
| Id 1   | 1032.32 | 51.53    | 12         | 4.86      |
| Id 2   | 2045.46 | 52.35    | 15         | -122.09   |
| Id 3   | 5630.12 | 47.67    | 10         | -76.59    |

Example 2:

|        | Revenue | Lat   | Units Sold | Lon       |
|--------|---------|-------|------------|-----------|
| Id 1   | 1032.32 | 51.53 | 12         | 4.86      |
| Id 2   | 2045.46 | 52.35 | 15         | -122.09   |
| Id 3   | 5630.12 | 47.67 | 10         | -76.59    |

Data property `latitude` = "Lat", data property `longitude` = "Lon"
  
## Map data properties
Map supports following data properties, that can be used for customization:

| Data Property              | Type         | Description                                                                                                        | Value                   | Default                                                |
|----------------------------|--------------|--------------------------------------------------------------------------------------------------------------------|-------------------------|--------------------------------------------------------|
| key                        | dataproperty | Define custom name of key field. Value from this field used to link data to GeoJSON polygon `name` property        | Datasource column name  | "Key"                                                  |
| value                      | dataproperty | Define custom name of value field. Value from this field used to calculate color of polygon                        | Datasource column name  | "Value"                                                |
| tileUrl                    | dataproperty | Tile server URL                                                                                                    |                         | https://tile-c.openstreetmap.fr/hot/{z}/{x}/{y}.png    |
| polygonFile                | dataproperty | File name with a JS or GeoJSON polygons. Requested from the root of a default web app for a namespace              | Path with filename      | Widget name                                            |
| latitude                   | dataproperty | Define custom name of latitude field. Used for marker mode                                                         | Datasource column name  | "Latitude"                                             |
| longitude                  | dataproperty | Define custom name of longitude field. Used for marker mode                                                        | Datasource column name  | "Longitude"                                            |
| tooltip                    | dataproperty | Define name of field with custom tooltip text. Tooltip appears when user's cursor hovers over a polygon or marker. | Datasource column name  | "TooltipValue"                                         |
| coordsJsFile               | deprecated   | Use `polygonFile` instead                                                                                          |                         |                                                        |
| tooltipProperty            | deprecated   | Use `tooltip` instead                                                                                              | Datasource column name  | Row name                                               |
| coordsProperty             | deprecated   | Use `key` instead                                                                                                  | Datasource column name  |                                                        |
| colorProperty              | deprecated   | Use `value` instead                                                                                                |                         |                                                        |

No longer supported:

| Data Property              | Type         | Description                                                                                                        | Value                   | Default                                                |
|----------------------------|--------------|--------------------------------------------------------------------------------------------------------------------|-------------------------|--------------------------------------------------------|
| popupProperty              | deprecated   | Define custom popup. Tooltip appears when user's cursor presses LMB on a polygon and there's no DRILLDOWN.         | Datasource column name  | Row name                                               |
| colorFormula               | deprecated   | Formula used to calculate polygon color.                                                                           |                         | hsl((255-x)/255 \* 120, 100%, 50%)<br>rgb(x, 255-x, 0) |
| polygonTitleProperty       | deprecated   | Define custom polygon title                                                                                        | Datasource column name  |                                                        |
| markerPopupContentProperty | deprecated   | Deprecated by a popupProperty dataproperty                                                                         |                         |                                                        |
| colorClientProperty        | deprecated   | Deprecated by a colorProperty dataproperty                                                                         |                         |                                                        |


# Creating custom widgets
DeepSeeWeb allows modification of exist widgets and custom widget registration as well.
For base widget class methods and properties description please read [Addons](Addons.md).
To setup custom widget simply copy widget js file to `/addons` folder.

For custom widget example, please look at [src/factories/customWidget.js](src/factories/customWidget.js). This is simple custom widget that represents html5 canvas for drawing. 

# Creating custom themes
User can create or use custom themes, more about it here: [Custom themes](doc/themes.md).

# License
Though DeepSeeWeb source goes with MIT License it uses hicharts.js for visualisation of several widgets so please obey the [Highcharts license](https://shop.highsoft.com/highcharts/) when use DeepSeeWeb for commercial applications.
According to [Highcharts license](https://shop.highsoft.com/highcharts/#non-com) it's free for non-commercial usage

# Development
At least NodeJS v16.14.0 required to build application.
1. Run `npm i`
2. Run 'npm run build'
3. `dist` folder will contain built app

# Article and discussion around DeepSee Web
Here is the [article on InterSystems Developer Community](https://community.intersystems.com/post/deepsee-web-intersystems-analytics-visualization-angularjs-part-1) describing DSW features and capabilites.


