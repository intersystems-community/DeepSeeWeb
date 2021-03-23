import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseWidget} from '../base-widget.class';
import {dsw} from '../../../../environments/dsw';
import Map from 'ol/map';
import View, {FitOptions} from 'ol/view';
import {Tile, Vector} from 'ol/layer';
import Overlay from 'ol/overlay';
import {OSM, XYZ, Vector as SourceVector} from 'ol/source';
import Feature from 'ol/feature';
import Collection from 'ol/collection';
import {defaults as control_defaults} from 'ol/control';
import {Style, Fill, Stroke, Icon} from 'ol/style';
import {Point, Polygon} from 'ol/geom';
import {transform} from 'ol/proj';

@Component({
    selector: 'dsw-map-widget',
    templateUrl: './map-widget.component.html',
    styles: [`
        @import "/src/scss/variables.scss";
        :host {
            position: relative;
        }
        .tooltip {
            margin-top: 24px;
            z-index: 1000;
            position: absolute;
            border: solid 1px #000000;
            color: #000000;
            background-color: #ffffe1;
            white-space: nowrap;
            font-family: Tahoma, sans-serif;
            fontSize: 13px;
            -moz-box-shadow: 2px 2px 4px #7f7f7f;
            box-shadow: 2px 2px 4px #7f7f7f;
            padding: 2px 3px;
        }
        .map-popup {
            background-color: var(--cl-widget-filter-bg);
            margin-bottom: 0px;
            border-color: rgb(176, 176, 176);
            padding: 4px;
            -webkit-box-shadow: 1px 1px 9px 0px rgba(50, 50, 50, 0.5);
            -moz-box-shadow: 1px 1px 9px 0px rgba(50, 50, 50, 0.5);
            box-shadow: 1px 1px 9px 0px rgba(50, 50, 50, 0.5);
            /*background-color: var(--cl-widget-bg);*/
            color: var(--cl-widget-header-txt);
            position: relative;
        }
        .map-popup:after {
            content: " ";
            display: block;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 8px 4px 0 4px;
            bottom: -8px;
            left: calc(50% - 4px);
            position: absolute;
            border-color: var(--cl-widget-filter-bg) transparent transparent transparent;
        }
    `]
})
export class MapWidgetComponent extends BaseWidget implements OnInit, OnDestroy, AfterViewInit {
    private readonly CLUSTER_RANGE = 1;

    private map: Map;
    private markers = null;
    private polys = null;
    private iconStyle = null;
    private popup = null;
    private isRGBColor = false;
    private _selectedFeature = null;
    private featureOverlay = null;
    private mapData = null;
    private hintTimeout = null;
    @ViewChild('popup', {static: true}) popupEl;

    @ViewChild('tooltip', {static: true})
    private tooltip: ElementRef;

    private popupElement: HTMLElement = null;
    private hoverStyle;
    private polyStyle;
    private polyData = null;

    ngOnInit() {
        super.ngOnInit();

        this.popupElement = this.popupEl.nativeElement;

        // Selected deature for mobile version to make drill after second tap
        this.model.tooltip = {
            visible: false,
            content: ''
        };

        this.model.tooltip.name = '';
        this.model.tooltip.items = [];
        this.widget.isMap = true;

        this.requestPolygons();
    }

    ngAfterViewInit() {
        this.createMap();
    }

    ngOnDestroy() {
        this.tooltip?.nativeElement?.remove();
        this.tooltip = null;
        super.ngOnDestroy();
    }

