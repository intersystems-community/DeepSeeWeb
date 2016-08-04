# DeepSeeWeb
Renderer for DeepSee Dashboards in Browser with MDX2JSON as a Serverside and JS web-client.<br>
Developed using AngularJS and Bootstrap.<br><br>
![DeepSeeWeb screenshot](/screenshot.png?raw=true "DeepSeeWeb screenshot")<br>
#Supported widgets
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

#Installation
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

#Known issues:

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
# Creating custom widgets
DeepSeeWeb allows modification of exist widgets and custom widget registration as well.
To setup custom widget user should define simple json with widget description like this:
```
{
	"widgets": [
		{
			"url": "src/factories/customWidget.js",
			"class": "CustomWidget",
			"name": "areachart",
			"type": "custom",
			"directive": "custom-directive"
		}
}
```
This json should be placed in "Addons" tab of DeepSeeWeb configuration window(can be opened from top menu by pressing on gear icon).
Json contains simple array of objects, where each object describes separate widget.
Description object consists of:

* **url** - Relative or absolute path to javascript file with widget code(be careful with cross domain access, store widget code on same domain)

* **class** - Angular factory class name. This name is written in javascript file when calling `angular.module('widgets').factory('CustomWidget', ...`

* **name** - DeepSee widget type in lowercase(e.g. "barchart", "areachart", "piechart", "pivot"). This widget will be replaced with custom. If you want leave exists DSW widgets, you can register custom portlet in DeepSee and use it name.

* **type** - Widget type, can be: "chart", "pivot", "text", "map". Defines type of exists widget. You can use "chart" for Highcarts, "map" for Open Street Map, "pivot" for simple pivot table and "text" for text widget.
Using exists widget you'll get access to all widget properties and ability to configure it. E.g. for Highcharts you can use `$scope.chartConfig` to setup chart, change type, etc.
For all available options please go to highcharts official documentation page: http://api.highcharts.com/highcharts
   
   Also type can have "custom" value. This allow to write custom widget that not exists in DeepSeeWeb. When using this type, field "directive" must be defined.
   
* **directive** - Angular directive that used by custom widget. Make sense only when type is set to "custom".

For custom widget example, please look at `src/factories/customWidget.js`. This is simple custom widget that represents html5 canvas for drawing.
If you use widget json from example above, you'll get custom canvas widget that replaces exists areachart widget. 