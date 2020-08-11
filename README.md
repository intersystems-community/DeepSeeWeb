# DeepSeeWeb

[![Gitter](https://img.shields.io/badge/chat-on%20telegram-blue.svg)](https://t.me/joinchat/FoZ4M0xJSMDPlCQBLPRosw)

Renderer for DeepSee Dashboards in Browser with MDX2JSON as a Serverside and JS web-client.<br>
Developed using AngularJS and Bootstrap.<br><br>

# Whats new in 3.0
This is newly rewritten DeepSeeWeb with TypeScript & Angular 10!
Some features of new version:
* Clean navigation

![DeepSeeNavigation](https://github.com/gnibeda/gnibeda.github.io/blob/master/images/nav1.png?raw=true)

Now user can clearly see and navigate to dashboards via breadcrumbs, changing namespace, etc.
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