    createMap() {
        // setting up tile server if it was specified in app settings
        const appS = this.ss.getAppSettings();
        let layersSource;
        if (!appS.tileServer) {
            layersSource = new OSM({ wrapX: true });
        } else {
            layersSource = new XYZ({ url: appS.tileServer });
        }

        const map = new Map({
            layers: [
                //raster,
                new Tile({
                    //source: new MapQuest({layer: 'osm', url: 'https://otile{1-4}-s.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg?access_token=Z2AeMd4y8ipY2WAeYP2HQF9s51FDPZ0f' })
                    source: layersSource
                })
            ],
            controls: control_defaults({
                attributionOptions: {
                    collapsible: false
                }
            }),
            target:  this.el.nativeElement,
            view: new View({
                center: [0, 0],
                zoom: 2
                //minZoom: 2
            })
        });

        map.getViewport().addEventListener('mouseout', (evt) => {
            this.hideTooltip();
        }, false);


        this.map = map;
        this.initialize();
    }

    hideTooltip() {
        if (this.hintTimeout) clearTimeout(this.hintTimeout);
        if (this.tooltip) {
            this.tooltip.nativeElement.style.display = 'none';
        }
        // this.hidePopup();
    }

    rejectTooltipCreation() {
        clearTimeout(this.hintTimeout);
    }

    showTooltip(txt, x, y) {
        if (this.hintTimeout) clearTimeout(this.hintTimeout);
        this.hintTimeout = setTimeout(() => {
            let el = this.tooltip.nativeElement as HTMLElement;
            el.innerText = txt;
            el.style.left = x.toString() + 'px';
            el.style.top = y.toString() + 'px';
            el.style.display = 'block';
        }, 600);
    }

    showPopup() {
        this.popupElement.style.visibility = 'hidden';
        setTimeout(() => {
            this.popupElement.style.visibility = 'visible';
            this.map.render();
        }, 0);
    }

    hidePopup() {
        this.popupElement.style.visibility = 'hidden';
    }

    /**
     * Back button click handler
     */
    doDrillUp() {
        this.hideTooltip();
        void this.doDrill();
    }

    /**
     * Displays chart as pivot widget
     */
    displayAsPivot(customMdx) {
        this.hideTooltip();
        this.rejectTooltipCreation();
        if (this.widget.type === 'pivot') {
            this.widget.isDrillthrough = null;
            this.restoreWidgetType();
        } else {
            this.widget.pivotMdx = customMdx || this.getMDX();
            this.changeWidgetType('pivot');
        }
    }

    requestPolygons() {
        let fileName = this.widget.name + '.js';
        if (this.widget.properties && this.widget.properties.coordsJsFile) {
            fileName = this.widget.properties.coordsJsFile;
        }
        const folder = this.ss.serverSettings.DefaultApp || '/csp';
        const url = folder + '/' + fileName;

        // For dev on locahost take connector redirect url
        // if (window.location.host.split(':')[0].toLowerCase() === 'localhost') {
        //     url = localStorage.connectorRedirect.split('/').slice(0, -2).join('/') + url;
        // } else {
        //     if (dsw.mobile) {
        //         url = localStorage.connectorRedirect.split('/').slice(0, -2).join('/') + url;
        //     } else {
        //         // if (localStorage.connectorRedirect) url = "map.js";
        //     }
        // }
        // url = 'uspolygons.js';
        this.ds.getFile(url)
            .then(data => this.onPolyFileLoaded(data))
            .finally(() =>  this.hideLoading());

       /* this.ds.getFile('assets/us-all.geo.json')
            .then(data => this.onPolyJSONFileLoaded(data))
            .finally(() =>  this.hideLoading());*/

    }

    onPolyFileLoaded(result) {
        // This "var" is needed to exec polys js file and path this variable to context of this file
        // tslint:disable-next-line:no-var-keyword
        var polys = {};
        result = '(' + result + ')(polys)';
        // TODO: make safe eval
        // tslint:disable-next-line:no-eval
        eval(result);
        this.polyData = polys;
        this.buildPolygons();
    }

    onPolyJSONFileLoaded(result) {
        this.polyData = result;
        this.buildPolygons();
    }

