import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseWidget} from '../base-widget.class';
import {dsw} from '../../../../environments/dsw';
import Map from 'ol/Map';
import View, {FitOptions} from 'ol/View';
import {Tile, Vector} from 'ol/layer';
import Overlay from 'ol/Overlay';
import {OSM, XYZ, Vector as SourceVector} from 'ol/source';
import Feature, {FeatureLike} from 'ol/Feature';
import Collection from 'ol/Collection';
import {defaults as control_defaults} from 'ol/control';
import {Style, Fill, Stroke, Icon, Text} from 'ol/style';
import {Point, Polygon, MultiPolygon} from 'ol/geom';
import {transform} from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import {IWidgetDataProperties} from "../../../services/dsw.types";

@Component({
    selector: 'dsw-map-widget',
    templateUrl: './map-widget.component.html',
    styleUrls: ['./map-widget.component.scss'],
    standalone: true
})
export class MapWidgetComponent extends BaseWidget implements OnInit, OnDestroy, AfterViewInit {
    private readonly CLUSTER_RANGE = 1;

    private map?: Map;
    private markers: any;
    private polys: any;
    private iconStyle: any;
    // private popup = null;
    private isRGBColor = false;
    private _selectedFeature: FeatureLike|null = null;
    private featureOverlay: any|null = null;
    private mapData: any|null = null;
    private hintTimeout: any = null;
    @ViewChild('popup', {static: true}) popupEl;

    @ViewChild('tooltip', {static: true})
    private tooltip?: ElementRef;

    private popupElement: HTMLElement|null = null;
    private hoverStyle;
    private polyStyle;
    private polyData: any|null = null;
    private isGeoJSON = false;
    private onMessage;

    preventColFilteringBasedOnDataProperties = true;

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

