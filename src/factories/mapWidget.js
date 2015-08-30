/**
 * Map widget class factory
 */
(function() {
    'use strict';

    function MapWidgetFact(CONST, $timeout) {

        function MapWidget($scope) {
            var _this = this;
            this.CLUSTER_RANGE = 1;
            this.map = null;
            this.markers = null;
            this.iconStyle = null;
            this.popup = null;

            $scope.model.tooltip = {
                items: [],
                visible: false,
                name: "dsa"
            };
            this.onInit = onInit;
            this.onResize = onResize;

            this._retrieveData = retrieveData;
            this.requestData();

            /**
             * Fills widget with data retrieved from server
             * @param {object} result Result of MDX query
             */
            function retrieveData(result) {
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

                        var labels = [];
                        var values = [];
                        for (var j = 2; j < result.Cols[0].tuples.length; j++) {
                            labels.push(result.Cols[0].tuples[j].caption);
                            values.push(result.Data[k + j]);
                        }

                        var iconFeature = new ol.Feature({
                            geometry: point,
                            name: name,
                            labels: labels,
                            values: values,
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
                        src: 'img/map-marker-red.png'
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

                // Create popup
                _this.popup = new ol.Overlay({
                    element: $scope.tooltipElement,
                    positioning: 'bottom-center',
                    offset: [0, -40],
                    stopEvent: false
                });
                _this.map.addOverlay(_this.popup);


                _this.map.on('click', onMapClick);
                _this.map.on('pointermove', onPointerMove);
                //_this.map.getView().on('change:resolution', constrainPan);
                //_this.map.getView().on('change:center', constrainPan);
            }
/*
            function constrainPan() {
                var extent = [-10, -10, 10, 10];
                var view = _this.map.getView();
                var visible = view.calculateExtent(_this.map.getSize());
                var centre = view.getCenter();
                var delta;
                var adjust = false;
                if ((delta = extent[0] - visible[0]) > 0) {
                    adjust = true;
                    centre[0] += delta;
                } else if ((delta = extent[2] - visible[2]) < 0) {
                    adjust = true;
                    centre[0] += delta;
                }
                if ((delta = extent[1] - visible[1]) > 0) {
                    adjust = true;
                    centre[1] += delta;
                } else if ((delta = extent[3] - visible[3]) < 0) {
                    adjust = true;
                    centre[1] += delta;
                }
                if (adjust) {
                    view.setCenter(centre);
                }
            }*/

            function onPointerMove(e) {
                if (e.dragging) {
                    hideTooltip();
                    return;
                }
                var pixel = _this.map.getEventPixel(e.originalEvent);
                var hit = _this.map.hasFeatureAtPixel(pixel);
                 _this.map.getTarget().style.cursor = hit ? 'pointer' : '';
            }

            function onMapClick(evt) {
                var feature = _this.map.forEachFeatureAtPixel(evt.pixel,
                    function (feature, layer) {
                        return feature;
                    });
                if (feature) {
                    var labels = feature.get("features")[0].get("labels");
                    var values = feature.get("features")[0].get("values");
                    $scope.model.tooltip.items = [];
                    for (var i = 0; i < labels.length; i++) $scope.model.tooltip.items.push({label: labels[i], value: values[i]});
                    $scope.model.tooltip.name = feature.get("features")[0].get("name");

                    var geometry = feature.getGeometry();
                    var coord = geometry.getCoordinates();
                    coord[0] += Math.floor((_this.map.getCoordinateFromPixel(evt.pixel)[0] / 40075016.68) + 0.5) * 20037508.34 * 2;
                    _this.popup.setPosition(coord);
                    /*$(element).popover({
                        'placement': 'top',
                        'html': true,
                        'content': feature.get('name')
                    });*/
                    //$(element).popover('show');
                    showTooltip();
                } else {
                    hideTooltip();
                    //$(element).popover('destroy');
                }
                $scope.$apply();
            }

            function showTooltip() {
                $scope.model.tooltip.visible = true;
            }

            function hideTooltip() {
                $scope.model.tooltip.visible = false;
            }

            function onResize() {
                if (_this.map) _this.map.updateSize();
            }
        }

        return MapWidget;
    }

    angular.module('widgets')
        .factory('MapWidget', ['CONST', '$timeout', MapWidgetFact]);

})();