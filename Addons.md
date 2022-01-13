# DSW Addons

## 1. Intro
DeepSeeWeb supports user addons, that can be created as TypeScript files and compiled to JS.
These files are to be placed in `/addons` folder on a website in root of DSW. The file name should be equal to portlet name(with prefix `DSW.Addons.`) that used for a custom widget.

**Note: DSW auto-generates portlets for all addons placed in `/addons` folder with names: `DSW.Addons.{filename}`.**

For file `myAddon.js` will be created `DSW.Addons.myAddon` portlet.

## 2. Creating addon
To create an addon, follow next steps:
1. Clone DSW repo https://github.com/intersystems-community/DeepSeeWeb
2. Setup dev environment to work with project, run `npm install` 
3. There is addon example in `/src/addons/simpleAddon.ts`
4. Make copy of this file as starting point for addon creation, eg. `/src/addons/myAddon.ts`.
All files placed in `/src/addons` folder are treated as addons and are to be compiled in separate JS files
5. Modify file `/src/addons/myAddon.ts` to implement features you need
6. Run command `npm run build:addons` to compile all addons placed in `/src/addons` folder
7. After build, all compiled addons are to be placed in `/dist-addons/src/addons` folder
8. Rename your addon file to name of custom portlet, that would be used for this widget type. 
By default, DSW creates portlets with a name: `DSW.Addons.{filename}`(without extension).
Copy renamed file into `/addons` folder of your DSW root on a website.

For a file deployed to `addons/myAddon.js` will be created portlet `DSW.Addons.myAddon`.

## 3. Addon versioning
DSW is a developing application, so sometimes new features can be introduced that is not compatible with an old version of DSW.
That's why addon systems supports version checking. All addons include their version:
```typescript
static AddonInfo: IAddonInfo = {       
    version: 1,
    type: 'custom'
};
```
This version needed to compare version from `BaseWidget.CURRENT_ADDON_VERSION` of hosted DSW, and if these versions are not equal, 
developer must recompile addon with appropriate sources of DSW and set a new version of addon as **number**.

However, addon with an inappropriate version still  loaded and executed, but can work incorrectly or throw exceptions.

*Note: version should be set as number, **not as reference** and be always equal to `BaseWidget.CURRENT_ADDON_VERSION`, don't increment version after each build, only check it equal to version in base class.*

## 3.1. Overriding default widgets
There is possibiliti to override default widget with addons, using `overrideBaseType` parameter of `IAddonInfo` structure.
Eg. to override "Bar chart" widget, following structure should be used:
```typescript
static AddonInfo: IAddonInfo = {
    version: 1,
    type: 'custom',
    overrideBaseType: 'barchart'
};
```
Default types are defined in `widget-type.service.ts` in `TYPES` map.

## 4. Development info
Each addon is Angular component written on TypeScript. Each file can export only one class.

### 4.1. Inheritance
Addon always must be inherited from `BaseWidget`. Addon also can be inherited from `BaseChartClass` for using Highcharts implementation.

Inheritance: `BaseWidget < BaseChartClass < AddonClass`

Addon constructor never should be modified, because DSW have base class `BaseWidget` and `super()` is called from addon constructor.
So any difference in constructors will cause errors.

### 4.2. Services
There are different services and helpers that can be used via base class:

