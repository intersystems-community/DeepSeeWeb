import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {BaseWidget} from "../app/components/widgets/base-widget.class";
import {IAddonInfo} from "../app/services/dsw.types";

@Component({
  standalone: true,
  template: `
    <iframe [src]="url" style="border: none; width:100%; height:100%; flex: 1 1 100%"></iframe>`
})
export class HtmlViewer extends BaseWidget implements OnInit, OnDestroy {
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
  private san = inject(DomSanitizer);
  private subOnFilter: Subscription;


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
