(function(){
    'use strict';

    function FilterCtrl($scope, Filters) {
        var _this = this;
        // TODO: make clone here!
        this.source = $scope.ngDialogData;

        $scope.model =  {
            search: "",
            filter: this.source,
            values: []
        };

        $scope.acceptFilter = acceptFilter;
        $scope.removeFilter = removeFilter;

       /* this.values = [];*/
        for (var i = 0; i < this.source.values.length; i++) $scope.model.values.push(this.source.values[i]);

        $scope.onSearch = function() {
           if ($scope.model.search === "") {
               $scope.model.values = _this.source.values;
           } else {
               $scope.model.values = [];
               for (var i = 0; i < _this.source.values.length; i++) if (_this.source.values[i].name.toString().toLowerCase().indexOf($scope.model.search.toLowerCase()) != -1) {
                   $scope.model.values.push(_this.source.values[i]);
               }
           }
        };

        $scope.toogleRow = function(f) {
            //f.checked = !f.checked;
            for (var i = 0; i < _this.source.values.length; i++) _this.source.values[i].checked = false;
            f.checked = true;
        };

        function removeFilter() {
            for (var i = 0; i < _this.source.values.length; i++) _this.source.values[i].checked = false;
            Filters.applyFilter(_this.source);
            $scope.closeThisDialog();
        }

        function acceptFilter() {
            Filters.applyFilter(_this.source);
            $scope.closeThisDialog();
        }
    }

    angular.module('widgets')
        .controller('filter', ['$scope', 'Filters', FilterCtrl] );

})();