(function() {
    'use strict';

    function TextWidgetFact(CONST) {

        function TextWidget($scope) {
            var _this = this;
            $scope.model.textData = [];


            this._retrieveData = retrieveData;
            this.requestData();

            function retrieveData(result) {
                $scope.model.textData = [];
                if (result) {
                    for (var i = 0; i < result.Cols[0].tuples.length; i++) {
                        var v = result.Data[i];
                        var fmt = result.Cols[0].tuples[i].format;
                        if (fmt) v = numeral(v).format(fmt);
                        var color = "#000";
                        if (_this.desc.tile) {
                            color = CONST.fontColors[_this.desc.tile.fontColor];
                        }
                        $scope.model.textData.push({ label: result.Cols[0].tuples[i].caption, value: v, color: color });
                    }
                }
            }
        }

        return TextWidget;
    }

    angular.module('widgets')
        .factory('TextWidget', ['CONST', TextWidgetFact]);

})();