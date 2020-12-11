import {Injectable} from '@angular/core';
import {dsw} from '../../environments/dsw';
import {DisplayGrid, GridsterConfigService, GridsterItem, GridsterItemComponentInterface} from 'angular-gridster2';
import {DataService, NAMESPACE} from './data.service';
import {HttpClient} from '@angular/common/http';
import {WidgetTypeService} from './widget-type.service';
import {StorageService} from './storage.service';
import {NamespaceService} from './namespace.service';
import * as AngularCommon from '@angular/common';
import * as AngularCore from '@angular/core';
import {UtilService} from './util.service';

declare const __webpack_exports__: any;
declare const __webpack_require__: any;
declare const webpackJsonp: any;

@Injectable({
    providedIn: 'root'
})
export class StartupService {
    constructor(private ds: DataService,
                private http: HttpClient,
                private wt: WidgetTypeService,
                private us: UtilService,
                private st: StorageService,
                private ns: NamespaceService) {
    }

    /**
     * Initializes app startup
     */
    initialize() {
        dsw.mobile = screen.availWidth <= 576;
        this.setupGridster();

        if (this.us.isMobile()) {
            this.setupMobile();
        }

        return new Promise((res, rej) => {
            Promise.all([
                //  this.loadServerSettings(),
                this.ds.loadMainConfig(),
                this.loadAddons()
            ])
           .finally(() => res());
        });
        // TODO: mobile support
        // if (dsw.mobile) {
        //     loadjscssfile('cordova.js', 'js');
        //     loadjscssfile('css/mobile.css', 'css');
        //     var oldError = console.error;
        //     console.error = function(e) {
        //         oldError.apply(this, arguments);
        //         //alert(e);
        //         if (!dsw.erros) {
        //             dsw.errors = [];
        //         }
        //         dsw.errors.push(e);
        //     };
        //     //window.onerror = function(e) {
        //     //    alert(e);
        //     //};
        //     document.addEventListener('DOMContentLoaded', function() {
        //         document.body.style['background-color'] = 'black';
        //         FastClick.attach(document.body);
        //     }, false);
        // }
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
        return this.ds.loadAddons()
            .catch((e) => {
                console.log(`Can't load addons: ${e}`);
            })
            .then((addons: any[]) => {
                // Folr dev purposes, replace addons with devAddons if set in localstorage
                if (localStorage.devAddons) {
                    addons = JSON.parse(localStorage.devAddons);
                }
                const promises = [];
                if (addons && addons.length) {
                    dsw.addons = [...addons];
                    for (let i = 0; i < dsw.addons.length; i++) {
                        const name = dsw.addons[i].split('/').pop().replace('.js', '');
                        promises.push(this.loadAddon(dsw.addons[i], name));
                    }
                }
                return Promise.all(promises);
            });
            //.then(() => {
                // TODO: broadcast
                // $rootScope.$broadcast('addons:loaded', addons);
            ///})
            //.then(() => {
               // return this.loadSettings();
            //});
    }

    private setupGridster() {
        // GridsterConfigService.itemResizeCallback = (item: GridsterItem, itemComponent: GridsterItemComponentInterface) => {
        //     this.onGridsterItemChange.emit({item, itemComponent});
        // };
        GridsterConfigService.displayGrid = DisplayGrid.None;
        GridsterConfigService.draggable.dragHandleClass = '.drag-handle';
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
        GridsterConfigService.gridType = 'scrollVertical';
        GridsterConfigService.minCols = 12;
        GridsterConfigService.maxCols = 12;
        GridsterConfigService.floating = true;
        GridsterConfigService.pushItems = true;
        GridsterConfigService.resizable.enabled = false;
        GridsterConfigService.draggable.enabled = false;
        GridsterConfigService.margin = 5;
        // GridsterConfigService.isMobile = dsw.mobile; // stacks the grid items if true;
        GridsterConfigService.mobileBreakPoint = 576;
       /* if (dsw.mobile) {
            GridsterConfigService.mobileBreakPoint = 576;// if the screen is not wider that this, remove the grid layout and stack the items
            //gridsterConfig.mobileModeEnabled = true;
        }*/
        // Check for shared widget screen and disable mobile breakpoint
        if (window.location.href.split('#').pop().indexOf('widget=') !== -1) {
            GridsterConfigService.mobileBreakPoint = 0;
        }
    }

    private loadAddon(url: any, addonName: string) {
        return new Promise((res, rej) => {
            const script = document.createElement('script');
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
                // });
        });
    }

    private setupMobile() {
        // We listen to the resize event
        window.addEventListener('resize', () => {
            // We execute the same script as before
            const  vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        });
    }
}
