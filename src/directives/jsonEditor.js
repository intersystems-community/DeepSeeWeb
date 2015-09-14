/**
 * Directives for working with element focus and "return" key
 */
(function() {
    'use strict';

    angular.module('app')

    /**
     * Sets focus automatically to element
     */
        .directive('jsonEditor', ['$q', function($q) {
            return {
                restrict: 'AC',
                link: function (scope, element) {


                    function loadjscssfile(filename, filetype, callback){
                        var fileref;
                        if (filetype=="js"){ //if filename is a external JavaScript file
                            fileref=document.createElement('script');
                            fileref.setAttribute("type","text/javascript");
                            fileref.setAttribute("src", filename);
                        }
                        else if (filetype=="css"){ //if filename is an external CSS file
                            fileref=document.createElement("link");
                            fileref.setAttribute("rel", "stylesheet");
                            fileref.setAttribute("type", "text/css");
                            fileref.setAttribute("href", filename);
                        }
                        if (typeof fileref!="undefined") {
                            fileref.onload = callback;
                            document.getElementsByTagName("head")[0].appendChild(fileref, 0);
                        }
                    }

                    element.removeAttr('map-widget');

                    var sc = $q.defer();
                    var css = $q.defer();

                    loadjscssfile("https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/4.2.1/jsoneditor.js", "js", function(){sc.resolve();});
                    loadjscssfile("https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/4.2.1/jsoneditor.min.css", "css", function(){css.resolve();});

                    (function(el, scope) {
                        $q.all([sc.promise, css.promise]).then(function() {
                            scope.editor = new JSONEditor(el[0], {mode: "code", indentation: 4});
                            if (scope.onInit) scope.onInit();
                        });
                    })(element, scope);
                }
            };
        }]);

})();