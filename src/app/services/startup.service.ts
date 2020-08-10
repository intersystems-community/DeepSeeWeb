import {EventEmitter, Injectable} from '@angular/core';
import {dsw} from '../../environments/dsw';
import {DisplayGrid, GridsterConfigService, GridsterItem, GridsterItemComponentInterface} from 'angular-gridster2';
import {DataService, NAMESPACE} from './data.service';
import {HttpClient} from '@angular/common/http';
import {WidgetTypeService} from './widget-type.service';
import {StorageService} from './storage.service';
import {NamespaceService} from './namespace.service';

@Injectable({
    providedIn: 'root'
})
export class StartupService {
    constructor(private ds: DataService,
                private http: HttpClient,
                private wt: WidgetTypeService,
                private st: StorageService,
                private ns: NamespaceService) {
    }

    /**
     * Initializes app startup
     */
    initialize() {
        dsw.mobile = screen.availWidth <= 600;
        this.setupGridster();

        return new Promise((res, rej) => {
            Promise.all([
                //  this.loadServerSettings(),
                this.ds.loadMainConfig(),
                this.loadAddons()
            ])
           .finally(()=> res());
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
                if (addons && addons.length) {
                    dsw.addons = [...addons];
                    for (let i = 0; i < dsw.addons.length; i++) {
                        const a = dsw.addons[i].split('.');
                        a.pop();
                        dsw.addons[i] = a.join('.');
                    }
                }
                return this.wt.initialize();
            })
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
        GridsterConfigService.isMobile = dsw.mobile; // stacks the grid items if true;
        if (dsw.mobile) {
            GridsterConfigService.mobileBreakPoint = 2000;// if the screen is not wider that this, remove the grid layout and stack the items
            //gridsterConfig.mobileModeEnabled = true;
        }
        // Check for shared widget screen and disable mobile breakpoint
        if (window.location.href.split('#').pop().indexOf('widget=') !== -1) {
            GridsterConfigService.mobileBreakPoint = 0;
        }

        GridsterConfigService.resizable.start = () => {
            GridsterConfigService.isResizing = true;
        };
        GridsterConfigService.resizable.stop = () => {
            GridsterConfigService.isResizing = false;
        };
        GridsterConfigService.draggable.start = () => {
            GridsterConfigService.isDragging = true;
        };
        GridsterConfigService.draggable.stop = () => {
            GridsterConfigService.isDragging = false;
        };
    }
}
