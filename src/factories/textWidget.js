/**
 * Text widget class factory
 */
(function() {
    'use strict';

    function TextWidgetFact(CONST, Storage) {

        function TextWidget($scope) {
            var _this = this;
            $scope.model.textData = [];
            var settings = Storage.getAppSettings();

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
                        var propFmt = '';
                        if (_this.desc && _this.desc.properties && _this.desc.properties.format) {
                            propFmt = _this.desc.properties.format;
                        }
                        // Format value
                        var v = result.Data[i];
                        var fmt = result.Cols[0].tuples[i].format || propFmt;
                        if (fmt) v = numeral(v).format(fmt);

                        // Change font color, if widget is displayed on tile
                        var color = "#000";
                        if (_this.desc.tile) {
                            color = $('.'+CONST.fontColors[_this.desc.tile.fontColor]).css('color')
                        }

                        var caption = result.Cols[0].tuples[i].caption;
                        var prop = findDataPropByName(result.Cols[0].tuples[i].dimension);
                        if (prop) {
                            if (prop.label === "$auto") caption = prop.dataValue || caption; else
                                caption = prop.label || caption;
                        }

                        if (caption.substr(0, 5).toLowerCase() === "delta") {
                            var idx = parseInt(caption.substring(5, caption.length)) - 1;
                            if (!isNaN(idx) && $scope.model.textData[idx] && v.toString() !== "0") {
                                if (v.toString()[0] !== "-")
                                    $scope.model.textData[idx].delta = "+" + v.toString();
                                else
                                    $scope.model.textData[idx].deltaNeg = v.toString();
                            }
                        } else {
                            var valueColor = color;
                            if (prop) {
                                var lower = prop.thresholdLower;
                                var upper = prop.thresholdUpper;

                                if (lower !== undefined && lower !== "" && _this.desc.properties.lowRangeColor) {
                                    if (parseFloat(v) < lower) valueColor = _this.desc.properties.lowRangeColor;
                                }
                                if (upper !== undefined && upper !== "" && _this.desc.properties.highRangeColor) {
                                    if (parseFloat(v) > upper) valueColor = _this.desc.properties.highRangeColor;
                                }
                            }

                            // Add parameter
                            $scope.model.textData.push({label: caption, value: v, color: color, valueColor: valueColor});
                        }
                    }
                }
            }
        }

        return TextWidget;
    }

    angular.module('widgets')
        .factory('TextWidget', ['CONST', 'Storage', TextWidgetFact]);

})();
