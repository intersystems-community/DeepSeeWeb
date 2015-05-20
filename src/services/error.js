(function() {
    'use strict';

    function ErrorSvc(notify) {
        notify.config({
            startTop: 56,
            position: "center"
        });

        this.show = function(txt) {
            console.error(txt);
            notify({ message: txt, classes: ['gmail-notify'] });
        };
    }

    angular.module('app')
        .service('Error', ['notify', ErrorSvc]);

})();
