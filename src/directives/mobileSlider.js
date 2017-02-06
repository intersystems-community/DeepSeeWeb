/**
 * Directives for mobile widget slider scroll
 */
(function() {
    'use strict';

    angular.module('app')

        .directive('mobileSlider', ['$timeout', function($timeout) {
            return {
                restrict: 'AE',
                link: function (_scope, _element) {
                    if (!window.dsw.mobile) { return; }
                    var el = _element[0];
                    el.addEventListener('touchstart', touchStart, false);
                    el.addEventListener('touchend', touchEnd, false);
                    el.addEventListener('touchmove', touchMove, false);
                    var sx, ex, prevScrollPos, pos = 0;
                    var startTime;

                    function touchMove(e) {
                        // Check for allowed controls to be moved
                        var target = $(e.target);
                        //if (e.target.classList.contains('highcharts-navigator-handle-left') ||
                        //    e.target.classList.contains('highcharts-navigator-handle-right')) return;
                        //
                        if (target.parents(".lpt").length) {
                            return;
                        }
                        e.preventDefault();
                    }
                    function touchStart(e) {
                        sx = e.touches[0].screenX;
                        prevScrollPos = pos;
                        startTime = performance.now();
                    }

                    function touchEnd(e) {
                        ex = e.changedTouches[0].screenX;
                        var d = ex - sx;
                        var w = window.innerWidth;
                        pos += d;
                        var canSlide = $(e.target).parents('.mobile-filters-widget').length ==- 0;
                        if (Math.abs(d) < 50 || !canSlide || e.changedTouches.length !== 1 || (performance.now() - startTime > 300)) {
                            pos = prevScrollPos;
                            $(el).css('transform', 'translateX(-'+pos+'px)');
                        } else {
                            var scr = Math.floor(prevScrollPos / w);
                            if (d < 0) {
                                scr++;
                            } else {
                                scr--;
                            }
                            var count = _scope.model.items.filter(
                                function(el) {
                                    return el.toolbarView !== "src/views/emptyWidgetToolbar.html";
                                }).length - 1;
                            if (scr < 0) scr = 0;
                            if (scr > count) scr = count;
                            pos = scr * w;
                            $(el).css('transform', 'translateX(-'+pos+'px)');
                        }
                    }
                }
            };
        }]);


})();