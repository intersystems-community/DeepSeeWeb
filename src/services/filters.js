(function() {
    'use strict';

    function FiltersSvc($rootScope) {
        var _this = this;
        this.items = [];
        this.isFiltersOnToolbarExists = false;
        this.init = init;
        this.getWidgetModelFilters = getWidgetModelFilters;
        this.getWidgetFilters = getWidgetFilters;
        this.applyFilter = applyFilter;
        this.getFilter = getFilter;
        this.clear = clear;

        function init(filterArray) {
            _this.items = [];
            _this.isFiltersOnToolbarExists = false;
            for (var i = 0; i < filterArray.length; i++) {
                _this.items.push(filterArray[i]);
                var flt =  _this.items[_this.items.length - 1];
                flt.targetArray = [];
                if ((flt.target !== "*") && (flt.target !== "")) flt.targetArray = flt.target.split(",");
                flt.sourceArray = [];
                if ((flt.source !== "*") && (flt.source !== "")) flt.sourceArray = flt.source.split(",");
                if (flt.source === "") _this.isFiltersOnToolbarExists = true;
                flt.valueDisplay = findDisplayText(flt);
            }
        }

        function findDisplayText(flt) {
            if (flt.value === "" || flt.value === undefined) return "";
            for (var i = 0; i < flt.values.length; i++) if (flt.values[i].path == flt.value) {
                flt.values[i].checked = true;
                flt.values[i].default = true;
                return flt.values[i].name;
            }
            return "";
        }

        // This is model representation of filters, not filters itself. To get filter use Filters.getFilter(flt.idx)
        function getWidgetModelFilters(widgetName) {
            var res = [];
            for (var i = 0; i < _this.items.length; i++) {
                //if ((_this.items[i].target === "*") || (_this.items[i].targetArray.indexOf(widgetName) !== -1)) {
                if (widgetName === "emptyWidget") {
                    if (_this.items[i].source === "") {
                        res.push({ idx: i, label: _this.items[i].label, text: _this.items[i].valueDisplay });
                        continue;
                    }
                }
                if ((_this.items[i].source === "*") || (_this.items[i].sourceArray.indexOf(widgetName) !== -1)) {
                    res.push({ idx: i, label: _this.items[i].label, text: _this.items[i].valueDisplay });
                    continue;
                }
            }
            return res;
        }

        // Returns list of filters applied to widget(note: this filters can be displayed on another widgets, to get displayed widget use getWidgetModelFilters)
        function getWidgetFilters(widgetName) {
            var res = [];
            for (var i = 0; i < _this.items.length; i++) {
                if ((_this.items[i].target === "*") || (_this.items[i].targetArray.indexOf(widgetName) !== -1)) {
                    res.push(_this.items[i]);
                    continue;
                }
            }
            return res;
        }

        function applyFilter(flt, noRefresh) {
            var disp = "";
            var val = "";
            var i;
            for (i = 0; i < flt.values.length; i++) {
                if (flt.values[i].checked) {
                    disp += flt.values[i].name + ",";
                    val += flt.values[i].path + ",";
                }
            }
            if (disp !== "") disp = disp.substr(0, disp.length - 1);
            if (val !== "") val = val.substr(0, val.length - 1);
            flt.valueDisplay = disp;
            flt.value = val;
            if (!noRefresh) {
                if (flt.targetArray.length !== 0) {
                    for (i = 0; i < flt.targetArray.length; i++) $rootScope.$broadcast("filter" + flt.targetArray[i]);
                } else {
                    if (flt.target === "*") $rootScope.$broadcast("filterAll");
                }
            }
        }

        function getFilter(idx) {
            if (!_this.items[idx]) return undefined;
            return _this.items[idx];
        }

        function clear() {
            _this.items = [];
        }


    }

    angular.module('app')
        .service('Filters', ['$rootScope', FiltersSvc]);

})();
