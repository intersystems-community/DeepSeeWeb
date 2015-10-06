/**
 * Map widget class factory
 */
(function() {
    'use strict';

    function MapWidgetFact(CONST, $timeout, Connector) {

        function MapWidget($scope) {
            var _this = this;
            this.CLUSTER_RANGE = 1;
            this.map = null;
            this.markers = null;
            this.polys = null;
            this.iconStyle = null;
            this.popup = null;
            _this.featureOverlay = null;
            $scope.model.tooltip = {
                items: [],
                visible: false,
                name: "dsa"
            };
            this.onInit = onInit;
            this.onResize = onResize;
            this._retrieveData = retrieveData;
            this.requestData();
            _this.mapData = null;
            requestPolygons();


            var polys = null;

            function requestPolygons() {
                if (!_this.desc.properties || !_this.desc.properties.coordsJsFile) return;
                var fileName = _this.desc.properties.coordsJsFile;
                /*var fn = fileName.split(".");
                fn.pop();
                fn.push("json");
                fileName = fn.join(".");*/

                var url = "/csp/" + Connector.getNamespace() + "/" + fileName;

                Connector.getFile(url).success(onPolyFileLoaded);
            }

            function onPolyFileLoaded(result) {
                polys = {};
                result = "(" + result + ")(polys)";
                // TODO: make safe eval
                eval(result);
                //setTimeout(buildPolygons, 2000);
                buildPolygons();
            }

            function getFeatureColor(name) {
                var item = _this.mapData.Cols[1].tuples.filter(function(el) { return el.caption === name; });
                if (item.length === 0) return;
                item = item[0];
                var idx = _this.mapData.Cols[1].tuples.indexOf(item);
                var l = _this.mapData.Cols[0].tuples.length;
                var color = _this.mapData.Cols[0].tuples.filter(function(el) { return el.caption === "color"; });
                if (color.length === 0) return;
                color = color[0]
                var colorIdx = _this.mapData.Cols[0].tuples.indexOf(color);
                var col = _this.mapData.Data[idx * l + colorIdx];
                if (col.indexOf("rgba") === -1) {
                    col = col.replace("rgb", "rgba");
                    col = col.substr(0, col.length - 1) + ", 0)";
                }
                var parts = col.split(",");
                parts[3] = "0.4)";
                return parts.join(",");
            }

            function buildPolygons() {
                if (!polys || !_this.map || !_this.mapData) return;
                var features = [];

                /*var polyCoords = [];
                var coords = "95.61,38.60 95.22,37.98 95.60,37.66 94.97,37.65".split(' ');

                for (var i in coords) {
                    var c = coords[i].split(',');
                    polyCoords.push(ol.proj.transform([parseFloat(c[0]), parseFloat(c[1])], 'EPSG:4326', 'EPSG:3857'));
                }

                var feature = new ol.Feature({
                    geometry: new ol.geom.Polygon([polyCoords])
                });
                features.push(feature);
                _this.polys.clear();
                _this.polys.addFeatures(features);
                return;*/

                var min = [Number.MAX_VALUE, Number.MAX_VALUE];
                var max = [Number.MIN_VALUE, Number.MIN_VALUE];

                var count = 0;

                for (var p in polys) {

                    var parts = polys[p].split(';');
                    var poly = [];
                    count++;
                    if (count === 23) continue;


                    for (var k = 0; k < parts.length; k++) {

                        var coords = parts[k].split(' ');
                        /*
                        if (coords.length > 500) {
                            var h = 0;
                            while (h < coords.length) {
                                coords.splice(h, 3);
                                h += 6;
                            }
                        }*/
                        var polyCoords = [];
                        for (var i in coords) {
                            var c = coords[i].split(',');
                            var lon = parseFloat(c[0]);
                            var lat = parseFloat(c[1]);
                            var point = new ol.geom.Point([lon, lat]);
                            point.transform('EPSG:4326', 'EPSG:900913');
                            polyCoords.push(point.getCoordinates());
                        }
                        poly.push(polyCoords);
                    }
                    //if (count === 23) console.log(JSON.stringify( poly));
                    var feature = new ol.Feature({
                        geometry: new ol.geom.Polygon(poly),
                        key: p
                    });

                    feature.setStyle(new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: getFeatureColor(p) || "none"
                        }),
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 0, 0.3)',
                            width: 1
                        })
                    }));

                    features.push(feature);



                    if (parseFloat(lon) < min[0]) min[0] = parseFloat(lon);
                    if (parseFloat(lat) < min[1]) min[1] = parseFloat(lat);
                    if (parseFloat(lon) > max[0]) max[0] = parseFloat(lon);
                    if (parseFloat(lat) > max[1]) max[1] = parseFloat(lat);

                    if (min[0] == max[0]) {
                        min[0] -= 0.25;
                        max[0] += 0.25;
                    }
                    if (min[1] == max[1]) {
                        min[1] -= 0.25;
                        max[1] += 0.25;
                    }
                }

                _this.polys.clear();
                _this.polys.addFeatures(features);

                var p1 = ol.proj.transform([min[0], min[1]], 'EPSG:4326', 'EPSG:900913');
                var p2 = ol.proj.transform([max[0], max[1]], 'EPSG:4326', 'EPSG:900913');
                if (features.length !== 0) _this.map.getView().fit([p1[0], p1[1], p2[0], p2[1]], _this.map.getSize());
                _this.map.updateSize();
            }

            /**
             * Fills widget with data retrieved from server
             * @param {object} result Result of MDX query
             */
            function retrieveData(result) {
                _this.mapData = result;
                buildPolygons();
                var min = [Number.MAX_VALUE, Number.MAX_VALUE];
                var max = [Number.MIN_VALUE, Number.MIN_VALUE];

                if (result && _this.map) {
                    var size = result.Cols[0].tuples.length;
                    var k = 0;
                    var features = [];

                    var latIdx = -1;
                    var lonIdx = -1;
                    var item = result.Cols[0].tuples.filter(function(el) { return el.caption.toLowerCase() === "longitude"; });
                    if (item.length !== 0) lonIdx = result.Cols[0].tuples.indexOf(item[0]);
                    item = result.Cols[0].tuples.filter(function(el) { return el.caption.toLowerCase() === "latitude"; });
                    if (item.length !== 0) latIdx = result.Cols[0].tuples.indexOf(item[0]);

                    if (lonIdx === -1 || latIdx === -1) return;

                    for (var i = 0; i < result.Cols[1].tuples.length; i++) {
                        var lat = parseFloat(result.Data[k+latIdx] || 0);
                        var lon = parseFloat(result.Data[k+lonIdx] || 0);
                        var name = result.Cols[1].tuples[i].caption;

                        var point = new ol.geom.Point([lon, lat]);
                        //var point = new ol.geom.Point([48.584626, 53.1613304]);
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
                        if (parseFloat(lon) < min[0]) min[0] = parseFloat(lon);
                        if (parseFloat(lat) < min[1]) min[1] = parseFloat(lat);
                        if (parseFloat(lon) > max[0]) max[0] = parseFloat(lon);
                        if (parseFloat(lat) > max[1]) max[1] = parseFloat(lat);

                        if (min[0] == max[0]) {
                            min[0] -= 0.25;
                            max[0] += 0.25;
                        }
                        if (min[1] == max[1]) {
                            min[1] -= 0.25;
                            max[1] += 0.25;
                        }

                        features.push(iconFeature);
                        k += size;
                    }

                    console.log("bounds: ", min, " - ", max);

                    _this.markers.clear();
                    _this.markers.addFeatures(features);

                    //_this.map.getView().setCenter();
                    //p.transform('EPSG:4326', 'EPSG:900913');
                    //var ex = _this.map.getView().calculateExtent(ol.proj.transform([max[0] - min[0], max[1] - min[1]], 'EPSG:4326', 'EPSG:900913'));
                    var p1 = ol.proj.transform([min[0], min[1]], 'EPSG:4326', 'EPSG:900913');
                    var p2 = ol.proj.transform([max[0], max[1]], 'EPSG:4326', 'EPSG:900913');
                    if (features.length !== 0) _this.map.getView().fit([p1[0], p1[1], p2[0], p2[1]], _this.map.getSize());


                    //_this.map.getView().setZoom(max[1] - max[0] / 10);
                    //_this.map.getView().setCenter(ol.proj.transform([min[0] + (max[0] - min[0])/2, min[1] + (max[1] - min[1])/2], 'EPSG:4326', 'EPSG:900913'));

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


                _this.polyStyle = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.5)',
                        width: 1
                    })/*,
                    fill: new ol.style.Fill({
                        color: 'yellow'
                    })*/
                });

                _this.hoverStyle = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'blue',
                        width: 2
                    })
                });

                // Setup polys
                _this.polys = new ol.source.Vector({
                    features: []
                });
                var vectorLayer = new ol.layer.Vector({
                    source: _this.polys,
                    style: _this.polyStyle
                });
                _this.map.addLayer(vectorLayer);

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

                // Create overlay for hover
                var collection = new ol.Collection();
                _this.featureOverlay = new ol.layer.Vector({
                    map: map,
                    source: new ol.source.Vector({
                        features: collection,
                        useSpatialIndex: false // optional, might improve performance
                    }),
                    style: _this.hoverStyle ,
                    updateWhileAnimating: true, // optional, for instant visual feedback
                    updateWhileInteracting: true // optional, for instant visual feedback
                });

                _this.map.addLayer(_this.featureOverlay);

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

                var feature = _this.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                    return feature;
                });
                _this.featureOverlay.getSource().clear();
                if (feature) _this.featureOverlay.getSource().addFeature(feature);
            }

            function getTooltipData(name) {
                if (!_this.mapData) return;
                var res = [];
                //[{label: 'aa', value: 'ff'}]
                var item = _this.mapData.Cols[1].tuples.filter(function(el) { return el.caption === name; });
                if (item.length === 0) return;
                item = item[0];
                var idx = _this.mapData.Cols[1].tuples.indexOf(item);
                var l = _this.mapData.Cols[0].tuples.length;
                var tooltip = _this.mapData.Cols[0].tuples.filter(function(el) { return el.caption === "tooltip"; });
                if (tooltip.length === 0) return;
                tooltip = tooltip[0]
                var tooltipIdx = _this.mapData.Cols[0].tuples.indexOf(tooltip);
                res.push({label: "", value: _this.mapData.Data[idx * l + tooltipIdx].split(":")[1] || ""});
                //for (var i = 0; i < l; i++) {
                    //res.push({label: _this.mapData.Cols[0].tuples[i].caption, value: _this.mapData.Data[idx * l + i]});
                //}
                return res;
            }

            function onMapClick(evt) {
                var feature = _this.map.forEachFeatureAtPixel(evt.pixel,
                    function (feature, layer) {
                        return feature;
                    });
                if (feature) {
                    if (feature.getGeometry().getType().toLowerCase() === "polygon") {
                        var key = feature.get("key");
                        console.log(key);

                        $scope.model.tooltip.items = getTooltipData(key);
                        $scope.model.tooltip.name = key;

                        var geometry = feature.getGeometry();
                        var coord = evt.coordinate;//geometry.getFirstCoordinate();
                       // coord[0] += Math.floor((_this.map.getCoordinateFromPixel(evt.pixel)[0] / 40075016.68) + 0.5) * 20037508.34 * 2;
                        _this.popup.setPosition(coord);
                        showTooltip();
                    } else {
                        var labels = feature.get("features")[0].get("labels");
                        var values = feature.get("features")[0].get("values");
                        $scope.model.tooltip.items = [];
                        for (var i = 0; i < labels.length; i++) $scope.model.tooltip.items.push({
                            label: labels[i] + ": ",
                            value: values[i]
                        });
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
                    }
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
        .factory('MapWidget', ['CONST', '$timeout', 'Connector', MapWidgetFact]);

})();