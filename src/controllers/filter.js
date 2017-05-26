/**
 * Controller for filter modal window. Window is appears when user clicked filter button(or field) on widget
 * @view views/filter.html
 */
(function(){
    'use strict';

    function FilterCtrl($scope, Filters, Connector, Error, Storage, Variables) {
        var _this = this;
        var settings      = Storage.getAppSettings();

        this.isRelatedFilters = settings.isRelatedFilters === undefined ? true : settings.isRelatedFilters;

        this.widget = $scope.ngDialogData.widget;
        this.source = $scope.ngDialogData.filter;
        this.dataSource = $scope.ngDialogData.dataSource;

        $scope.model =  {
            search: "",
            isLoading: false,
            filter: this.source,
            values: [],
            isAll: false,
            isExclude: _this.source.isExclude === true,
            isInterval: _this.source.isInterval === true
        };

        // Check for related filters
        if (this.isRelatedFilters/* && Filters.filtersChanged*/) {
            requestRelatedFilters();
        } else {
            prepareFilters();
        }

        $scope.acceptFilter = acceptFilter;
        $scope.removeFilter = removeFilter;
        $scope.setAll = setAll;
        $scope.onItemSelect = onItemSelect;
        $scope.searchFilters = searchFilters;
        $scope.onSearch = onSearch;
        $scope.toggleRow = toggleRow;
        $scope.isIntervalControlsVisible = isIntervalControlsVisible;
        $scope.model.isAll = !isAnyChecked();


        /**
         * Requests filters from server
         */
        function requestRelatedFilters() {
            let ds = getDataSource();
            if (!ds) return;
            let related = [];
            let filters = Filters.items;
            // Get active filters
            let activeFilters = filters.filter(f => (f.targetProperty !== _this.source.targetProperty) && f.value !== "" || f.isInterval);
            // Reformat to DSZ filters
            activeFilters.forEach(f => {
                f.Value = f.value;
                if (f.isExclude) f.Value = f.Value.split('|').map(v => v += '.%NOT').join('|');
                if (f.isInterval) f.Value = f.Value.replace('|', ':');
                if (f.value.indexOf('|') !== -1) f.Value = '{' + f.Value.replace(/\|/g,',') + '}';
            });
            activeFilters = activeFilters.map(f => ({Filter: f.targetProperty, Value: f.Value}));
            $scope.model.isLoading = true;
            Connector
                .searchFilters('', ds, activeFilters, [_this.source.targetProperty])
                .catch(onError)
                .then(onFilterValuesReceived);
        }

        /**
         * Returns data source of widget for current filter
         * @returns {undefined|string} Data source string
         */
        function getDataSource() {
            let widgets = Variables.widgets;
            let w;
            let target = _this.source.target;
            if (target === '*' || !target) {
                w = widgets[0];
            } else {
                w = widgets.find(wi => wi.name === target);
            }
            if (!w) return;
            return w.dataSource;
        }

        /**
         * Initialize filters data
         */
        function prepareFilters() {
            Filters.filtersChanged = false;
            $scope.model.values = [];
            for (var i = 0; i < _this.source.values.length; i++) $scope.model.values.push(_this.source.values[i]);
            if ($scope.model.values.length !== 0) {
                if ($scope.model.values[_this.source.fromIdx]) $scope.model.from =$scope.model.values[_this.source.fromIdx];
                else
                    $scope.model.from = $scope.model.values[0];
                if ($scope.model.values[_this.source.toIdx]) $scope.model.to =$scope.model.values[_this.source.toIdx];
                else
                    $scope.model.to = $scope.model.values[0];
            }
        }

        /**
         * Search input onChange callback. Searches filter values by input text
         */
        function onSearch() {
            if ($scope.model.search === "") {
                $scope.model.values = _this.source.values;
            } else {
                $scope.model.values = [];
                for (var i = 0; i < _this.source.values.length; i++) if (_this.source.values[i].name.toString().toLowerCase().indexOf($scope.model.search.toLowerCase()) != -1) {
                    $scope.model.values.push(_this.source.values[i]);
                }
            }
        }

        /**
         * Selects one row. ("td" onclick event handler)
         * @param {object} f Row object
         */
        function toggleRow(f) {
            for (var i = 0; i < _this.source.values.length; i++) _this.source.values[i].checked = false;
            f.checked = true;
            $scope.model.isAll = !f.checked;
        }

        /**
         * Returns true if interval controls are visible
         * @returns {boolean} Is interval controls are visible
         */
        function isIntervalControlsVisible() {
            return $scope.model.isInterval === true;
        }

        /**
         * Item select callback(checkbox onClick event handler)
         */
        function onItemSelect() {
            $scope.model.isAll = !isAnyChecked();
        }

        /**
         * Selects all items
         */
        function setAll() {
            $scope.model.isAll = true;
            $scope.model.isExclude = false;
            $scope.model.isInterval = false;
            for (var i = 0; i < _this.source.values.length; i++) _this.source.values[i].checked = false;
        }

        /**
         * Is any item checked
         * @returns {boolean} True if any item is checked
         */
        function isAnyChecked() {
            for (var i = 0; i < _this.source.values.length; i++) if (_this.source.values[i].checked) return true;
            return false;
        }

        /**
         * Request filters from server by search string. (handles onEnter event on search input)
         */
        function searchFilters() {
            let ds = getDataSource();
            if (!ds) return;
            var searchStr = $scope.model.search;
            if (!searchStr) return;
            $scope.model.isLoading = true;
            Connector
                .searchFilters(searchStr, ds)
                .catch(onError)
                .then(onFilterValuesReceived);
        }

        /**
         * Data retrieved callback for searchFilters() request
         * @param {object} result Filter data
         */
        function onFilterValuesReceived(result) {
            $scope.model.isLoading = false;
            if (!result) return;

            // Find global filter to update its values
            var filters = result.children.filter(function(el) { return el.path === _this.source.targetProperty; } );
            if (filters.length === 0) return;
            var filter = filters[0];
            if (!filter.children || filter.children.length === 0) return;

            // Path current filter modifications(selected state, etc.) to newly received values
            let oldFilters = _this.source.values.slice();
            filter.children.forEach(f => {
               let o = oldFilters.find(flt => flt.path === f.path);
                if (o) Object.assign(f, o);
            });

            // Update model values
            _this.source.values = filter.children;

            // Prepare filter values
            prepareFilters();

            // Recreate filters
            //Filters.init(Filters.items.slice());
        }

        /**
         * Request error handling callback
         * @param {object} e Error
         * @param {string} status Status text
         */
        function onError(e, status) {
            $scope.model.isLoading = false;
            // TODO: Lang
            Error.show("Error " + status.toString());
        }

        /**
         * Dismiss filter and close dialog
         */
        function removeFilter() {
            for (var i = 0; i < _this.source.values.length; i++) _this.source.values[i].checked = false;
            Filters.applyFilter(_this.source);
            _this.widget.updateFiltersText();
            $scope.closeThisDialog();
        }

        /**
         * Accepts filter and close dialog
         */
        function acceptFilter() {
            _this.source.isExclude = $scope.model.isExclude;
            _this.source.isInterval = $scope.model.isInterval;
            if (_this.source.isInterval) {
                _this.source.fromIdx = $scope.model.values.indexOf($scope.model.from);
                _this.source.toIdx = $scope.model.values.indexOf($scope.model.to);
            } else {
                delete _this.source.from;
                delete _this.source.to;
            }
            Filters.applyFilter(_this.source);
            Filters.filtersChanged = true;
            $scope.closeThisDialog();
        }
    }

    angular.module('widgets')
        .controller('filter', ['$scope', 'Filters', 'Connector', 'Error', 'Storage', 'Variables', FilterCtrl] );

})();