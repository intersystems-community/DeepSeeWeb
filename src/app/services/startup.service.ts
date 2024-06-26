import * as AngularCore from '@angular/core';
import {Injectable} from '@angular/core';
import * as TSLib from 'tslib';
import * as HighchartsHighstock from 'highcharts/highstock';
import * as BrowserDynamic from '@angular/platform-browser-dynamic';
import {dsw} from '../../environments/dsw';
import {DisplayGrid, GridsterConfigService} from 'angular-gridster2';
import {DataService} from './data.service';
import {WidgetTypeService} from './widget-type.service';
import {StorageService} from './storage.service';
import {NamespaceService} from './namespace.service';
import {UtilService} from './util.service';
import {BaseWidget} from '../components/widgets/base-widget.class';
import {BaseChartClass} from '../components/widgets/charts/base-chart.class';
import {SidebarService} from './sidebar.service';
import {BroadcastService} from './broadcast.service';
import {I18nService} from './i18n.service';
import {DashboardService} from './dashboard.service';
import {FilterService} from './filter.service';
import {VariablesService} from './variables.service';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class StartupService {
  constructor(private ds: DataService,
              private wt: WidgetTypeService,
              private us: UtilService) {
  }

  async initialize() {
    dsw.mobile = screen.availWidth <= 576;
    this.setupGridster();

    if (this.us.isMobile()) {
      this.setupMobile();
    }

    try {
      await Promise.all([
        this.ds.loadMainConfig(),
        this.loadAddons(),
      ].map(p => p.catch(() => {
      })));
    } catch {
    }
  }

  // private async loadServerSettings() {
  //     return new Promise((res, rej) => {
  //         // Get list of available namespaces
  //         this.ds.getSettings(this.ns.getCurrent()).then((data: any) => {
  //             this.st.loadServerSettings(data);
  //             this.ns.setNamespaces(data.Mappings.Mapped);
  //             res();
  //         })
  //             .catch(e => {
  //                 // Try to load from default namespace
  //                 this.ds.getSettings(NAMESPACE).then((data: any) => {
  //                     this.ns.setNamespaces(data.Mappings.Mapped);
  //                 })
  //                     .catch(e => {
  //                         this.
  //                     });
  //                 //.finally(() => res());
  //             })
  //
  //     });
  // }

  private async loadAddons() {
    try {
      let addons = await this.ds.loadAddons();
      // For dev purposes, replace addons with devAddons if set in localStorage
      if (localStorage.devAddons) {
        try {
          addons = JSON.parse(localStorage.devAddons);
        } catch {
        }
      }
      const promises: Promise<void>[] = [];
      if (addons && addons.length) {
        dsw.addons = [...addons];
        for (let i = 0; i < dsw.addons.length; i++) {
          const name = (dsw.addons[i] as string).split('/').pop()?.replace('.js', '');
          promises.push(this.loadAddon(dsw.addons[i], name || '').catch(() => {
          }));
        }
      }
      await Promise.all(promises);
    } catch (e) {
      console.log(`Can't load addons: ${e}`);
    }
  }

  private setupGridster() {
    GridsterConfigService.displayGrid = DisplayGrid.None;
    if (GridsterConfigService.draggable) {
      GridsterConfigService.draggable.dragHandleClass = '.drag-handle';
    }
    if (GridsterConfigService.resizable) {
      GridsterConfigService.resizable.handles = {
        s: false,
        e: false,
        n: false,
        w: false,
        se: true,
        ne: false,
        sw: false,
        nw: false
      };
    }
    GridsterConfigService.gridType = 'scrollVertical';
    GridsterConfigService.minCols = 12;
    GridsterConfigService.maxCols = 12;
    GridsterConfigService.floating = true;
    GridsterConfigService.pushItems = true;
    if (GridsterConfigService.resizable) {
      GridsterConfigService.resizable.enabled = false;
    }
    if (GridsterConfigService.draggable) {
      GridsterConfigService.draggable.enabled = false;
    }
    GridsterConfigService.margin = 5;
    // GridsterConfigService.isMobile = dsw.mobile; // stacks the grid items if true;
    GridsterConfigService.mobileBreakPoint = 576;
    /* if (dsw.mobile) {
         GridsterConfigService.mobileBreakPoint = 576;// if the screen is not wider that this, remove the grid layout and stack the items
         //gridsterConfig.mobileModeEnabled = true;
     }*/
    // Check for shared widget screen and disable mobile breakpoint
    if (window.location.href.split('#').pop()?.indexOf('widget=') !== -1) {
      GridsterConfigService.mobileBreakPoint = 0;
    }
  }

  private async loadAddon(url: any, addonName: string): Promise<void> {
    let resp: Response;
    try {
      resp = await fetch(url);
    } catch {
      return;
    }
    if (!resp) {
      return;
    }
    let file = await resp.text();

    // Create exports object to store module exports
    window.exports = {};

    // Shared modules for "require"
    const modules = {
      tslib: TSLib,
      '@angular/core': AngularCore,
      '@angular/platform-browser': BrowserModule,
      'highcharts/highstock': HighchartsHighstock,
      '@angular/platform-browser-dynamic': BrowserDynamic,
      '@angular/common': CommonModule,
      '@angular/router': RouterModule,
      /*'highcharts/highcharts-more': HighchartsMore,
      'highcharts/modules/treemap': HighchartsModulesTreemap,
      'highcharts/modules/heatmap': HighchartsModulesHeatmap,
      'highcharts/modules/exporting': HighchartsModulesExporting,
      'highcharts/modules/map': HighchartsModulesMap,*/
      '../app/services/util.service': {UtilService},
      '../app/services/variables.service': {VariablesService},
      '../app/services/storage.service': {StorageService},
      '../app/services/data.service': {DataService},
      '../app/services/filter.service': {FilterService},
      '../app/services/widget-type.service': {WidgetTypeService},
      '../app/services/dashboard.service': {DashboardService},
      '../app/services/namespace.service': {NamespaceService},
      '../app/services/i18n.service': {I18nService},
      '../app/services/broadcast.service': {BroadcastService},
      '../app/services/sidebar.service': {SidebarService},
      '../app/components/widgets/base-widget.class': {BaseWidget},
      '../app/components/widgets/charts/base-chart.class': {BaseChartClass}
    };

    // Replace require
    // @ts-ignore
    window.require = (m) => {
      if (!modules[m]) {
        console.error(`Can't find module ${m} in required shim.`);
      }
      return modules[m];
    };

    // Add filename for dev tools
    if (!environment.production) {
      file += '\r\n//# sourceURL=' + url;
    }

    // Eval addon script file
    // tslint:disable-next-line:no-eval
    // @ts-ignore
    const ev = 'eval';
    window[ev](file);

    // Find component in exports
    // Only one export is allowed so component is first function
    let module: any;
    let name = '';
    for (const k in exports) {
      if (exports[k].toString().startsWith('class')) {
        module = exports[k];
        name = k;
        break;
      }
    }

    /* const moduleFactory = this.compiler.compileModuleSync(name);
     const moduleRef = moduleFactory.create(this.parentInjector);
     const resolver = moduleRef.componentFactoryResolver;
     const compFactory = resolver.resolveComponentFactory(AComponent);*/
    if (module) {
      /*const compiledModule = this.compiler.compileModuleAndAllComponentsSync(module);
      // Get addon info
      const factory = compiledModule.componentFactories[0];
      const info = (factory.componentType as any).AddonInfo;
      const curVer = BaseWidget.CURRENT_ADDON_VERSION;
      if (info.version !== curVer) {
          console.warn(`Addon '${url}' version is not equal to supported addons version of DSW installed. Current version: ${curVer}, addon version: ${info.version}. Please recompile your addon with appropriate DSW version.`);
      }*/

      const fileName = url.split('/').pop().replace(/dsw.addons./ig, '')
        .split('.').slice(0, -1).join('.');

      const info = module.AddonInfo;
      if (info.overrideBaseType) {
        this.wt.register(info.overrideBaseType, info?.type || 'custom', module, info);
      } else {
        this.wt.register(fileName, info?.type || 'custom', module, info);
      }
      // this.wt.register(fileName, info?.type || 'custom', factory.componentType, info);
    } else {
      console.warn(`Can't load addon for file: ${url}. Exported class not found.`);
    }
    /*const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
    script.onload = () => {

    //fetch(url)
    //                .then(response => response.text())
    //.then(source => {
    //     if (!source) {
    //         console.error(`Can't load addon: ${url}`);
    //         res();
    //         return;
    //     }
        try {
            // Modules used during loading
            const modules = {
                '@angular/core': AngularCore,
                '@angular/common': AngularCommon
            };

            // Replace require
            const require = (module) => modules[module];

            // Eval addon source code
            // tslint:disable-next-line:no-eval
            // eval(source);

            // Save already exported components
            const exists = Object.keys(__webpack_exports__);

            // Get module from webpack
            const newModule = webpackJsonp[webpackJsonp.length - 1];
            const name = newModule[0];
            const moduleData = newModule[1];
            const key = Object.keys(moduleData)[0];
            // Exec module
            moduleData[key]('', __webpack_exports__, __webpack_require__);

            // Find all exported components
            const all = Object.keys(__webpack_exports__);
            // Find new one added comparing wit exists before
            const componentName = all.filter(c => exists.indexOf(c) === -1)[0];

            // Get addon info
            const info = __webpack_exports__[componentName].AddonInfo;

            // Register addon
            this.wt.register(addonName, info?.type || 'custom', __webpack_exports__[componentName], info);
            res();
        } catch (e) {
            console.error(e);
            res();
        }
    };

    script.onerror = () => res();
    // .catch((e) => {
    //     console.error(e);
    //     res();
    // });*/
  }

  private setupMobile() {
    window.addEventListener('resize', () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
  }
}