    // colorGradient(fadeFraction, rgbColor1, rgbColor2, rgbColor3) {
    //     let color1 = rgbColor1;
    //     let color2 = rgbColor2;
    //     let fade = fadeFraction;
    //
    //     // Do we have 3 colors for the gradient? Need to adjust the params.
    //     if (rgbColor3) {
    //         fade = fade * 2;
    //
    //         // Find which interval to use and adjust the fade percentage
    //         if (fade >= 1) {
    //             fade -= 1;
    //             color1 = rgbColor2;
    //             color2 = rgbColor3;
    //         }
    //     }
    //
    //     let diffRed = color2.red - color1.red;
    //     let diffGreen = color2.green - color1.green;
    //     let diffBlue = color2.blue - color1.blue;
    //
    //     let gradient = {
    //         red: parseInt(Math.floor(color1.red + (diffRed * fade)), 10),
    //         green: parseInt(Math.floor(color1.green + (diffGreen * fade)), 10),
    //         blue: parseInt(Math.floor(color1.blue + (diffBlue * fade)), 10),
    //     };
    //
    //     return 'rgb(' + gradient.red + ',' + gradient.green + ',' + gradient.blue + ')';
    // }

    getFeatureColor(name, value) {
        let item = this.mapData.Cols[1].tuples.filter((el) => {
            return el.caption === name;
        });
        if (item.length === 0) {
            return;
        }
        item = item[0];
        let parts;


        let idx = this.mapData.Cols[1].tuples.indexOf(item);
        let l = this.mapData.Cols[0].tuples.length;
        let colorProp = 'ColorExplicitValue';
        if (this.widget.properties && this.widget.properties.colorProperty !== undefined) {
            colorProp = this.widget.properties.colorProperty;
        }
        let color;
        if (isNaN(parseInt(colorProp, 10))) {
            color = this.mapData.Cols[0].tuples.filter((el) => {
                return el.caption === colorProp;
            });
        } else {
            color = this.mapData.Cols[0].tuples.slice(colorProp, 1);
        }
        if (color.length !== 0) {
            color = color[0];
            let colorIdx = this.mapData.Cols[0].tuples.indexOf(color);
            let col = this.mapData.Data[idx * l + colorIdx];
            if (col.indexOf('rgba') === -1) {
                col = col.replace('rgb', 'rgba');
                col = col.substr(0, col.length - 1) + ', 0)';
            }
            parts = col.split(',');
            parts[3] = '0.4)';
            return parts.join(',');
        } else {
            let f = 'hsl((255-x)/255 * 120, 100%, 50%)';
            if (this.isRGBColor) {
                f = 'rgb(x, 255-x, 0)';
            }
            //if (!this.widget.properties || !this.widget.properties.colorProperty) f = "hsl((255-x)/255 * 120, 100%, 50%)";
            if (this.widget.properties && this.widget.properties.colorFormula) {
                f = this.widget.properties.colorFormula;
            }
            let fidx = f.indexOf('(');
            let firstPart = f.substring(0, fidx).toLowerCase();
            f = f.substring(fidx + 1, f.length - 1);
            parts = f.split(',');
            let x = value || 0;
            let tmp;
            for (let i = 0; i < parts.length; i++) {
                if (parts[i].indexOf('x') === -1) {
                    continue;
                }
                parts[i] = parts[i].replace(/x/g, x.toString());
                eval('tmp = ' + parts[i] + ';');
                if (tmp > 255) {
                    tmp = 255;
                }
                if (tmp < 0) {
                    tmp = 0;
                }
                parts[i] = Math.floor(tmp).toString();
            }

            // return colorGradient(x/255, {red: 0, green: 255, blue: 0}, {red: 255, green: 255, blue: 0}, {red: 255, green: 0, blue: 0});
            return firstPart + 'a(' + parts.join(',') + ', 0.65)';
            //console.log("hsla(" + parts.join(",") + ", 0.3)");
            //return "hsla(" + parts.join(",") + ", 0.5)";
        }
    }

