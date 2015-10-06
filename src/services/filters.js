/**
 * Service to store all filters on dashboard
 */
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

        /**
         * Initialize service with filter array
         * @param {Array} filterArray Filter array
         */
        function init(filterArray) {
            _this.items = [];
            _this.isFiltersOnToolbarExists = false;
            for (var i = 0; i < filterArray.length; i++) {
                _this.items.push(filterArray[i]);
                var flt =  _this.items[_this.items.length - 1];
                flt.targetArray = [];
                if ((flt.target !== "*") && (flt.target !== "")) flt.targetArray = flt.target.split(",");
                flt.sourceArray = [];
                if ((flt.source !== "*") && (flt.source !== "") && (flt.location !== "dashboard")) flt.sourceArray = flt.source.split(",");
                if (flt.source === "" || flt.location === "dashboard") _this.isFiltersOnToolbarExists = true;
                flt.valueDisplay = findDisplayText(flt);
            }
        }

        /**
         * Returns filter display text
         * @param {object} flt Filter
         * @returns {string} Filter display text
         */
        function findDisplayText(flt) {
            if (flt.value === "" || flt.value === undefined) return "";
            for (var i = 0; i < flt.values.length; i++) if (flt.values[i].path == flt.value) {
                flt.values[i].checked = true;
                flt.values[i].default = true;
                return flt.values[i].name;
            }
            return "";
        }

        /**
         * Returns model representation of filters, not filters itself. To get filter use Filters.getFilter(flt.idx)
         * @param {string} widgetName Returns filters of widget with this name
         * @returns {Array} Model filters
         */
        function getWidgetModelFilters(widgetName) {
            var res = [];
            for (var i = 0; i < _this.items.length; i++) {
                //if ((_this.items[i].target === "*") || (_this.items[i].targetArray.indexOf(widgetName) !== -1)) {
                if (widgetName === "emptyWidget") {
                    if (_this.items[i].source === "" || _this.items[i].location === "dashboard") {
                        res.push({ idx: i, label: _this.items[i].label, text: _this.items[i].valueDisplay });
                        continue;
                    }
                }
                if ( _this.items[i].location === "dashboard") continue;
                if ((_this.items[i].source === "*") || (_this.items[i].sourceArray.indexOf(widgetName) !== -1)) {
                    res.push({ idx: i, label: _this.items[i].label, text: _this.items[i].valueDisplay });
                    continue;
                }
            }
            return res;
        }

        /**
         * Returns list of filters USED by widget (note: this filters can be displayed on another widgets, to get displayed filters use getWidgetModelFilters)
         * @param {string} widgetName Widget name
         * @returns {Array} Filters used by widget
         */
        function getWidgetFilters(widgetName) {
            var res = [];
            for (var i = 0; i < _this.items.length; i++) {
                if ((_this.items[i].target === "*") || (_this.items[i].targetArray.indexOf(widgetName) !== -1)) {
                    res.push(_this.items[i]);
                }
            }
            return res;
        }

        /**
         * Applies filter
         * @param {object} flt Filter to apply
         * @param {boolean} noRefresh Disable refresh broadcast if true
         */
        function applyFilter(flt, noRefresh) {
            var disp = "";
            var val = "";
            var i;
            for (i = 0; i < flt.values.length; i++) {
                if (flt.values[i].checked) {
                    disp += flt.values[i].name + ",";
                    val += flt.values[i].path + "|";
                }
            }
            if (disp !== "") disp = disp.substr(0, disp.length - 1);
            if (val !== "") val = val.substr(0, val.length - 1);
            flt.valueDisplay = disp;
            flt.value = val;
            if (!noRefresh) {
                if (flt.targetArray.length !== 0) {
                    // Listened in widget.js
                    for (i = 0; i < flt.targetArray.length; i++) $rootScope.$broadcast("filter" + flt.targetArray[i]);
                } else {
                    // Listened in widget.js
                    if (flt.target === "*") $rootScope.$broadcast("filterAll");
                }
            }
        }

        /**
         * Returns filter by index
         * @param {number} idx Filter index
         * @returns {object} Filter
         */
        function getFilter(idx) {
            if (!_this.items[idx]) return undefined;
            return _this.items[idx];
        }

        /**
         * Clear all filters
         */
        function clear() {
            _this.items = [];
        }
    }

    angular.module('app')
        .service('Filters', ['$rootScope', FiltersSvc]);

})();
