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
First be sure, that you have MDX2JSON installed. To test it open URL <server:port>/MDX2JSON/Test
You should see something like this:
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

Download the latest release xml file.
Import it to any namespace, f.e. to USER.
Run in terminal:
```
USER> d ##class(DSW.Installer).setup()
```
It will:
create /dsw web app, 
create ...csp/dsw folder 
put all the DeepSee Web files into /csp/dsw folder.

To use DSW Open server:port/dsw/index.html

