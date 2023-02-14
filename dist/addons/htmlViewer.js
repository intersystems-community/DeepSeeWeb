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
exports.HtmlViewer = void 0;
const core_1 = require("@angular/core");
const base_widget_class_1 = require("../app/components/widgets/base-widget.class");
let HtmlViewer = class HtmlViewer extends base_widget_class_1.BaseWidget {
    /**
     * Constructor of addon class
     * Always stay UNCHANGED, do not modify
     * initialize your addon inside ngOnInit method
     */
    constructor(inj) {
        super(inj);
        this.inj = inj;
        this.isSpinner = false;
    }
    ngOnInit() {
        this.url = this.san.bypassSecurityTrustResourceUrl(this.getUrl());
        this.subOnFilter = this.fs.onApplyFilter.subscribe(flt => {
            this.url = this.san.bypassSecurityTrustResourceUrl(this.getUrl().replace('$$$FILTERS', encodeURIComponent(flt.value)));
        });
    }
    getUrl() {
        var _a, _b;
        return ((_b = (_a = this.widget) === null || _a === void 0 ? void 0 : _a.properties) === null || _b === void 0 ? void 0 : _b.Data) || '';
    }
    ngOnDestroy() {
        this.subOnFilter.unsubscribe();
        super.ngOnDestroy();
    }
};
HtmlViewer.AddonInfo = {
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
HtmlViewer = __decorate([
    (0, core_1.Component)({
        template: `
        <iframe [src]="url" style="border: none; width:100%; height:100%; flex: 1 1 100%"></iframe>`
    }),
    __param(0, (0, core_1.Inject)(core_1.Injector))
], HtmlViewer);
exports.HtmlViewer = HtmlViewer;
