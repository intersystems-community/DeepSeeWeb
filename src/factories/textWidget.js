(function() {
    'use strict';

    function TextWidgetFact() {

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
                        $scope.model.textData.push({ label: result.Cols[0].tuples[i].caption, value: v });
                    }
                }
            }
        }

        return TextWidget;
    }

    angular.module('widgets')
        .factory('TextWidget', TextWidgetFact);

})();