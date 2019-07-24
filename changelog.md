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