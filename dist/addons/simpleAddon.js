"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleAddon = void 0;
const core_1 = require("@angular/core");
const base_widget_class_1 = require("../app/components/widgets/base-widget.class");
let SimpleAddon = class SimpleAddon extends base_widget_class_1.BaseWidget {
    /**
     * You can use following services from base class
     *   el: ElementRef;
     *   us: UtilService;
     *   vs: VariablesService;
     *   ss: StorageService;
     *   ds: DataService;
     *   fs: FilterService;
     *   wts: WidgetTypeService;
     *   dbs: DashboardService;
     *   cfr: ComponentFactoryResolver;
     *   ns: NamespaceService;
     *   route: ActivatedRoute;
     *   i18n: I18nService;
     *   bs: BroadcastService;
     *   san: DomSanitizer;
     *   sbs: SidebarService;
     *   cd: ChangeDetectorRef;
     *   zone: NgZone;
     *
     *   example:
     *   {
     *       const filters = this.fs.getWidgetFilters('Windget 1');
     *   }
     */
    /**
     * Constructor of addon class
     * Always stay UNCHANGED, do not modify
     * initialize your addon inside ngOnInit method
     */
    constructor(inj) {
        super(inj);
        this.inj = inj;
    }
    /**
     * Initialization
     */
    ngOnInit() {
        super.ngOnInit();
        // Initialize addon here
        console.log('Hello!');
    }
    /**
     * Initialization after DOM element has been created and accessible
     */
    ngAfterViewInit() {
        // Here you can access this.el.nativeElement, to manipulate DOM
        this.drawOnCanvas();
    }
    /**
     * Draw on canvas
     */
    drawOnCanvas() {
        const canvas = this.canvas.nativeElement;
        const ctx = canvas.getContext('2d');
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.ellipse(x, y, Math.min(x, y), Math.min(x, y), 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
    }
    /**
     * Request data from server if needed
     */
    requestData() {
        super.requestData();
        // You can make you own data request here if it not supposed to run MDX
        // Or you need to call external REST API
    }
    /**
     * Parse retrieved data
     */
    retrieveData(data) {
        super.retrieveData(data);
        // Here you can parse data, and display it as needed
        // data - is MDX result
        if (data.Error) {
            return;
        }
        console.log(data);
    }
    /**
     * Drilldown processing
     */
    doDrill(path, name, category, noDrillCallback) {
        return super.doDrill(path, name, category, noDrillCallback);
    }
    /**
     * Drillup processing
     */
    doDrillUp() {
        super.doDrillUp();
    }
    /**
     * Resize callback
     */
    onResize() {
        // Use to redraw widget after resize event
        super.onResize();
        // Adjust canvas size to new widget size
        const canvas = this.canvas.nativeElement;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        // Redraw
        this.drawOnCanvas();
    }
};
SimpleAddon.AddonInfo = {
    // Version of addon system, should be specified manually as number, not reference
    // version always should be equal to BaseWidget.CURRENT_ADDON_VERSION
    // used to compare unsupported addons when breaking changes are made into BaseWidget
    // Note: do not use reference to BaseWidget.CURRENT_ADDON_VERSIO here!
    // specify number MANUALLY
    version: 1,
    // Widget type
    // 'custom' for all non-standard widgets
    // 'chart' for highcharts widget
    type: 'custom'
};
__decorate([
    core_1.ViewChild('canvas', { static: false })
], SimpleAddon.prototype, "canvas", void 0);
SimpleAddon = __decorate([
    core_1.Component({
        selector: 'dsw-simple-addon',
        template: `
        <h2>Hello, this is simple addon component</h2>
        <button (click)="requestData()">Refresh</button>
        <canvas #canvas></canvas>
    `,
        styles: [`
        :host {
            padding: 10px;
        }

        h1 {
            color: green;
        }

        canvas {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            pointer-events: none;
        }
    `]
    }),
    __param(0, core_1.Inject(core_1.Injector))
], SimpleAddon);
exports.SimpleAddon = SimpleAddon;
