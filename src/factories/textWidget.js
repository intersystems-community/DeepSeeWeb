/**
 * Text widget class factory
 */
(function() {
    'use strict';

    function TextWidgetFact(CONST) {

        function TextWidget($scope) {
            var _this = this;
            $scope.model.textData = [];

            this._retrieveData = retrieveData;
            this.requestData();

            /**
             * Fills widget with data retrieved from server
             * @param {object} result Result of MDX query
             */
            function retrieveData(result) {
                $scope.model.textData = [];
                if (result) {
                    for (var i = 0; i < result.Cols[0].tuples.length; i++) {
                        // Format value
                        var v = result.Data[i];
                        var fmt = result.Cols[0].tuples[i].format;
                        if (fmt) v = numeral(v).format(fmt);

                        // Change font color, if widget is displayed on tile
                        var color = "#000";
                        if (_this.desc.tile) {
                            color = CONST.fontColors[_this.desc.tile.fontColor];
                        }

                        // Check if caption exists in dataProperties
                        var caption = result.Cols[0].tuples[i].caption;
                        if (_this.desc.dataProperties && _this.desc.dataProperties[i]) {
                            if (_this.desc.dataProperties[i].label === "$auto") caption = _this.desc.dataProperties[i].dataValue || caption; else
                                caption = _this.desc.dataProperties[i].label || caption;
                        }

                        // Add parameter
                        $scope.model.textData.push({ label: caption, value: v, color: color });
                    }
                }
            }
        }

        return TextWidget;
    }

    angular.module('widgets')
        .factory('TextWidget', ['CONST', TextWidgetFact]);

})();