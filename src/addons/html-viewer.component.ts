import {Component, Inject, Injector, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import {BaseWidget, IAddonInfo} from "../app/components/widgets/base-widget.class";

@Component({
    template: `
        <iframe [src]="url" style="border: none; width:100%; height:100%; flex: 1 1 100%"></iframe>`
})
export class HtmlViewerComponent extends BaseWidget implements OnInit, OnDestroy {
    static AddonInfo: IAddonInfo = {
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

    isSpinner = false;
    url: SafeResourceUrl;
    private subOnFilter: Subscription;

    /**
     * Constructor of addon class
     * Always stay UNCHANGED, do not modify
     * initialize your addon inside ngOnInit method
     */
    constructor(@Inject(Injector) protected inj: Injector) {
        super(inj);
    }

    ngOnInit(): void {
        this.url = this.san.bypassSecurityTrustResourceUrl(this.getUrl());

        this.subOnFilter = this.fs.onApplyFilter.subscribe(flt => {
            this.url = this.san.bypassSecurityTrustResourceUrl(this.getUrl().replace('$$$FILTERS', encodeURIComponent(flt.value)));
        });
    }

    getUrl(): string {
        return this.widget?.properties?.Data || '';
    }

    ngOnDestroy() {
        this.subOnFilter.unsubscribe();
        super.ngOnDestroy();
    }
}
