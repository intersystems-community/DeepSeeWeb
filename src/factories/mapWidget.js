/**
 * Map widget class factory
 */
(function() {
    'use strict';

    function MapWidgetFact(CONST) {

        function MapWidget($scope) {
            var _this = this;
            $scope.model.textData = [];

            this._retrieveData = retrieveData;
            this.requestData();

            console.log("map widget!");

            /**
             * Fills widget with data retrieved from server
             * @param {object} result Result of MDX query
             */
            function retrieveData(result) {
                $scope.model.data = [];
                if (result) {
                }
            }
        }

        return MapWidget;
    }

    angular.module('widgets')
        .factory('MapWidget', ['CONST', MapWidgetFact]);

})();