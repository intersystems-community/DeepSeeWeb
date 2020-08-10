import {Component, OnInit} from '@angular/core';
import {BaseWidget} from './base-widget.class';
import {Subscription} from 'rxjs';
import {SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

@Component({
    template: `
        <iframe [src]="url" style="border: none; width:100%; height:100%; flex: 1 1 100%"></iframe>`
})
export class HtmlViewerComponent extends BaseWidget implements OnInit {
    isSpinner = false;
    url: SafeResourceUrl;
    private subOnFilter: Subscription;

    ngOnInit(): void {
        this.url = this.san.bypassSecurityTrustResourceUrl(this.getUrl());

        this.subOnFilter = this.fs.onApplyFilter.subscribe(flt => {
            this.url = this.san.bypassSecurityTrustResourceUrl(this.getUrl().replace('$$$FILTERS', encodeURIComponent(flt.value)));
        })
    }

    getUrl(): string {
        return this.widget?.properties?.Data || '';
    }

    ngOnDestroy() {
        this.subOnFilter.unsubscribe();
        super.ngOnDestroy();
    }
}
