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
             * Finds data property by name
             * @param {string} str Name
             * @returns {undefined|object} Data property
             */
            function findDataPropByName(str) {
                if (!_this.desc.dataProperties) return;
                for (var k = 0; k < _this.desc.dataProperties.length - 1; k++) if (_this.desc.dataProperties[k].dataValue === str) return _this.desc.dataProperties[k];
            }

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

                        var caption = result.Cols[0].tuples[i].caption;
                        var prop = findDataPropByName(result.Cols[0].tuples[i].dimension);
                        if (prop) {
                            if (prop.label === "$auto") caption = prop.dataValue || caption; else
                                caption = prop.label || caption;
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