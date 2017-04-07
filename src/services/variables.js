/**
 * Service to store all filters on dashboard
 */
(function() {
    'use strict';

    function VariablesSvc($rootScope) {
        var _this = this;
        this.items = [];
        this.init = init;
        this.clear = clear;
        this.isExists = isExists;
        this.widgets = [];

        /**
         * Initialize service
         */
        function init(result) {
            _this.items = [];
            _this.widgets = [];
            if (!result.widgets) return;
            for (var i = 0; i < result.widgets.length; i++) {
                var w = result.widgets[i];
                _this.widgets.push(w);
                for (var j = 0; j < w.controls.length; j++) {
                    if (w.controls[j].action.toLowerCase() === 'applyvariable') {
                        _this.items.push(w.controls[j]);
                    }
                }
            }
        }

        /**
         * Clear all variables
         */
        function clear() {
            _this.items = [];
        }

        function isExists() {
            return _this.items.length !== 0;
        }
    }

    angular.module('app')
        .service('Variables', ['$rootScope', VariablesSvc]);

})();
