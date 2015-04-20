(function() {
    'use strict';

    function FiltersSvc($rootScope) {
        var _this = this;
        this.items = [];
        this.init = init;
        this.getWidgetFilters = getWidgetFilters;
        this.applyFilter = applyFilter;
        this.getFilter = getFilter;

        function init(filterArray) {
            _this.items = [];
            for (var i = 0; i < filterArray.length; i++) {
                _this.items.push(filterArray[i]);
                var lastFilter =  _this.items[_this.items.length - 1];
                lastFilter.targetArray = [];
                if ((lastFilter.target !== "*") && (lastFilter.target !== "")) lastFilter.targetArray = lastFilter.target.split(",");
                lastFilter.valueDisplay = findDisplayText(lastFilter);
            }
        }

        function findDisplayText(flt) {
            if (flt.value === "" || flt.value === undefined) return "";
            for (var i = 0; i < flt.values.length; i++) if (flt.values[i].path == flt.value) {
                flt.values[i].checked = true; //TODO: multiple filters
                flt.values[i].default = true;
                return flt.values[i].name;
            }
            return "";
        }

        // this is model representation of filters, not filters itself. to get filter use Filters.getFilter(flt.idx)
        function getWidgetFilters(widgetName) {
            var res = [];
            for (var i = 0; i < _this.items.length; i++) {
                if ((_this.items[i].target === "*") || (_this.items[i].targetArray.indexOf(widgetName) !== -1)) {
                    res.push({ idx: i, label: _this.items[i].label, text: _this.items[i].valueDisplay });
                    continue;
                }
            }
            return res;
        }

        function applyFilter(flt) {
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
            if (flt.targetArray.length !== 0) {
                for (i = 0; i < flt.targetArray.length; i++) $rootScope.$broadcast("filter" + flt.targetArray[i]);
            } else {
                if (flt.target === "*") $rootScope.$broadcast("filterAll");
            }
        }

        function getFilter(idx) {
            if (!_this.items[idx]) return undefined;
            return _this.items[idx];
        }

    }

    angular.module('app')
        .service('Filters', ['$rootScope', FiltersSvc]);

})();
