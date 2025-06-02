import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {BaseWidget} from '../base-widget.class';
import Map from 'ol/Map';
import {OSM, Vector as SourceVector} from 'ol/source';
import {Tile, Vector} from 'ol/layer';
import {defaults as control_defaults} from 'ol/control';
import View from 'ol/View';
import {Fill, Icon, Stroke, Style, Text} from 'ol/style';
import {GeoJSON} from 'ol/format';
import {IMDXData} from '../../../services/dsw.types';
import Feature, {FeatureLike} from 'ol/Feature';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import {Pixel} from 'ol/pixel';
import {dsw} from '../../../../environments/dsw';
import {Point} from 'ol/geom';

/***
 * Data properties for map component
 * Name of widget = geoJson file name
 * key(coordsProperty old) - name of column containing key, by default "Key"
 * value(colorProperty old) - name of value column, by default "Value" * polygonFile - custom js file with polygons (old format, not geojson)
 * tileUrl - url to custom tile server
 * latitude - name of column that contains latitude, by default is "Latitude"
 * longitude - name of column that contains longitude, by default is "Longitude"
 * tooltip - name of column that contains tooltip text, by default is "TooltipValue"
 **/
interface IOldMapDataFormat {
  [key: string]: string;
}

@Component({
  selector: 'dsw-map-widget',
  templateUrl: './map-widget.component.html',
  styleUrls: ['./map-widget.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapWidgetComponent extends BaseWidget implements OnInit, OnDestroy, AfterViewInit {
  /*  @ViewChild('popup', {static: true}) popupEl!: ElementRef;
    */
  @ViewChild('tooltip', {static: true}) tooltip!: ElementRef<HTMLDivElement>;
  private data?: IMDXData;
  private onMessage?: (this: Window, e: MessageEvent<any>) => void;
  private map?: Map;
  private worldMap?: SourceVector;
  private polyVector?: SourceVector;
  private markers?: SourceVector;
  private featureOverlay?: Vector<any>;
  private tooltipFeature?: FeatureLike;
  private lastHoveredFeatures: Feature[] = [];
  private polygonsLoaded?: Promise<void>;
  // Styles
  private iconStyle = new Style({
    zIndex: 100,
    image: new Icon({
      anchor: [0.5, 25],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 1,
      //width: 24,
      src: 'assets/img/map-pin-icon.svg'
    })
  });
  private defaultPolyStroke = new Stroke({
    color: 'rgba(0, 0, 0, 0.3)',
    width: 1
  });
  private hoverPolyStroke = new Stroke({
    color: 'rgba(0, 0, 255, 0.5)',
    width: 2
  });

  /*private polyStyle = new Style({
    zIndex: 0,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.5)',
      width: 1
    })
  });
  private hoverStyle = new Style({
    zIndex: 1,
    stroke: new Stroke({
      color: 'blue',
      width: 2
    })
  });*/

  ngOnInit() {
    super.ngOnInit();
    this.widget.isMap = true;

    this.requestPolygonData();

    if (this.us.isEmbedded()) {
      this.onMessage = (e) => {
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
    if (this.us.isEmbedded() && this.onMessage) {
      window.removeEventListener('message', this.onMessage);
    }
    this.unbindEvents();
    super.ngOnDestroy();
  }

  async retrieveData(result: IMDXData) {
    if (this.polygonsLoaded) {
      await this.polygonsLoaded;
    }
    if (result.Error) {
      this.showError(result.Error);
      return;
    }

    if (result.Info) {
      this.dataInfo = result.Info;
    }
    this.hideTooltip();
    this.markers?.clear();
    this.polyVector?.clear();

    this.data = result;

    this.buildMap();
    this.fitPolygonsToScreen();

    /*this.buildPolygons();

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

    }*/
  }

  private buildMap() {
    let mapType = 'world';
    if (this.isMarketsData()) {
      mapType = 'markers';
    }

    switch (mapType) {
      case 'markers':
        this.buildMarkers();
        break
      case 'world':
        this.buildWorldMapPolygons();
        break;
    }
  }

  get lonLatNames() {
    return [
      'latitude',
      'longitude',
      this.getDataPropValue('latitude')?.toLowerCase(),
      this.getDataPropValue('longitude')?.toLowerCase()
    ].filter(s => !!s);
  }

  // Detects if map data contains markers or not
  private isMarketsData() {
    const lonLat = this.lonLatNames;
    return this.data?.Cols[0]?.tuples?.some(t => lonLat.includes(t.caption?.toLowerCase()) || lonLat.includes(t.dimension?.toLowerCase()));
  }

  private buildMarkers() {
    const size = this.data?.Cols[0].tuples.length
    if (!size) {
      return;
    }
    let k = 0;
    let features: any[] = [];
    let latitudeProperty = this.getDataPropValue('latitude') || 'latitude';
    let longitudeProperty = this.getDataPropValue('longitude') || 'longitude';
    let latIdx = this.data?.Cols[0].tuples.findIndex(el => el.caption.toLowerCase() === latitudeProperty) ?? -1;

    let lonIdx = this.data?.Cols[0].tuples.findIndex(el => el.caption.toLowerCase() === longitudeProperty) ?? -1;

    if (lonIdx === -1 || latIdx === -1) {
      console.error(`Can't find latitude/longitude columns. Check name of columns that contain latitude or longitude. Also if columns named differently, check latitude/longitude data properties on map widget.`)
      return;
    }

    let list = this.data?.Cols[1].tuples;
    if (list?.[0]?.children) {
      list = list[0]?.children;
    }

    if (!list || !this.data) {
      return;
    }

    for (let i = 0; i < list.length; i++) {
      // Ignore empty values
      if (this.data.Data[k + latIdx] === '' || this.data.Data[k + latIdx] === undefined ||
        this.data.Data[k + lonIdx] === '' || this.data.Data[k + lonIdx] === undefined) {
        continue;
      }
      const lat = parseFloat(this.data.Data[k + latIdx].toString() || '0');
      const lon = parseFloat(this.data.Data[k + lonIdx].toString() || '0');
      const name = list[i].caption;
      const point = new Point([lon, lat]);
      point.transform('EPSG:4326', this.map?.getView().getProjection());

      /*let labels: string[] = [];
      let values: number[] = [];
      for (let j = 2; j < result.Cols[0].tuples.length; j++) {
        labels.push(result.Cols[0].tuples[j].caption);
        values.push(result.Data[k + j]);
      }*/

      let iconFeature = new Feature({
        geometry: point,
        title: name,
        //labels: labels,
        //values: values,
        dataIdx: k,
        path: list[i].path,
        desc: list[i].title
      });

      features.push(iconFeature);
      k += size;
    }

    if (features.length !== 0) {
      this.markers?.addFeatures(features);
    }
  }

  private mouseOut = (e: MouseEvent) => {
    this.onMouseOut(e);
  }

  private mouseClick = (e: MapBrowserEvent<TouchEvent>) => this.onMapClick(e);

  private pointerMove = (e: MapBrowserEvent<UIEvent>) => this.onPointerMove(e);

  // Creates OSM map
  private createMap() {
    // Get custom URL for tile server
    const url = this.getDataPropValue('tileUrl');
    const layersSource = new OSM({wrapX: true, url});

    const map = new Map({
      layers: [
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
      target: this.el.nativeElement,
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    });
    this.map = map;
    this.createLayers();
    this.bindEvents();
  }

  private bindEvents() {
    this.map?.getViewport().addEventListener('mouseout', this.mouseOut, false);
    this.map?.on('click', this.mouseClick);
    this.map?.on('pointermove', this.pointerMove);
  }

  private unbindEvents() {
    this.map?.getViewport().removeEventListener('mouseout', this.mouseOut, false);
    this.map?.un('click', this.mouseClick);
    this.map?.un('pointermove', this.pointerMove);
  }

  private createLayers() {
    if (!this.map) {
      console.error(`Map object doesn't exists!`);
      return;
    }
    // Create polygon layer
    this.polyVector = new SourceVector({
      features: []
    });
    const layer = new Vector({
      source: this.polyVector
    });
    layer.setZIndex(1);
    this.map?.addLayer(layer);

    // Create markers source
    this.markers = new SourceVector({
      features: []
    });
    /*var clusterSource = new Source.Cluster({
        distance: this.CLUSTER_RANGE,
        source: this.markers
    });*/

    // Create overlay for hover
    /*let collection = new Collection<any>();
    this.featureOverlay = new Vector({
      map: this.map,
      source: new SourceVector({
        features: collection,
        useSpatialIndex: false // optional, might improve performance
      }),
      style: this.hoverStyle,
      updateWhileAnimating: true, // optional, for instant visual feedback
      updateWhileInteracting: true // optional, for instant visual feedback
    });
    this.featureOverlay.setZIndex(10);
    this.featureOverlay.setMap(this.map);*/
    //this.map.addLayer(this.featureOverlay);

    // Create layer for markers
    if (this.markers) {
      const vectorLayer = new Vector({
        source: this.markers,
        style: this.iconStyle
      });
      vectorLayer.setZIndex(100);
      this.map?.addLayer(vectorLayer);
    }
  }

  private onMouseOut(e: MouseEvent) {
    this.hideTooltip();
  }

  private onMapClick(e: MapBrowserEvent<TouchEvent>) {
    if (dsw.mobile) {
      if (e.originalEvent.touches && e.originalEvent.touches.length !== 1) {
        return;
      }
    }
    let feature = this.map?.forEachFeatureAtPixel(e.pixel,
      (feature, layer) => {
        return feature;
      });
    if (!feature) {
      return;
    }
    this.hideTooltip();
    if (dsw.mobile) {
      this.onPointerMove(e);
      return;
    }
    void this.doDrill(feature.get('path'), feature.get('name') || feature.get('title'), undefined);
  }

  private onPointerMove(e: MapBrowserEvent<UIEvent>) {
    this.updateHoverStyle(e);
    this.updateTooltip(e);
  }

  private updateTooltip(e: MapBrowserEvent<UIEvent>) {
    if (e.dragging) {
      this.hideTooltip();
      this.tooltipFeature = undefined;
      return;
    }
    const pixel = this.map?.getEventPixel(e.originalEvent);
    if (pixel) {
      this.displayFeatureInfo(pixel, e.originalEvent.target);
    }
  }

  private updateHoverStyle(e: MapBrowserEvent<UIEvent>) {
    // Remove hover style from the previously hovered features
    this.lastHoveredFeatures.forEach(f => {
      const style = f.getStyle() as Style;
      style.setStroke(this.defaultPolyStroke);
      f.setStyle(style);
    });
    this.lastHoveredFeatures = [];

    // Detect if there's a features under the pointer
    this.map?.forEachFeatureAtPixel(e.pixel, (feature) => {
      const t = feature.getGeometry()?.getType();
      if (t === 'Polygon' || t === 'MultiPolygon') {
        const f = feature as Feature;
        const style = f.getStyle() as Style;
        style.setStroke(this.hoverPolyStroke);
        f.setStyle(style);
        this.lastHoveredFeatures.push(f);
      }
    });
  }

  private displayFeatureInfo(pixel: Pixel, target: any) {
    const feature = target.closest('.ol-control')
      ? undefined
      : this.map?.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });
    if (feature) {
      this.updateTooltipPosition(pixel[0], pixel[1]);
      if (feature !== this.tooltipFeature) {
        let tooltipProp = this.getDataPropValue('tooltip') || this.getDataPropValue('tooltipProperty') || 'TooltipValue';
        let text = this.getDataByColumnName(this.data, tooltipProp, feature.get('dataIdx'));
        if (!text) {
          text = this.getFeatureText(feature);
        }
        if (text) {
          this.tooltip.nativeElement.innerHTML = text.toString();
          this.showTooltip();
        }
      }
    } else {
      this.hideTooltip()
    }
    this.tooltipFeature = feature;
  };

  private updateTooltipPosition(x: number, y: number) {
    const el = this.tooltip.nativeElement;
    el.classList.remove('ol-tooltip-top');
    el.classList.remove('ol-tooltip-left');
    el.classList.remove('ol-tooltip-right');
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    const rect = el.getBoundingClientRect();
    const ownerRect = this.el.nativeElement.getBoundingClientRect();
    if ((rect.y + rect.height > ownerRect.y + ownerRect.height + 20) || (rect.y + rect.height > window.innerHeight - 20)) {
      el.classList.add('ol-tooltip-top');
    }
    if ((rect.x + rect.width > ownerRect.x + ownerRect.width + 20) || (rect.x + rect.width > window.innerWidth - 20)) {
      el.classList.add('ol-tooltip-left');
    }
    if ((rect.x < ownerRect.x - 20) || (rect.x < 20)) {
      el.classList.add('ol-tooltip-right');
    }
  }

  private showTooltip() {
    this.tooltip.nativeElement.style.visibility = 'visible';
  }

  private hideTooltip() {
    this.tooltip.nativeElement.style.visibility = 'hidden';
  }

  private requestPolygonData() {
    let fileName = this.widget.name;
    if (this.widget.name.indexOf('.') === -1) {
      fileName += '.js';
    }

    fileName = this.getDataPropValue('polygonFile') || this.getDataPropValue('coordsJsFile') || fileName;
    const folder = this.ss.serverSettings.DefaultApp || '/csp';
    const confPath = this.ds.configDefaultApp;
    const url = (confPath || folder) + '/' + fileName;
    const isJSON = fileName.split('.').pop()?.toString() === 'json';
    const p = isJSON ? this.ds.getJSONFile(url) : this.ds.getFile(url);

    this.polygonsLoaded = new Promise(res => {
      p.then(data => this.onPolyFileLoaded(data))
        .catch(e => {
          // Can't load file, load default geo json
          return this.loadDefaultGeoJSON();
        })
        .finally(() => {
          this.hideLoading();
          res();
        });
    });
  }

  private onPolyFileLoaded(data: string | Object | undefined) {
    if (!data) {
      return;
    }
    if (typeof data === 'string') {
      // Old format as javascript file
      this.parsePlainJS(data);
    } else {
      // GeoJSON
      this.createGeoJSON(data as GeoJSON);
    }
  }

  // Extracts polygons data from plain javascript file
  private parsePlainJS(jsText: string) {
    const functionRegex = /function\s+\w+\s*\(([^)]*)\)\s*\{([\s\S]*)\}/;
    const match = jsText.match(functionRegex);

    if (match) {
      const parameterName = match[1].trim(); // Extracted parameter name
      const functionBody = match[2]; // Extracted function body

      const dynamicFunction = new Function(parameterName, functionBody);
      const polys: IOldMapDataFormat = {};
      dynamicFunction(polys);
      this.createGeoJSON(this.convertToGeoJSON(polys));
    }
  }

  private async loadDefaultGeoJSON() {
    let geo: GeoJSON;
    try {
      geo = await this.ds.getJSONFile('assets/countries.json') as GeoJSON;
    } catch (e) {
      console.error(`Can't load default GeoJSON: "assets/countries.json"`);
      return;
    }
    if (!geo) {
      return;
    }
    this.createGeoJSON(geo);
  }

  private convertToGeoJSON(data: IOldMapDataFormat): GeoJSON {
    const features = Object.keys(data).map((key) => {
      const multipolygons = data[key].split(';');

      const coordinates: any[] = [];
      multipolygons.forEach(m => {
        coordinates.push(m.split(' ').map((pair) => {
          // Split the string of coordinates by spaces to get individual lon/lat pairs
          const [lon, lat] = pair.split(',').map(Number);
          return [lon, lat];
        }));
      });



      // Ensure the polygon is closed by repeating the first coordinate
      /*if (coordinates.length > 0 && coordinates[0] !== coordinates[coordinates.length - 1]) {
        coordinates.push(coordinates[0]);
      }*/

      return {
        type: "Feature",
        geometry: {
          type:  coordinates.length > 1 ? 'MultiPolygon' : 'Polygon',
          coordinates: coordinates.length > 1 ? [coordinates] : [coordinates[0]]
        },
        properties: {
          name: key, // Include your custom properties here
        },
      };
    });

    return {
      type: "FeatureCollection",
      features: features,
    } as any;
  }

  private createGeoJSON(geo: GeoJSON) {
    this.worldMap = new SourceVector();
    this.worldMap.addFeatures(
      new GeoJSON().readFeatures(geo, {
        dataProjection: 'EPSG:4326',
        featureProjection: this.map?.getView().getProjection()
      }));

    /*const l = new VectorLayer({
      source: this.worldMap
    });
    this.map?.addLayer(l);*/
  }

  private fitPolygonsToScreen() {
    if (this.polyVector?.getFeatures()?.length) {
      this.map?.getView().fit(this.polyVector.getExtent(), {padding: [20, 20, 20, 20]});
    }
    if (this.markers?.getFeatures()?.length) {
      this.map?.getView().fit(this.markers.getExtent(), {padding: [20, 20, 20, 20]});
    }
  }

  private buildWorldMapPolygons() {
    const features: Feature[] = [];
    const useAxisAsKey = (this.data?.Cols[0]?.tuples?.length ?? 0) < 2;
    // Find indices for columns
    let keyIdx = this.getColumnIndexByDataProp('Key');
    if (keyIdx === -1) {
      keyIdx = this.getColumnIndexByDataProp('coordsProperty');
    }
    let valueIdx = this.getColumnIndexByDataProp('Value');
    if (valueIdx === -1) {
      valueIdx = this.getColumnIndexByDataProp('colorProperty');
    }

    if (keyIdx === -1) {
      keyIdx = 0;
    }
    if (valueIdx === -1) {
      if (useAxisAsKey) {
        valueIdx = 0;
      } else {
        valueIdx = 1;
      }
    }

    // Size of record
    const size = this.data?.Cols[0]?.tuples?.length || 2;

    let minV = Number.MAX_VALUE;
    let maxV = Number.MIN_VALUE;
    for (let k = 0; k < (this.data?.Cols[1]?.tuples?.length ?? -1); k++) {
      const v = this.data?.Data[k * size + valueIdx] as number;
      if (v < minV) {
        minV = v;
      }
      if (v > maxV) {
        maxV = v;
      }
    }


    for (let k = 0; k < (this.data?.Cols[1]?.tuples?.length ?? -1); k++) {
      let key = '';
      if (useAxisAsKey) {
        key = this.data?.Cols[1]?.tuples[k].caption ?? '';
      } else{
        key = this.data?.Data[k * size + keyIdx].toString() ?? '';
      }
      if (!key) {
        continue;
      }
      //const fe = geoFeatures.find(f => f.properties.name === key);
      const fe = this.worldMap?.getFeatures().find(f => f.get('name') === key.toString());
      if (!fe) {
        continue;
      }
      fe.set('dataIdx', k * size);
      fe.set('title', this.data?.Cols[1].tuples[k].caption);
      fe.set('path', this.data?.Cols[1].tuples[k].path);
      features.push(fe);

      /*const feature = new Feature({
        geometry: new MultiPolygon(fe.geometry.coordinates),
        key,
        title: key,
        dataIdx: k,
        path: this.mapData.Cols[1].tuples[k].path,
        desc: this.mapData.Cols[1].tuples[k].title
      });*/

      const value = this.data?.Data[k * size + valueIdx] as number;
      let v;
      if ((maxV - minV) === 0) {
        v = 255;
      } else {
        v = (value - minV) / (maxV - minV) * 255;
      }

      const x = (255 - v) / 255 * 120
      const color = `hsla(${x}, 100%, 50%, 0.6)`;


      const text = new Text({
        font: `8px Oxygen`,
        fill: new Fill({color: 'black'}),
        /*stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.6)',
          width: 2
        }),*/
        text: `${this.data?.Cols[1].tuples[k].caption}\n` + this.formatNumber(value, this.data?.Cols[1].tuples[k].format)
      });

      const _this = this;
      fe.setStyle(new Style({
        zIndex: 0,
        fill: new Fill({
          color
        }),
        stroke: this.defaultPolyStroke,
        /*geometry: function(feature: any){
          let retPoint;
          if (feature.getGeometry()?.getType() === 'MultiPolygon') {
            retPoint = _this.getMaxPoly(feature.getGeometry()?.getPolygons()).getInteriorPoint();
          } else if (feature.getGeometry().getType() === 'Polygon') {
            retPoint = feature.getGeometry().getInteriorPoint();
          }
          return retPoint;
        },*/
        text
      } as any));
    }

    this.featureOverlay?.getSource().clear();
    this.polyVector?.clear();
    this.polyVector?.addFeatures(features);

    this.fitPolygonsToScreen();
  }

  private getColumnIndexByDataProp(dataPropertyName: string) {
    if (!this.data) {
      return 0;
    }
    let idx = 0;
    const keyFieldName = this.getDataPropValue(dataPropertyName) || dataPropertyName;
    idx = this.getColumnIndexByName(this.data, keyFieldName);
    return idx;
  }

  private getFeatureText(feature: FeatureLike) {
    let dataIdx = feature.get('dataIdx');
    if (dataIdx === undefined) {
      return;
    }
    let res = '';
    const parts: string[] = [];

    // Name
    let title = '';
    if (feature.get('title')) {
      title = '<b>' + feature.get('title') + '</b><hr/>';
    }

    const lonLatNames = this.lonLatNames;
    for (let i = 0; i < (this.data?.Cols[0]?.tuples?.length ?? -1); i++) {
      const tuple = this.data?.Cols[0]?.tuples[i];
      const caption = tuple?.caption?.toLowerCase();
      // Don't include lon lat into tooltip text
      if (lonLatNames.includes(caption)) {
        continue;
      }
      // Don't include key field
      if (this.getDataPropValue('Key') === caption || caption === 'key') {
        continue;
      }
      let v = this.data?.Data[dataIdx + i]?.toString() ?? '';
      if (tuple?.format) {
        v = this.formatNumber(v, tuple.format);
      }
      if (v && tuple) {
        parts.push(`<b>${tuple.caption}:</b> ${v}`);
      }
    }
    res = title + parts.join('<br>');
    return res;
  }
}
