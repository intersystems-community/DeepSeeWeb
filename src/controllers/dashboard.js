(function(){
    'use strict';

    function DashboardCtrl($scope, $routeParams, Connector) {
        $scope.model = {
            items: [],
            path: $routeParams.path
        };

        var controllerMap = {
            //areachart: "highCharts",
            //pivot: "pivot"
        };

        /*
        for (var i = 0; i < 10; i++) {
            $scope.model.items.push({title: i.toString()});
        }*/

        //console.log(Connector.getWidgets());


        this.retrieveData = function(result) {
            for (var i = 0; i < result.children.length; i++) {
                /*var item = {};
                item.title = result.children[i].title;

                var ctrl = controllerMap[result.children[i].type.toLowerCase()];
                if (!ctrl) ctrl = angular.module('widgets').controller('unsupported');
                item.controller = ctrl;*/
                var item = {};
                for (var attr in result.children[i]) { item[attr] = result.children[i][attr]; }
                $scope.model.items.push(item);
            }
        };

        this.onRequestError = function(e, status) {
            console.error("error: " + e.toString() + ", " + status);
        };

        Connector.getWidgets($routeParams.path).success(this.retrieveData).error(this.onRequestError);

    }

    angular.module('dashboard')
        .controller('dashboard', ['$scope', '$routeParams', 'Connector', DashboardCtrl]);

})();