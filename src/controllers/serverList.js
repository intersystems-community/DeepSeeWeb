/**
 * Controller for servers list for mobile app
 * @view views/serverList.html
 */
(function(){
    'use strict';

    /**
     * @constructor
     */
    function ServerListCtrl($scope, $window, Storage, Utils, Error, Lang, $rootScope, Connector, ngDialog, CONST) {
        var _this         = this;
        $scope.model = {
            isDeleteMode: false,
            servers: []
        };

        try  {
            $scope.model.servers = JSON.parse(localStorage.serverList || '[]');
        } catch (ex) {
            $scope.model.servers = [];
            console.error(ex);
        }

        $scope.toggleDeleteMode = toggleDeleteMode;
        $scope.cancelDeleteMode = cancelDeleteMode;
        $scope.deleteServers = deleteServers;
        $scope.selectServer = selectServer;

        cancelDeleteMode();

        function selectServer(srv, e) {
            if (e.target.tagName.toUpperCase() === "INPUT") return;
            let idx = $scope.model.servers.indexOf(srv);
            if (idx === -1) return;
            localStorage.selectedServer = idx;
            $scope.ngDialogData.callback();
            $scope.closeThisDialog();
        }

        function toggleDeleteMode () {
            $scope.model.isDeleteMode = !$scope.model.isDeleteMode;
        }

        function cancelDeleteMode() {
            $scope.model.servers.forEach(s => s.doDelete = false);
            $scope.model.isDeleteMode = false;
        }

        function deleteServers() {
            $scope.model.servers = $scope.model.servers.filter(s => !s.doDelete);
            localStorage.serverList = JSON.stringify($scope.model.servers);
            cancelDeleteMode();
        }
    }


    angular.module('app')
        .controller('serverList', ['$scope', '$window', 'Storage', 'Utils', 'Error', 'Lang', '$rootScope', 'Connector', 'ngDialog', 'CONST', ServerListCtrl] );

})();