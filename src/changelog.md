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
