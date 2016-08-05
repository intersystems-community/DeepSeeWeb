#Addons developer info
All custom widget is derived from [src/factories/baseWidget.js](src/factories/baseWidget.js) class in functional OOP style.
This section provide brief description of method and properties of base widget.
For more detailed description, please read JSDOC comments in source file.

#Properties
Widget have different properties stored in angular $scope. Here is description of mostly used:
 
 * `$scope.item` - Widget description info object. Such as widget size, position, etc.
 
 * `this.desc` - Widget data received from MDX2JSON. Sych as widget type, MDX, etc.
 
#Methods
Here is description of widget methods that available from base class:
 
 * `this.showLoading` - Shows preloader animation on widget
 
 * `this.hideLoading` - Hides preloader animation on widget
 
 * `this._retrieveData` - This function called when widget receives data from MDX execution result. 
 Redefine this function to parse and display data as needed.
  
 * `this._retriveDataSource` - This function called when widget receives datasource info from MDX2JSON.
  
 * `this.doDrill` - This function is called when drill operation is performed.
 
 * `this.drillUp` - This function is called when drillup operation is performed.
 
 * `this.onInit` - Widget initialization callback.
 
 * `this.destroy` - Widget destroy callback.
 
 * `this.getMDX` - Returns widget MDX. Modified be drills, custom data sources, variables, etc.
 
 * `this.showError` - Displays error in red band on top of widget.
  
 * `this.clearError` - Hides widget error.
 
 * `this.showToolbar` - Shows widget toolbar.
 
 * `this.hideToolbar` - Hides widget toolbar.
 
 * `this.getFilter` - Get widget filter.
 
 * `this.requestData` - Request widget data from MDX2JSON by executing widget MDX.
 
 * `this.onResize` - Resizing callback. Called after widget size was changed. 
 
 
 
 