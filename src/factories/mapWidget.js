/**
 * Map widget class factory
 */
(function() {
    'use strict';

    function MapWidgetFact(CONST) {

        function MapWidget($scope) {
            var _this = this;
            this.map = null;
            this.iconStyle = null;

            $scope.model.textData = [];
            this.onInit = onInit;

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
                        var lat = result.Data[k % size + 0];
                        var lon = result.Data[k % size + 1];
                        var name = result.Cols[1].tuples[i].caption;

                        var iconFeature = new ol.Feature({
                            //geometry: new ol.geom.Point(ol.proj.transform([lat, lon], 'EPSG:4326', 'EPSG:900913')),
                            geometry: new ol.geom.Point([lon, lat]),
                            name: name,
                            k: k
                        });
                        //iconFeature.getGeometry().transform(new ol.proj("EPSG:4326"), new ol.proj("EPSG:900913"));

                        features.push(iconFeature);
                        k += size;
                    }
                    var vectorSource = new ol.source.Vector({
                        features: features
                    });

                    var vectorLayer = new ol.layer.Vector({
                        projection: 'EPSG:3857',
                        source: vectorSource,
                        style: _this.iconStyle
                    });

                    _this.map.addLayer(vectorLayer);

                }
            }

            function onInit(map) {
                _this.map = map;
                _this.iconStyle = new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        opacity: 0.75,
                        src: 'img/map-marker-red.png'
                    })
                });
            }
        }

        return MapWidget;
    }

    angular.module('widgets')
        .factory('MapWidget', ['CONST', MapWidgetFact]);

})();