        if (this.us.isEmbedded()) {
            this.onMessage = e => {
                const event = e.data;
                switch (event.type) {
                    case 'map.applyStyle':
                        this.applyStyle(event);
                        break;
                }
            };
            window.addEventListener('message', this.onMessage);
        }
    }

    applyStyle(e: any) {
        const {selector, style, value} = e;
        const el = this.map?.getTargetElement();
        const target = el && el.querySelectorAll<HTMLElement>(selector);
        target?.forEach(t => {
            t.style[style] = value;
        });
    }

    ngAfterViewInit() {
        this.createMap();
    }

    ngOnDestroy() {
        if (this.us.isEmbedded()) {
            window.removeEventListener('message', this.onMessage);
        }
        this.tooltip?.nativeElement?.remove();
        this.tooltip = undefined;
        super.ngOnDestroy();
    }

    createMap() {
        // setting up tile server if it was specified in app settings
        const appS = this.ss.getAppSettings();
        // let layersSource;
        // if (!appS.tileServer) {
        let url;
        url = this.getDataPropValue('tileUrl');
        const layersSource = new OSM({ wrapX: true, url });
        // } else {
            // layersSource = new XYZ({ url: appS.tileServer });
         // }

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
            let el = this.tooltip?.nativeElement as HTMLElement;
            const styles = this.getDataPropValue('tooltipStyles');
            if (styles) {
                const st = JSON.parse(styles);
                for (const s in st) {
                    el.style.setProperty(s, st[s]);
                }
            }
            el.innerHTML = txt;
            el.style.left = x.toString() + 'px';
            el.style.top = y.toString() + 'px';
            el.style.display = 'block';
        }, 600);
    }

    showPopup() {
        let el =  this.popupElement as HTMLElement;
        const styles = this.getDataPropValue('popupStyles');
        if (styles) {
            const st = JSON.parse(styles);
            for (const s in st) {
                el.style.setProperty(s, st[s]);
            }
        }


        if (this.popupElement) {
            this.popupElement.style.visibility = 'hidden';
        }
        setTimeout(() => {
            if (this.popupElement) {
                this.popupElement.style.visibility = 'visible';
            }
            this.map?.render();
        }, 0);
    }

    hidePopup() {
        if (this.popupElement) {
            this.popupElement.style.visibility = 'hidden';
        }
    }

    /**
     * Back button click handler
     */
    doDrillUp() {
        this.hideTooltip();
        this.hidePopup();
        void this.doDrill();
    }

    /**
     * Displays chart as pivot widget
     */
    displayAsPivot(customMdx) {
        this.hideTooltip();
        this.rejectTooltipCreation();
        if (this.widget.type === 'pivot') {
            this.widget.isDrillthrough = false;
            this.restoreWidgetType();
        } else {
            this.widget.pivotMdx = customMdx || this.getMDX();
            this.changeWidgetType('pivot');
        }
    }

    requestPolygons() {
        let fileName = this.widget.name;
        if (this.widget.name.indexOf('.') === -1) {
            fileName += '.js';
        }
        fileName = this.getDataPropValue('coordsJsFile') || fileName;
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
        /// url = 'uspolygons.js';
        //this.ds.getFile('/assets/UAMap.geojson')
        this.ds.getFile(url)
            .then(data => this.onPolyFileLoaded(data))
            .finally(() => this.hideLoading());

       /* this.ds.getFile('assets/us-all.geo.json')
            .then(data => this.onPolyJSONFileLoaded(data))
            .finally(() =>  this.hideLoading());*/

    }

    onPolyFileLoaded(result) {
        this.isGeoJSON = false;
        // Try to load GEOJSON first
        try {
            const data = JSON.parse(result);
            this.polyData = data;
            this.isGeoJSON = true;
            this.buildPolygons();
            //this.buildGeoJSON(data);

            return;
        } catch (e) {
            // This is not GEOJSON. Continue loading as JS script
        }

        // This "var" is needed to exec polys js file and path this variable to context of this file
        // tslint:disable-next-line:no-var-keyword
        var polys = {};
        result = '(' + result + ')(polys)';
        // TODO: make safe eval
        // tslint:disable-next-line:no-eval
        const ev = 'eval';
        window[ev](result);
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
        colorProp = this.getDataPropValue('colorProperty') || colorProp;

        let color;
        if (isNaN(parseInt(colorProp, 10))) {
            color = this.mapData.Cols[0].tuples.filter((el) => {
                return el.caption === colorProp;
            });
        } else {
            color = this.mapData.Cols[0].tuples.slice(colorProp, 1);
        }
        color = color[0];
        const colorIdx = this.mapData.Cols[0].tuples.indexOf(color);
        let col = this.mapData.Data[idx * l + colorIdx];
        if (isNaN(parseFloat(col))) {
            if (col.toString().indexOf('rgb') !== -1 && col.toString().indexOf('rgba') === -1) {
                col = col.replace('rgb', 'rgba');
                col = col.substr(0, col.length - 1) + ', 0)';
            }
            parts = col.split(',');
            parts[3] = '0.4)';
            return parts.join(',');
        } else {
            let f = this.getDataPropValue('colorFormula') || 'hsl((255-x)/255 * 120, 100%, 50%)';
            // f = 'hsl(190 + x/200 * 100, 10%, 40%)';


            // let f = this.getDataPropValue('colorFormula') || 'hsl(193 + x/255 * 42, 100%, 50%)';
            if (this.isRGBColor) {
                f = 'rgb(x, 255-x, 0)';
            }
            const fidx = f.indexOf('(');
            const firstPart = f.substring(0, fidx).toLowerCase();
            f = f.substring(fidx + 1, f.length - 1);
            parts = f.split(',');
            const x = value || 0;
            var tmp;
            for (let i = 0; i < parts.length; i++) {
                if (parts[i].indexOf('x') === -1) {
                    continue;
                }
                parts[i] = parts[i].replace(/x/g, x.toString());
                const ev = 'eval';
                window[ev]('tmp = ' + parts[i] + ';');
                if (tmp > 255) {
                    tmp = 255;
                }
                if (tmp < 0) {
                    tmp = 0;
                }
                parts[i] = Math.floor(tmp).toString();
            }

            // return colorGradient(x/255, {red: 0, green: 255, blue: 0}, {red: 255, green: 255, blue: 0}, {red: 255, green: 0, blue: 0});
            if (firstPart.indexOf('a') === -1) {
                return firstPart + 'a(' + parts.join(',') + ', 0.45)';
            }
            return firstPart + '(' + parts.join(',') + ')'; // + 'a(' + parts.join(',') + ', 0.45)';
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
            this.map?.getView().setCenter(transform([lon, lat], 'EPSG:4326', 'EPSG:900913'));
            this.map?.getView().setZoom(zoom);
        } else {
            if (Math.abs(min[0] - max[0]) < 0.00000001 && Math.abs(min[1] - max[1]) < 0.00000001) {
                return;
            }
            let p1 = transform([min[0], min[1]], 'EPSG:4326', 'EPSG:900913');
            let p2 = transform([max[0], max[1]], 'EPSG:4326', 'EPSG:900913');
            //console.log([p1[0], p1[1], p2[0], p2[1]]);
            //console.log(this.map.getSize());
            // TODO: check remove FitOptions
            this.map?.getView().fit([p1[0], p1[1], p2[0], p2[1]], this.map?.getSize() as FitOptions);
            /*this.map?.getView().fit([p1[0], p1[1], p2[0], p2[1]], this.map?.getSize(),
                {
                    padding: [10, 10, 10, 10],
                    constrainResolution: true,
                    nearest: true
                });*/
        }

        if (this.getDataPropValue('fixMaxZoom') === '1') {
            this.map?.getView().setMaxZoom(this.map?.getView().getZoom() || 1);
        }
        if (this.getDataPropValue('fixMinZoom') === '1') {
            this.map?.getView().setMinZoom(this.map?.getView().getZoom() || 1);
        }
        if (this.getDataPropValue('maxZoom')) {
            this.map?.getView().setMaxZoom(parseFloat(this.getDataPropValue('maxZoom') || '1'));
        }
    }

    buildPolygons() {
        let lon, lat, zoom, i, p, k, l, t, value, parts, idx, item;
        this.isRGBColor = false;
        let colorProperty = this.getDataPropValue('colorProperty') || 'ColorHSLValue';
        const coordsProperty = this.getDataPropValue('coordsProperty') || 'CoordKeyValue';

        if (!this.polyData || !this.map || !this.mapData) {
            return;
        }
        let features: any[] = [];
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
            parts = this.getPartsByKey(pkey, coordsProperty);

            if (!parts) {
                continue;
            }

            // parts = this.polyData[pkey].split(';');
            let polys: any[] = [];
            count++;

            const dataLabels = this.getDataPropValue('dataLabels');

            if (this.isGeoJSON) {
               const res = this.convertCoordinatesOfGEOJson(parts, min, max);
               polys = res.poly;
               min = res.min;
               max = res.max;
            } else {

                for (k = 0; k < parts.length; k++) {
                    let poly: any[] = [];
                    if (!parts[k]) {
                        continue;
                    }
                    let coords = parts[k];
                    if (typeof coords === 'string') {
                        coords = coords.split(' ');
                    }

                    let polyCoords: any[] = [];
                    for (i in coords) {
                        if (!coords[i]) {
                            continue;
                        }
                        let c = coords[i];
                        if (typeof c === 'string') {
                            c = c.split(',');
                        }
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
                        let tmp: any[] = [];
                        for (i = 0; i < poly.length; i += 2) {
                            tmp.push(poly[i]);
                        }
                        poly = tmp;
                    }

                    polys.push(polyCoords);
                }
            }

            // Find poly title
            let polyTitle = key;
            const titleProp = this.getDataPropValue('polygonTitleProperty');
            if (titleProp) {
                const it = this.mapData.Cols[0].tuples.filter((el) => {
                    return el.caption === titleProp;
                });
                if (it.length !== 0) {
                    const tIdx = this.mapData.Cols[0].tuples.indexOf(it[0]);
                    if (tIdx !== -1) {
                        polyTitle = this.mapData.Data[t * l + tIdx];
                    }
                }
            }

            let polyType: any = Polygon;
            if (this.isGeoJSON) {
                // TOSO: support different types of polygons
                switch (parts.type.toLowerCase()) {
                }
                polyType = MultiPolygon;
            }
            let feature = new Feature({
                //geometry: new Polygon(polys),
                geometry: new polyType(polys),
                key,
                title: polyTitle,
                dataIdx: t * l,
                path: this.mapData.Cols[1].tuples[t].path,
                desc: this.mapData.Cols[1].tuples[t].title
            });

            let text;
            if (!isNaN(parseFloat(polyTitle))) {
                polyTitle = this.formatNumber(polyTitle, '');
            }
            if (dataLabels) {
                const json = JSON.parse(dataLabels);
                const size = json.size || 12;
                const font = json.font || 'Calibri,Arial,sans-serif';
                const color = json.color || '#000';
                const stroke = json.stroke || '#fff';
                const strokeWidth = json.strokeWidth || 2;
                text = new Text({
                    font: `${size}px ${font}`,
                    fill: new Fill({ color }),
                    stroke: new Stroke({
                        color: stroke, width: strokeWidth
                    }),
                    text: polyTitle + ''
                });
            }

            value = this.mapData.Data[t * l + colorPropertyIdx];
            feature.setStyle(new Style({
                zIndex: 0,
                fill: new Fill({
                    color: (this.getFeatureColor(key, ((value - minV) * 255) / (maxV - minV))) || 'none'
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0.3)',
                    width: 1
                }),
                text
            } as any));
            //console.log(getFeatureColor(key, ((maxV - value) * 255) / (maxV - minV)));
            features.push(feature);
        }

        this.featureOverlay.getSource().clear();
        this.polys.clear();
        this.polys.addFeatures(features);
        // this.polys.addFeatures(new GeoJSON().readFeatures(this.polyData))
        setTimeout(() => {
            this.centerView(min, max);
        });

    }

    /**
     * Fills widget with data retrieved from server
     * @param {object} result Result of MDX query
     */
    retrieveData(result) {
        // TODO: fix this later
        setTimeout(() => {
            this.map?.updateSize();
        }, 0);

        if (result.Error) {
            this.showError(result.Error);
            return;
        }

        if (result.Info) {
            this.dataInfo = result.Info;
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
            let features: any[] = [];
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

                let labels: string[] = [];
                let values: number[] = [];
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


       /* this.polyStyle = new Style({
            zIndex: 0,
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                width: 1
            }),
        });*/
        const m = this.map;
        const p = new Style({
            zIndex: 0,
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                width: 1
            })
        });

        this.polyStyle = p;
            /*this.polyStyle = (f) => {
            p.getText().setText(f.get('name'));
            return p;
        };*/


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
        this.map?.addLayer(vectorLayer);

        // Setup clustering
        // @ts-ignore
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
        if (this.markers) {
            vectorLayer = new Vector({
                source: this.markers,
                style: this.iconStyle
            });
            vectorLayer.setZIndex(100);
            this.map?.addLayer(vectorLayer);
        }


        // Create popup
        /*this.popup = new Overlay({
            element: this.popupElement,
            positioning: 'bottom-center',
            offset: [0, -40],
            stopEvent: false
        } as any); // TODO: remove any
        this.map.addOverlay(this.popup);*/

        this.map?.on('click', (e) => this.onMapClick(e));
        this.map?.on('pointermove', (e) => this.onPointerMove(e));
    }

    onPointerMove(e) {
        if (dsw.mobile) {
            if (e.originalEvent.touches && e.originalEvent.touches.length !== 1) {
                return;
            }
        }

        this.hideTooltip();


        let feature = this.map?.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
            return feature;
        });
        if (feature) {
            let dataIdx = feature.get('dataIdx');
            let title;
            let titleProp = 'TooltipValue';
            let fmt = '';
            const prop = this.getDataProp('tooltipProperty');
            if (prop) {
                titleProp = prop.dataValue as string;
                fmt = prop.format;
            }

            title = this.getDataByColumnName(this.mapData, titleProp || 'Name', dataIdx, fmt);
            if (!title && this.widget.properties?.polygonTitleProperty && feature.get('title')) {
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
        const pixel = this.map?.getEventPixel(e.originalEvent);
        if (pixel) {
            const hit = this.map?.hasFeatureAtPixel(pixel);
            (this.map?.getTarget() as HTMLElement).style.cursor = hit ? 'pointer' : '';
        }

        this.featureOverlay?.getSource().clear();
        if (feature) {
            this.featureOverlay?.getSource().addFeature(feature);
        }
    }

    getTooltipData(name) {
        if (!this.mapData) {
            return;
        }
        let res: any[] = [];
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
        res.push({label: '', value: this.mapData?.Data[idx * l + tooltipIdx].split(':')[1] || ''});
        return res;
    }

    onMapClick(evt) {
        this.hidePopup();
        if (dsw.mobile) {
            if (evt.originalEvent.touches && evt.originalEvent.touches.length !== 1) {
                return;
            }
        }
        let feature = this.map?.forEachFeatureAtPixel(evt.pixel,
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
            let dataIdx: number = feature.get('dataIdx');
            let title: string, content;
            let contentProp = 'PopupValue';
            let fmt = '';
            const prop = this.getDataProp('popupProperty');
            if (prop) {
                contentProp = prop.dataValue as string;
                fmt = prop.format;
            }
            if (contentProp) {
                content = '<b>' + (feature.get('key') || feature.values_.title) + '</b><br/>';
                content += contentProp + ': ';
                content += this.getDataByColumnName(this.mapData, contentProp, dataIdx, fmt);
            } else {
                content = this.mapData?.Cols[1].tuples[Math.floor(dataIdx / this.mapData?.Cols[0].tuples.length)].caption ||
                    this.mapData?.Cols[1].tuples[Math.floor(dataIdx / this.mapData?.Cols[0].tuples.length)].desc || '';
            }
            if (!content) {
                content = '<b>' + (feature.get('name') || feature.values_.title) + '</b><br/>';
                if (this.mapData?.Cols[0].tuples.length) {
                    for (let i = 0; i < this.mapData?.Cols[0].tuples.length; i++) {
                        const caption = this.mapData?.Cols[0].tuples[i].caption;
                        if (caption.toLowerCase() === 'latitude' || caption.toLowerCase() === 'longitude') {
                            continue;
                        }
                        const v = this.getDataByColumnName(this.mapData, caption, dataIdx);
                        content += `${caption}: <span style="opacity: 0.6">${v}</span>`;
                        if (i !== this.mapData?.Cols[0].tuples.length - 1) {
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

            /*let coord;
            if (feature.getGeometry().getType().toLowerCase() === "polygon") {
                evt.pixel[1] += 30;
                coord = this.map.getCoordinateFromPixel(evt.pixel);
                //coord[0] = Math.floor((this.map.getCoordinateFromPixel(evt.pixel)[0] / 40075016.68) + 0.5) * 20037508.34 * 2;
                //coord[0] += Math.floor((this.map.getCoordinateFromPixel(evt.pixel)[0] / 40075016.68) + 0.5) * 20037508.34 * 2;
            } else {
                let geometry = feature.getGeometry();
                coord = geometry.getCoordinates();
                coord[0] += Math.floor((this.map.getCoordinateFromPixel(evt.pixel)[0] / 40075016.68) + 0.5) * 20037508.34 * 2;
            }*/

            if (this.popupElement) {
                this.popupElement.style.left = evt.pixel[0] + 'px';
                this.popupElement.style.top = (evt.pixel[1] - 10) + 'px';
                this.popupElement.innerHTML = content;
            }
            this.showPopup();
        }
    }

    onResize() {
        if (this.map) {
            this.map.updateSize();
        }
    }

    private buildGeoJSON(data: any) {

    }

    private getPartsByKey(pkey: string, coordsProperty = 'Key') {
        if (this.isGeoJSON) {
            const feature = this.polyData?.features.find(f => f.properties[coordsProperty] === pkey);
            if (!feature) {
                return;
            }
            return feature.geometry;
        } else {
            if (this.polyData?.[pkey]) {
                return this.polyData[pkey]?.split(';');
            }
        }
    }

    private convertCoordinatesOfGEOJson(geometry: any, min: number[], max: number[]) {
        const temp = JSON.parse(JSON.stringify(geometry.coordinates));
        for (let a1 = 0; a1 < temp.length; a1++) {
            for (let a2 = 0; a2 < temp[a1].length; a2++) {
                for (let a3 = 0; a3 < temp[a1][a2].length; a3++) {
                    const lon = temp[a1][a2][a3][0];
                    const lat = temp[a1][a2][a3][1];

                    const point = new Point([lon, lat]);
                    point.transform('EPSG:4326', 'EPSG:3857');

                    temp[a1][a2][a3][0] = point.getCoordinates()[0] as any;
                    temp[a1][a2][a3][1] = point.getCoordinates()[1] as any;

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
                }
            }
        }
        return {poly: temp, min, max};
    }
}