    centerView(min, max) {
        let lat;
        let lon;
        let zoom;
        if (this.widget.properties) {
            lat = parseFloat(this.widget.properties.latitude);
            lon = parseFloat(this.widget.properties.longitude);
            zoom = parseFloat(this.widget.properties.zoom);
        }

        if (this.drills.length === 0 && (!isNaN(lat) && !isNaN(lon) && !isNaN(zoom)) && (lat !== undefined && lon !== undefined && zoom !== undefined)) {
            this.map.getView().setCenter(transform([lon, lat], 'EPSG:4326', 'EPSG:900913'));
            this.map.getView().setZoom(zoom);
        } else {
            if (Math.abs(min[0] - max[0]) < 0.00000001 && Math.abs(min[1] - max[1]) < 0.00000001) {
                return;
            }
            let p1 = transform([min[0], min[1]], 'EPSG:4326', 'EPSG:900913');
            let p2 = transform([max[0], max[1]], 'EPSG:4326', 'EPSG:900913');
            //console.log([p1[0], p1[1], p2[0], p2[1]]);
            //console.log(this.map.getSize());
            // TODO: check remove FitOptions
            this.map.getView().fit([p1[0], p1[1], p2[0], p2[1]], this.map.getSize() as FitOptions);
            /*this.map.getView().fit([p1[0], p1[1], p2[0], p2[1]], this.map.getSize(),
                {
                    padding: [10, 10, 10, 10],
                    constrainResolution: true,
                    nearest: true
                });*/
        }
    }

