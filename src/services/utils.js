/**
 * Service contains utility functions
 */
(function() {
    'use strict';

    function UtilsSvc() {
        var _this = this;
        this.merge = mergeRecursive;

        /**
         * Merger all object properties to another
         * @param {object} obj1 Object to merge properties in
         * @param {object} obj2 Object to read properties from
         * @returns {object} obj1 contains all properties from obj2
         */
        function mergeRecursive(obj1, obj2) {
            for (var p in obj2) {
                //TODO: if (!obj2.hasOwnProperty(p)) continue;
                try {
                    // Property in destination object set; update its value.
                    if (obj2[p].constructor == Object) {
                        obj1[p] = mergeRecursive(obj1[p], obj2[p]);

                    } else {
                        obj1[p] = obj2[p];
                    }
                } catch (e) {
                    // Property in destination object not set; create it and set its value.
                    obj1[p] = obj2[p];
                }
            }
            return obj1;
        }

    }

    angular.module('app')
        .service('Utils', UtilsSvc);

})();