|Name|Type|Description|
| --- | --- | --- |
|el|ElementRef|Reference to angular element. Used to work with DOM element of addon, eg.: `const bounds = this.el.nativeElement.getBoundingClientRect();`|
|us|UtilService|Utils service. Has some utility functions, eg. `this.us.mergeRecursive(obj1, ibj2);`|;
|vs|VariablesService|Service to work with `applyvariable` controls on widgets|
|ss|StorageService|Used to store application settings, widget settings, etc., eg.: `this.dashboardSettings = this.ss.getWidgetsSettings(dashboard());`
|ds|DataService|Used to mage requests, execute MDX, retrieve pivot data, etc.|
|fs|FilterService|Used to work with widget filters|
|wts|WidgetTypeService|Used to store widget type configuration, which type is map/chart, etc.|
|dbs|DashboardService|Used to store and retrieve dashboard information|
|cfr|ComponentFactoryResolve|Internal angular service. Used for dynamic component creation|
|ns|NamespaceService|Used to work with namespaces, eg.: `const list = this.ns.getNamespaces();`. Use `CURRENT_NAMESPACE` variable to access current namespace|
|route|ActivatedRoute|Angular activated route|
|i18n|I18nService|Used to get translation for strings, eg.:`const errorText = this.i18n.get('errNoDashboards')`|
|bs|BroadcastService|Used to broadcast messages between widgets, eg.: `this.bs.broadcast('refresh:' + widgetName);`|;
|san|DomSanitizer|Used to inject secure html content in angular apps|
|sbs|SidebarService|Used to show/hide sidebar|
|cd|ChangeDetectorRef|Used to manually cause change detection for component, if operation ran outside angular zone, eg.:`this.cd.detectChanges();`|
|zone|NgZone|Angular zone service. Used to run code outside angular zone, eg.: `this.zone.runOutsideAngular(() => { /* code */  })'`|
 
 
 ### 4.3. Methods
There are base methods that can be overridden:

|Name|Description|
| --- | --- |
|ngOnInit|Initialization of addon. Make all preparations here. Do not access DOM from this method|
|ngAfterViewInit|Initialization of DOM can be made here|
|requestData|Make all http or other request here|
|retrieveData|Default data parser can be overridden here. Process data here, that was returned by MDX or other requests|
|doDrill|Override default drill down behavior|
|doDrillUp|Override default drill up behavior|
|doDrillFilter|Override default drill filter behavior|
|performAction|Override widgets actions, eg.: `navigate`, `newwindow`|
|showLoading|Show loading spinner|
|hideLoading|Hide loading spinner|
|showError|Show widget error message|
|hideError|Hide widget error message|
|getMDX|Returns widget MDX string|
|onResize|Callback after component resizing ends. Recalculate all sizes here if needed|
|formatNumber|Formats number with desired format|
|destroy|Callback on widget destroy. Remove all data and make cleanup here|

### 4.4. Widget information
Access to widget information can be done via `this.widget`. Check `IWidgetInfo` interface for more information.
This section will be updated with more details in the future. 

## 5.Technical part
Addons is a simple TypeScript file, that compiled via TSC.

Npm script `build:addons` just a shortcut for command: `tsc --project ./src/addons`.
So TSC uses configuration file: `./src/addons/tsconfig.json`

Module is set to `CommonJS`. CommonJS is used for simple purpose: 
all references to external modules in compiled file will be replaced to `require('module')` function call, so:
1. No additional code produced
2. We can reuse loaded modules during addon loading, eg.: `@angular/core`, `@angular/common`, etc.

Now dsw can shim `require` function and use already loaded modules like this(code from `startup.service.ts`):
```typescript
const modules = {
    '@angular/core': AngularCore,
    '@angular/common': AngularCommon,
    '@angular/router': AngularRouter,
    '@angular/platform-browser-dynamic': BrowserDynamic,
    '@angular/platform-browser': BrowserModuleAll,
    '../app/services/util.service': { UtilService },
    '../app/services/variables.service': { VariablesService },
    '../app/services/storage.service': { StorageService }
    /* more code here */
}
// Replace require
const require = (m) => modules[m];
```
After a shim, addon code executed and loads modules with newly defined `require` function.
So all modules loaded from running DSW.

This allows usage of addons compiled on different machines, because default Angular CLI produces bundles with `__webpack_require__(id)`, where `id` is different for different builds.
So in previous version addons can be loaded only from the same DSW build. 

### 6. Local testing
If you need test some local files during `ng serve`, you can use dev addons definition, eg.:
```javascript
localStorage.devAddons = '["addons/worldMap.js", "addons/htmlViewer.js", "addons/myAddon.js"]';
``` 
Server response will be ignored and local definition is to be used for addon loading.

*Note: addons should be previously compiled locally.* 

### 7. Sample code
There are two real addons that used on some environments:
1. "Word Map", addon uses Highcharts map to display map, instead of default OSM: `./src/addons/worldMap.ts`
2. "Html viewer", addon displays html pages by url passed in widget `Data` (`properties.Data`) field: `./src/addons/htmlViewer.ts` 

 