    buildPolygons() {
        let lon, lat, zoom, i, p, k, l, t, value, parts, idx, item;
        this.isRGBColor = false;
        let colorProperty = 'ColorHSLValue';
        if (this.widget.properties && this.widget.properties.colorClientProperty) {
            colorProperty = this.widget.properties.colorClientProperty;
        }
        let coordsProperty = 'CoordKeyValue';
        if (this.widget.properties && this.widget.properties.coordsProperty) {
            coordsProperty = this.widget.properties.coordsProperty;
        }
        if (!this.polyData || !this.map || !this.mapData) {
            return;
        }
        let features = [];
        l = this.mapData.Cols[0].tuples.length;
        let minV = Number.MAX_VALUE;
        let maxV = Number.MIN_VALUE;

        let colorPropertyIdx = 0;
        if (isNaN(parseInt(colorProperty))) {
            item = this.mapData.Cols[0].tuples.filter((el) => {
                return el.caption === colorProperty;
            });
            colorPropertyIdx = this.mapData.Cols[0].tuples.indexOf(item[0]);
            if (colorPropertyIdx === -1) {
                this.isRGBColor = true;
                colorProperty = 'ColorRGBValue';
                item = this.mapData.Cols[0].tuples.filter((el) => {
                    return el.caption === colorProperty;
                });
                colorPropertyIdx = this.mapData.Cols[0].tuples.indexOf(item[0]);
            }
        } else {
            colorPropertyIdx = parseInt(this.widget.properties.colorProperty, 10) || 0;
        }

        for (t = 0; t < this.mapData.Cols[1].tuples.length; t++) {
            value = this.mapData.Data[t * l + colorPropertyIdx];
            if (value < minV) {
                minV = value;
            }
            if (value > maxV) {
                maxV = value;
            }
        }

        let min = [99999999, 99999999];
        let max = [-99999999, -99999999];

        let count = 0;
        //polyCoordProp  = this.widget.proper Polygon Coords property

        idx = -1;
        item = this.mapData.Cols[0].tuples.filter((el) => {
            return el.caption === coordsProperty;
        });
        // If not found find by Key
        if (item.length === 0) {
            item = this.mapData.Cols[0].tuples.filter((el) => {
                return el.caption === 'Key';
            });
        }
        if (item.length !== 0) {
            idx = this.mapData.Cols[0].tuples.indexOf(item[0]);
        }
        for (t = 0; t < this.mapData.Cols[1].tuples.length; t++) {
            //if (t !== 0) continue;

            let key = this.mapData.Cols[1].tuples[t].caption;
            let pkey = key;
            if (idx !== -1) {
                pkey = this.mapData.Data[t * l + idx];
            }
            if (!this.polyData[pkey]) {
                continue;
            }

            parts = this.polyData[pkey].split(';');
            let poly = [];
            count++;


            for (k = 0; k < parts.length; k++) {
                if (!parts[k]) {
                    continue;
                }
                let coords = parts[k].split(' ');

                let polyCoords = [];
                for (i in coords) {
                    if (!coords[i]) {
                        continue;
                    }
                    let c = coords[i].split(',');
                    if (c.length < 2) {
                        continue;
                    }
                    lon = parseFloat(c[0]);
                    lat = parseFloat(c[1]);

                    if (isNaN(lon) || isNaN(lat)) {
                        console.warn('Wrong poly coordinates: ', coords[i]);
                        continue;
                    }

                    let point = new Point([lon, lat]);
                    point.transform('EPSG:4326', 'EPSG:3857');

                    let ll = lon;
                    if (ll < 0) {
                        ll += 360;
                    }
                    if (parseFloat(ll) < min[0]) {
                        min[0] = parseFloat(ll);
                    }
                    if (parseFloat(lat) < min[1]) {
                        min[1] = parseFloat(lat);
                    }
                    if (parseFloat(ll) > max[0]) {
                        max[0] = parseFloat(ll);
                    }
                    if (parseFloat(lat) > max[1]) {
                        max[1] = parseFloat(lat);
                    }
                    polyCoords.push(point.getCoordinates());
                }

                poly.push(polyCoords);

                if (poly.length > 300) {
                    let tmp = [];
                    for (i = 0; i < poly.length; i += 2) {
                        tmp.push(poly[i]);
                    }
                    poly = tmp;
                }
            }

            // Find poly title
            let polyTitle = key;
            if (this.widget.properties && this.widget.properties.polygonTitleProperty) {
                let it = this.mapData.Cols[0].tuples.filter((el) => {
                    return el.caption === (this.widget.properties.polygonTitleProperty || 'Name');
                });
                if (it.length !== 0) {
                    let tidx = this.mapData.Cols[0].tuples.indexOf(it[0]);
                    if (tidx !== -1) {
                        polyTitle = this.mapData.Data[t * l + tidx];
                    }
                }
            }
            //poly = poly.reverse();
            let feature = new Feature({
                geometry: new Polygon(poly),
                //geometry: new MultiPolygon([poly]),
                key: key,
                title: polyTitle,
                dataIdx: t * l,
                path: this.mapData.Cols[1].tuples[t].path,
                desc: this.mapData.Cols[1].tuples[t].title
            });

            value = this.mapData.Data[t * l + colorPropertyIdx];
            feature.setStyle(new Style({
                zIndex: 0,
                fill: new Fill({
                    color: (this.getFeatureColor(key, ((value - minV) * 255) / (maxV - minV))) || 'none'
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0.3)',
                    width: 1
                })
            } as any));
            //console.log(getFeatureColor(key, ((maxV - value) * 255) / (maxV - minV)));
            features.push(feature);
        }

