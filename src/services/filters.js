/**
 * Service to store all filters on dashboard
 */
(function() {
    'use strict';

    function FiltersSvc($rootScope, Connector, Storage, Lang) {
        var _this = this;
        this.items = [];
        this.isFiltersOnToolbarExists = false;
        this.init = init;
        this.getWidgetModelFilters = getWidgetModelFilters;
        this.getWidgetFilters = getWidgetFilters;
        this.applyFilter = applyFilter;
        this.getFilter = getFilter;
        this.clear = clear;
        this.getClickFilterTarget = getClickFilterTarget;
        this.getAffectsFilters = getAffectsFilters;
        this.dashboard = '';

        /**
         * Initialize service with filter array
         * @param {Array} filterArray Filter array
         */
        function init(filterArray, dashboard) {
            _this.dashboard = dashboard;
            _this.items = [];
            _this.isFiltersOnToolbarExists = false;
            for (var i = 0; i < filterArray.length; i++) {
                //if (filterArray[i].type === "hidden") continue;
                _this.items.push(filterArray[i]);
                var flt =  _this.items[_this.items.length - 1];

                // Check for valueList
                if (flt.valueList && flt.displayList) {
                    let vals = flt.valueList.split(',');
                    let txt =  flt.displayList.split(',');
                    flt.values = [];
                    for (let i = 0; i < vals.length; i++) flt.values.push({name: txt[i], path: vals[i]});
                }

                flt.targetArray = [];
                if ((flt.target !== "*") && (flt.target !== "")) flt.targetArray = flt.target.split(",").concat(["emptyWidget"]);
                flt.sourceArray = [];
                if ((flt.source !== "*") && (flt.source !== "") && (flt.location !== "dashboard")) flt.sourceArray = flt.source.split(",");
                if (flt.source === "" || flt.location === "dashboard") _this.isFiltersOnToolbarExists = true;

                // Parse additional filter parameters placed in filter label as comment
                if (flt.label) {
                    // Find commented part as /* text */
                    var parts = flt.label.match(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/g);
                    if (parts && parts.length !== 0) {
                        var params = parts[0].substring(2, parts[0].length - 2);
                        flt.additionalParams = params.toLowerCase().trim().split(',');
                        console.log(params);

                        if (flt.additionalParams.indexOf('inverseorder') !== -1) flt.values = flt.values.reverse();
                        if (flt.additionalParams.indexOf('ignorenow') !== -1) flt.values = flt.values.filter(function(v) { return v.path.toLowerCase() !== '&[now]';});
                    }
                    flt.label = flt.label.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/g, '');
                }

                flt.valueDisplay = findDisplayText(flt);
            }

            loadFiltersFromSettings();
        }

        /**
         * Load saved filter values from settings
         */
        function loadFiltersFromSettings() {
            if (!Storage.getAppSettings().isSaveFilters) return;
            var found = false;
            var widgets = Storage.getWidgetsSettings(_this.dashboard, Connector.getNamespace());
            if (widgets._filters) {
                for (var i = 0; i < widgets._filters.length; i++) {
                    var flt = widgets._filters[i];

                    var exists = _this.items.filter(function(el) { return el.targetProperty === flt.targetProperty; })[0];
                    if (exists) {
                        // Check for single value
                        exists.value = flt.value;
                        exists.isExclude = flt.isExclude;
                        exists.isInterval = flt.isInterval;

                        if (exists.isInterval) {
                            exists.fromIdx = flt.fromIdx;
                            exists.toIdx = flt.toIdx;
                            exists.valueDisplay = exists.values[exists.fromIdx].name + ':' + exists.values[exists.toIdx].name;
                        } else {
                            var values = flt.value.split('|');

                            // Multiple values was selected
                            exists.values.forEach(function (v) {
                                if (values.indexOf(v.path) !== -1) v.checked = true;
                            });

                            exists.valueDisplay = flt.value.split('|').map(el => {
                                let isNot = el.indexOf('.%NOT') !== -1;
                                if (isNot) el = el.replace('.%NOT', '');
                                let v = exists.values.find(e => e.path == el);
                                let name = '';
                                if (v && v.name) name = v.name.toString();
                                return (isNot ? Lang.get('not') + ' ' : '') + name;
                            }).join(',');
                        }

                        found = true;
                    }
                }
            }
        }

        function getClickFilterTarget(widgetName) {
            for (var i = 0; i < _this.items.length; i++) {
                var flt = _this.items[i];
                if (flt.location !== "click") continue;
                if (flt.source.toLowerCase() === widgetName.toLowerCase() || flt.source === "*") return flt.target;
            }
        }

        /**
         * Return all filters that affects on widget
         * @param {string} widgetName Widget name
         * @returns {Array.<object>} Filter list
         */
        function getAffectsFilters(widgetName) {
            return _this.items.filter(e => (e.target === "*" || e.targetArray.indexOf(widgetName) !== -1));
        }

        /**
         * Returns filter display text
         * @param {object} flt Filter
         * @returns {string} Filter display text
         */
        function findDisplayText(flt) {
            if (flt.value === "" || flt.value === undefined) return "";
            var value = flt.value;
            var isExclude = false;
            if (typeof value === 'string') isExclude = value.toUpperCase().endsWith(".%NOT");
            if (isExclude) value = value.substr(0, value.length - 5);
            flt.value = value;
            for (var i = 0; i < flt.values.length; i++) if (flt.values[i].path === value) {
                flt.values[i].checked = true;
                flt.values[i].default = true;
                flt.defaultExclude = isExclude;
                flt.isExclude = isExclude;
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
                if (_this.items[i].type === "hidden") continue;
                //if ((_this.items[i].target === "*") || (_this.items[i].targetArray.indexOf(widgetName) !== -1)) {
                if (_this.items[i].location === "click") continue;
                if (widgetName === "emptyWidget") {
                    if (_this.items[i].source === "" || _this.items[i].location === "dashboard") {
                        res.push({ idx: i, label: _this.items[i].label, text: _this.items[i].valueDisplay, info: _this.items[i].info });
                        continue;
                    }
                }
                if ( _this.items[i].location === "dashboard") continue;
                if ((_this.items[i].source === "*") || (_this.items[i].sourceArray.indexOf(widgetName) !== -1)) {
                    res.push({ idx: i, label: _this.items[i].label, text: _this.items[i].valueDisplay, info: _this.items[i].info });
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
                    for (i = 0; i < flt.targetArray.length; i++) $rootScope.$broadcast("filter" + flt.targetArray[i], flt);
                } else {
                    // Listened in widget.js
                    if (flt.target === "*") $rootScope.$broadcast("filterAll", flt);
                }
            }
            saveFilters();
        }

        /**
         * Saves dashboard filters
         */
        function saveFilters() {
            var settings = Storage.getAppSettings();
            if (settings.isSaveFilters === false) return;

            var i, flt;
            var active = [];
            for (i = 0; i < _this.items.length; i++) {
                flt = _this.items[i];
                if (flt.value !== "" || flt.isInterval) {
                    active.push(flt);
                }
            }
            var res = active.map(e => {
                return {
                    targetProperty: e.targetProperty,
                    value: e.value,
                    isExclude: e.isExclude,
                    isInterval: e.isInterval,
                    fromIdx: e.fromIdx,
                    toIdx: e.toIdx
                }
            });

            var widgets = Storage.getWidgetsSettings(_this.dashboard, Connector.getNamespace());
            if (res.length) {
                widgets._filters = res;
            } else {
                delete widgets._filters;
            }
            Storage.setWidgetsSettings(widgets, _this.dashboard, Connector.getNamespace());
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
        .service('Filters', ['$rootScope', 'Connector', 'Storage', 'Lang', FiltersSvc]);

})();
