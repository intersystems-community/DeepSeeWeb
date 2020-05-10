#2.1.50
* added support for "?theme" query param
* added fullscreen button for widgets

#2.1.49
* changed bubble size calculation algorithm and min/max sizes 

#2.1.48
* fixed tree chart hover issue 

#2.1.47
* fixed bubble chart data issue 

#2.1.46
* fixed bubble chart overflow issue

#2.1.45
* fixed issue with chart options
* added top records support for bubble chart
* fixed bubbles size on bubble chart
* changed data processing for bubble chart
* fixed localStorage.devAddons support for debug

#2.1.44
* fixed bubble chart

#2.1.42
* fixes for zpm

#2.1.42
* added col count control for charts
* changed opacity for map polygons to 0.65
* added initial support for gradient color on map polygons

#2.1.41
* Added oAuth

#2.1.40
* Fixed issue with widgets on tiles

#2.1.39
* Fixed issue with chooseColumnSpec

#2.1.38
* Fixed bubble chart "title" for radius issue
* Fixed bubble chart "undefined" series issue

#2.1.37
* Bubble chart KPI now show radius
* Fixed issue with dashboard filters
 
#2.1.36
* New version of Highcharts
* Fixed issue with chooseColumnSpec
* Added  initial support for oAuth

#2.1.35
* Fixed addons loading issue

#2.1.34
* Fixed issue with namespace detection on home screen
* Fixed issue whit zero values on charts
* Fixes for mobile version of app

#2.1.24
* Fixed issue with tiles config loading

#2.1.23
* Added namespace to main config
* Main config was moved to root "/config.json"
* Fixed issue with config loading
* Now DSW build includes config.json (copied only if there is no another one)

#2.1.22
* Added main config file "configs/config.json"
* Added support of changing mdx2json endpoint in config.json
* Added "Reset click filter" feature
* Fixed issue with text selection inside pivot table
* Fixed issue with 401 Auth error message during login phase
* Updated light pivot table

#2.1.21
* Now click filter can be removed by back button on dependent widget
* Now widget sharing include toolbar button state
* Fixed login error messages issue
* Fixed issue with related filters loading

#2.1.20
* Added default value for "Columns count" field in settings
* Added hint for "Widget height" field in settings
* Added support for intervals in shared widgets
* Now shared widgets, also shares filters
* Now shared widgets, also shares legend status
* Now shared widgets, don't takes into account default values of filters
* Fixed back button after drillthrough in graphical widgets
* Fixed sharing url generation issue with wrong url in some cases
* Fixed redirection url issue after expired session redirect 

#2.1.19
* added "Copy MDX" function to widget context menu

#2.1.18
* fixed sharing issues with some urls
* fixed small widgets sharing issue

#2.1.17
* fixed sharing issues with some urls
* fixed missing close tag for iframe in sharing code

#2.1.16
* fixed widget sharing logic

#2.1.13
* fixed issue with metro theme with new installation

#2.1.12
* prepeared for migration to new highcharts
* fixed some widget actions
* highcharts has been updated
* lightpivottable has been updated
* fixed pivot issue
* fixed actions issues

#2.1.11
* now color settings depends from theme
* added custom colors for widgets(cog icon on chart widget header)
* fixed issue with redundant back button on pivot

#2.1.10
* fixed issues with theme loading

#2.1.9
* added black theme
* added configuration for chart colors and some other colors as well
* added changelog tab
* fixed issue with widget height settings
* fixed bubble chart issue with displaying data
* removed useless "data source" button
* fixed issue with filtering sharing and filtering values from URL