        this.featureOverlay.getSource().clear();
        this.polys.clear();
        this.polys.addFeatures(features);
        this.centerView(min, max);
    }

    /**
     * Fills widget with data retrieved from server
     * @param {object} result Result of MDX query
     */
    retrieveData(result) {
        // TODO: fix this later
        setTimeout(() => {
            this.map.updateSize();
        }, 0);

        if (result.Error) {
            this.showError(result.Error);
            return;
        }

        this.hideTooltip();
        this.markers.clear();
        this.mapData = result;
        this.buildPolygons();

        let min = [Number.MAX_VALUE, Number.MAX_VALUE];
        let max = [-Number.MAX_VALUE, -Number.MAX_VALUE];

        if (result && this.map) {
            let size = result.Cols[0].tuples.length;
            let k = 0;
            let features = [];
            let latitudeProperty = 'latitude';
            if (this.widget.properties && this.widget.properties.latitudeProperty) {
                latitudeProperty = this.widget.properties.latitudeProperty;
            }
            let longitudeProperty = 'longitude';
            if (this.widget.properties && this.widget.properties.longitudeProperty) {
                longitudeProperty = this.widget.properties.longitudeProperty;
            }
            let latIdx = -1;
            let lonIdx = -1;
            let item = result.Cols[0].tuples.filter((el) => {
                return el.caption.toLowerCase() === latitudeProperty;
            });
            if (item.length !== 0) {
                lonIdx = result.Cols[0].tuples.indexOf(item[0]);
            }
            item = result.Cols[0].tuples.filter((el) => {
                return el.caption.toLowerCase() === longitudeProperty;
            });
            if (item.length !== 0) {
                latIdx = result.Cols[0].tuples.indexOf(item[0]);
            }

            if (lonIdx === -1 || latIdx === -1) {
                return;
            }

            let list = result.Cols[1].tuples;
            if (list[0]?.children) {
                list = list[0]?.children;
            }

            for (let i = 0; i < list.length; i++) {
                if (result.Data[k + latIdx] === '' || result.Data[k + latIdx] === undefined ||
                    result.Data[k + lonIdx] === '' || result.Data[k + lonIdx] === undefined) {
                    continue;
                }
                let lat = parseFloat(result.Data[k + latIdx] || 0);
                let lon = parseFloat(result.Data[k + lonIdx] || 0);
                let name = list[i].caption;
                let point = new Point([lat, lon]);
                point.transform('EPSG:4326', 'EPSG:900913');

                let labels = [];
                let values = [];
                for (let j = 2; j < result.Cols[0].tuples.length; j++) {
                    labels.push(result.Cols[0].tuples[j].caption);
                    values.push(result.Data[k + j]);
                }

                let iconFeature = new Feature({
                    geometry: point,
                    name: name,
                    labels: labels,
                    values: values,
                    dataIdx: k,
                    path: list[i].path,
                    desc: list[i].title
                });
                if (parseFloat(lon.toString()) < min[1]) {
                    min[1] = parseFloat(lon.toString());
                }
                if (parseFloat(lat.toString()) < min[0]) {
                    min[0] = parseFloat(lat.toString());
                }
                if (parseFloat(lon.toString()) > max[1]) {
                    max[1] = parseFloat(lon.toString());
                }
                if (parseFloat(lat.toString()) > max[0]) {
                    max[0] = parseFloat(lat.toString());
                }

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

            if (features.length !== 0) {
                this.markers.addFeatures(features);
                this.centerView(min, max);
            }

            this.centerView(min, max);
            /* var p1 = transform([min[0], min[1]], 'EPSG:4326', 'EPSG:900913');
             var p2 = transform([max[0], max[1]], 'EPSG:4326', 'EPSG:900913');
             if (features.length !== 0) this.map.getView().fit([p1[0], p1[1], p2[0], p2[1]], this.map.getSize());

             this.map.updateSize();*/
        }

    }

    /**
     * Called after widget is initialized by directive
     * @param {object} map OpenLayer3 map object
     */
    initialize() {
        // Create style for marker
        this.iconStyle = new Style({
            zIndex: 100,
            image: new Icon({
                anchor: [0.5, 40],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 1,
                src: 'assets/img/map-marker-red.png'
            } as any) // TODO: remove any
        });


        this.polyStyle = new Style({
            zIndex: 0,
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                width: 1
            })
        });

        this.hoverStyle = new Style({
            zIndex: 1,
            stroke: new Stroke({
                color: 'blue',
                width: 2
            })
        });

        // Setup polys
        this.polys = new SourceVector({
            features: []
        });
        let vectorLayer = new Vector({
            source: this.polys,
            style: this.polyStyle
        });
        vectorLayer.setZIndex(1);
        this.map.addLayer(vectorLayer);

        // Setup clustering
        this.markers = new SourceVector({
            features: []
        });
        /*var clusterSource = new Source.Cluster({
            distance: this.CLUSTER_RANGE,
            source: this.markers
        });*/

        // Create overlay for hover
        let collection = new Collection();
        this.featureOverlay = new Vector({
            map: this.map,
            source: new SourceVector({
                features: collection,
                useSpatialIndex: false // optional, might improve performance
            } as any), // TODO: remove any
            style: this.hoverStyle,
            updateWhileAnimating: true, // optional, for instant visual feedback
            updateWhileInteracting: true // optional, for instant visual feedback
        });
        this.featureOverlay.setZIndex(10);
        this.featureOverlay.setMap(this.map);
        //this.map.addLayer(this.featureOverlay);


        // Create layer for markers
        vectorLayer = new Vector({
            source: this.markers,
            style: this.iconStyle
        });
        vectorLayer.setZIndex(100);
        this.map.addLayer(vectorLayer);


        // Create popup
        this.popup = new Overlay({
            element: this.popupElement,
            positioning: 'bottom-center',
            offset: [0, -40],
            stopEvent: false
        } as any); // TODO: remove any
        this.map.addOverlay(this.popup);

        this.map.on('click', (e) => this.onMapClick(e));
        this.map.on('pointermove', (e) => this.onPointerMove(e));
    }

    onPointerMove(e) {
        if (dsw.mobile) {
            if (e.originalEvent.touches && e.originalEvent.touches.length !== 1) {
                return;
            }
        }

        this.hideTooltip();


        let feature = this.map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
            return feature;
        });
        if (feature) {
            let dataIdx = feature.get('dataIdx');
            let title;
            let titleProp = 'TooltipValue';
            if (this.widget.properties && this.widget.properties.markerTitleProperty) {
                titleProp = this.widget.properties.markerTitleProperty;
            }
            title = this.getDataByColumnName(this.mapData, titleProp || 'Name', dataIdx);
            if (!title && this.widget.properties.polygonTitleProperty && feature.get('title')) {
                title = feature.get('title');
            }
            if (!title) {
                title = this.getDataByColumnName(this.mapData, 'Name', dataIdx);
            }
            if (!title) {
                const list = this.mapData.Cols[1].tuples[0]?.children || this.mapData.Cols[1].tuples;
                title = (list[Math.floor(dataIdx / this.mapData.Cols[0].tuples.length)].caption || '');
            }
            if (title) {
                this.showTooltip(title, e.pixel[0], e.pixel[1]);
            }

        }

        if (e.dragging) {
            this.hideTooltip();
            return;
        }
        let pixel = this.map.getEventPixel(e.originalEvent);
        let hit = this.map.hasFeatureAtPixel(pixel);
        (this.map.getTarget() as HTMLElement).style.cursor = hit ? 'pointer' : '';

        this.featureOverlay.getSource().clear();
        if (feature) {
            this.featureOverlay.getSource().addFeature(feature);
        }
    }

    getTooltipData(name) {
        if (!this.mapData) {
            return;
        }
        let res = [];
        let item = this.mapData.Cols[1].tuples.filter((el) => {
            return el.caption === name;
        });
        if (item.length === 0) {
            return;
        }
        item = item[0];
        let idx = this.mapData.Cols[1].tuples.indexOf(item);
        let l = this.mapData.Cols[0].tuples.length;
        let tooltip = this.mapData.Cols[0].tuples.filter((el) => {
            return el.caption === 'tooltip';
        });
        if (tooltip.length === 0) {
            return;
        }
        tooltip = tooltip[0];
        let tooltipIdx = this.mapData.Cols[0].tuples.indexOf(tooltip);
        res.push({label: '', value: this.mapData.Data[idx * l + tooltipIdx].split(':')[1] || ''});
        return res;
    }

    onMapClick(evt) {
        this.hidePopup();
        if (dsw.mobile) {
            if (evt.originalEvent.touches && evt.originalEvent.touches.length !== 1) {
                return;
            }
        }
        let feature = this.map.forEachFeatureAtPixel(evt.pixel,
            (feature, layer) => {
                return feature;
            });
        if (feature) {

            this.hideTooltip();
            if (dsw.mobile) {
                if (this._selectedFeature !== feature) {
                    this._selectedFeature = feature;
                    this.onPointerMove(evt);
                    return;
                }
            }
            void this.doDrill(feature.get('path'), feature.get('name') || feature.get('title'), undefined, () => {
                showPopup(feature);
            });
        } else {
            this.hideTooltip();
        }

        const showPopup = (feature) => {
            let dataIdx = feature.get('dataIdx');
            let title, content;
            let contentProp = 'PopupValue';
            if (this.widget.properties && this.widget.properties.markerPopupContentProperty) {
                contentProp = this.widget.properties.markerPopupContentProperty;
            }
            if (contentProp) {
                content = this.getDataByColumnName(this.mapData, contentProp, dataIdx);
            } else {
                content = this.mapData.Cols[1].tuples[Math.floor(dataIdx / this.mapData.Cols[0].tuples.length)].caption ||
                    this.mapData.Cols[1].tuples[Math.floor(dataIdx / this.mapData.Cols[0].tuples.length)].desc || '';
            }
            if (!content) {
                content = '<b>' + feature.get('name') + '</b><br/>';
                if (this.mapData.Cols[0].tuples.length) {
                    for (let i = 0; i < this.mapData.Cols[0].tuples.length; i++) {
                        const caption = this.mapData.Cols[0].tuples[i].caption;
                        if (caption.toLowerCase() === 'latitude' || caption.toLowerCase() === 'longitude') {
                            continue;
                        }
                        const v = this.getDataByColumnName(this.mapData, caption, dataIdx);
                        content += `${caption}: <span style="opacity: 0.6">${v}</span>`;
                        if (i !== this.mapData.Cols[0].tuples.length - 1) {
                            content += '<br/>';
                        }
                    }
                } else {
                    content = this.getDataByColumnName(this.mapData, "Name", dataIdx);
                }
            }
            if (!content) {
                return;
            }

            this.model.tooltip.content = content;

            let coord;
            if (feature.getGeometry().getType().toLowerCase() === "polygon") {
                evt.pixel[1] += 30;
                coord = this.map.getCoordinateFromPixel(evt.pixel);
                //coord[0] = Math.floor((this.map.getCoordinateFromPixel(evt.pixel)[0] / 40075016.68) + 0.5) * 20037508.34 * 2;
                //coord[0] += Math.floor((this.map.getCoordinateFromPixel(evt.pixel)[0] / 40075016.68) + 0.5) * 20037508.34 * 2;
            } else {
                let geometry = feature.getGeometry();
                coord = geometry.getCoordinates();
                coord[0] += Math.floor((this.map.getCoordinateFromPixel(evt.pixel)[0] / 40075016.68) + 0.5) * 20037508.34 * 2;
            }
            this.popup.setPosition(coord);

            //this.doDrillFilter(feature.get("path"));

            /*$(element).popover({
             'placement': 'top',
             'html': true,
             'content': feature.get('name')
             });*/
            //$(element).popover('show');
            this.popupElement.innerHTML = content;
            this.showPopup();

        }
    }

    onResize() {
        if (this.map) {
            this.map.updateSize();
        }
    }
}
