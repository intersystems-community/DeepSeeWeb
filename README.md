# DeepSeeWeb
![Build Angular](https://github.com/intersystems-community/DeepSeeWeb/actions/workflows/angular-build.yml/badge.svg)
![Test UI](https://github.com/intersystems-community/DeepSeeWeb/actions/workflows/test-ui.yml/badge.svg)
[![Gitter](https://img.shields.io/badge/chat-on%20telegram-blue.svg)](https://t.me/joinchat/FoZ4M0xJSMDPlCQBLPRosw)

Renderer for DeepSee Dashboards in Browser with MDX2JSON as a Serverside and JS web-client.<br>
Developed using AngularJS and Bootstrap.<br><br>

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
1. First be sure, that you have [MDX2JSON](https://github.com/intersystems-ru/Cache-MDX2JSON) installed. To test it open URL `<server:port>/MDX2JSON/Test`
You should see something like this:
`
{
	"DefaultApp":"\/mdx2json",
	"Mappings": {
		"Mapped":["MDX2JSON","SAMPLES"
		],
		"Unmapped":["%SYS","DOCBOOK","USER"
		]
	},
	"Status":"OK",
	"User":"UnknownUser",
	"Version":2.2
}
`

2. Download the latest release xml file: https://github.com/intersystems-ru/DeepSeeWeb/releases
3. Import it to any Caché namespace, f.e. to USER.
4. Run in terminal:
```
USER> d ##class(DSW.Installer).setup()
```
It will:
* create /dsw web app, 
* create ...csp/dsw folder 
* put all the necessary DeepSee Web files into .../csp/dsw folder.

To use DSW Open `server:port/dsw/index.html`

Demo: https://www.youtube.com/watch?v=-HplM12eNik

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

To create a map widget you'll need:

1. Get a polygon file. [GeoJSON](https://en.wikipedia.org/wiki/GeoJSON) is supported, and there's also support for a [legacy js format](https://github.com/intersystems-community/dsw-map/tree/master/src/js).
2. Save a polygon file into a root directory of a default web application of your namespace.
3. Create a widget with type: `map` and name equal to the polygons file.
4. Your GeoJSON contains an array of polygons, with some property being a unique identifier for a polygon. Create a `coordsProperty` dataproperty with the value being the name of this property in your widget.
5. In the widget data source, you must create a column with the same name as `coordsProperty` value, with the values being unique polygon identifiers.
6. Add other properties/data properties as needed.

| Data Property              | Type         | Description                                                                                                | Value                  | Default                                                |
| -------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------ |
| tooltipProperty            | dataproperty | Define custom tooltip. Tooltip appears when user's cursor hovers over a polygon.                           | Datasource column name | Row name                                               |
| popupProperty              | dataproperty | Define custom popup. Tooltip appears when user's cursor presses LMB on a polygon and there's no DRILLDOWN. | Datasource column name | Row name                                               |
| coordsProperty             | dataproperty | Property present in both the datasource AND geojson containing polygon id for a tile                       | Datasource column name |
| colorProperty              | dataproperty | Name of a numeric property, defining polygon color.                                                        | Datasource column name |
| coordsJsFile               | property     | File with a JS or GeoJSON polygons. Requested from the root of a default web app for a namespace           | js or geojson path     | Widget name                                            |
| colorFormula               | property     | Formula used to calculate polygon color.                                                                   |                        | hsl((255-x)/255 \* 120, 100%, 50%)<br>rgb(x, 255-x, 0) |
| polygonTitleProperty       | property     | Define custom polygon title                                                                                | Datasource column name |
| colorProperty              | property     | Deprecated by a dataproperty with a same name                                                              |                        |                                                        |
| markerPopupContentProperty | property     | Deprecated by a popupProperty dataproperty                                                                 |                        |                                                        |
| colorClientProperty        | property     | Deprecated by a colorProperty dataproperty                                                                 |                        |                                                        |


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

# Article and discussion around DeepSee Web
Here is the [article on InterSystems Developer Community](https://community.intersystems.com/post/deepsee-web-intersystems-analytics-visualization-angularjs-part-1) describing DSW features and capabilites.


