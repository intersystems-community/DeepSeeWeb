/**
 * Map widget class factory
 */
(function() {
    'use strict';

    function MapWidgetFact(CONST, $timeout) {

        function MapWidget($scope) {
            var _this = this
            this.CLUSTER_RANGE = 1;
            this.map = null;
            this.markers = null;
            this.iconStyle = null;

            $scope.model.textData = [];
            this.onInit = onInit;
            this.onResize = onResize;

            this._retrieveData = retrieveData;
            this.requestData();

            /**
             * Fills widget with data retrieved from server
             * @param {object} result Result of MDX query
             */
            function retrieveData(result) {
                $scope.model.data = [];
                if (result && _this.map) {
                    var size = result.Cols[0].tuples.length;
                    var k = 0;
                    var features = [];
                    for (var i = 0; i < result.Cols[1].tuples.length; i++) {
                        var lat = result.Data[k + 0];
                        var lon = result.Data[k + 1];
                        var name = result.Cols[1].tuples[i].caption;

                        var point = new ol.geom.Point([lon, lat]);
                        point.transform('EPSG:4326', 'EPSG:900913');

                        var iconFeature = new ol.Feature({
                            geometry: point,
                            name: name,
                            k: k
                        });

                        features.push(iconFeature);
                        k += size;
                    }
                    _this.markers.clear();
                    _this.markers.addFeatures(features);
                    _this.map.updateSize();
                  /*  var vectorSource = new ol.source.Vector({
                        features: features
                    });

                    var clusterSource = new ol.source.Cluster({
                        distance: _this.CLUSTER_RANGE,
                        source: vectorSource
                    });

                    var vectorLayer = new ol.layer.Vector({
                        source: clusterSource,
                        style: _this.iconStyle
                    });

                    _this.map.addLayer(vectorLayer);*/

                }
            }

            /**
             * Called after widget is initialized by directive
             * @param {object} map OpenLayer3 map object
             */
            function onInit(map) {
                _this.map = map;
                $timeout(onResize, 0);

                // Create style for marker
                _this.iconStyle = new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 40],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        opacity: 1,
                        src: 'http://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi.png'
                        //src: 'img/map-marker-red.png'
                    })
                });

                // Setup clustering
                _this.markers = new ol.source.Vector({
                    features: []
                });
                var clusterSource = new ol.source.Cluster({
                    distance: _this.CLUSTER_RANGE,
                    source: _this.markers
                });

                // Create layer for markers
                var vectorLayer = new ol.layer.Vector({
                    source: clusterSource,
                    style: _this.iconStyle
                });
                _this.map.addLayer(vectorLayer);
            }

            function onResize() {
                if (_this.map) _this.map.updateSize();
                console.log("resize");
            }
        }

        return MapWidget;
    }

    angular.module('widgets')
        .factory('MapWidget', ['CONST', '$timeout', MapWidgetFact]);

})();