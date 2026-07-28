import {Component, DoCheck, inject, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {Subscription} from 'rxjs';
import {BaseWidget} from '../app/components/widgets/base-widget.class';
import {IAddonInfo, IMDXData} from '../app/services/dsw.types';
import {buildHtmlViewerMarkup} from '../app/services/html-viewer.util';

@Component({
  standalone: true,
  template: '<div class="html-viewer" [innerHTML]="markup"></div>',
  styles: [`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
    }

    .html-viewer {
      display: flex;
      flex: 1 1 auto;
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  `]
})
export class HtmlViewer extends BaseWidget implements OnInit, DoCheck, OnDestroy {
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
  markup?: SafeHtml;
  private san = inject(DomSanitizer);
  private subOnFilter?: Subscription;
  private subLinkedWidgetData?: Subscription;
  private currentData = '';
  private currentFilters = '';
  private currentWidgetData = '';

  ngOnInit(): void {
    if (this.widget?.dataLink) {
      // htmlViewer does not request MDX itself. It renders payload that the source widget pushes on refresh.
      this.subLinkedWidgetData = this.bs.subscribe('setLinkedWidgetData:' + this.widget.dataLink, (data: IMDXData) => {
        this._currentData = data;
        this.updateMarkup(this.currentFilters);
        this.cd.detectChanges();
        this.parent?.cd.detectChanges();
      });
    }

    super.ngOnInit();
    this.updateMarkup();

    if (this.widget?.dataLink) {
      setTimeout(() => this.bs.broadcast('refresh:' + this.widget.dataLink), 0);
    }

    this.subOnFilter = this.fs.onApplyFilter.subscribe(flt => this.updateMarkup(flt.value));
  }

  ngDoCheck() {
    const nextData = this.getData();
    const nextWidgetData = this.getWidgetDataSignature();
    if (nextData !== this.currentData || nextWidgetData !== this.currentWidgetData) {
      this.updateMarkup(this.currentFilters);
    }
  }

  getData(): string {
    return this.widget?.properties?.Data || '';
  }

  override requestData() {
    this.clearError();
    this.isSpinner = false;
    this.updateMarkup(this.currentFilters);
    this.cd.detectChanges();
    this.parent?.cd.detectChanges();
  }

  private updateMarkup(filters = '') {
    this.currentFilters = filters;
    this.currentData = this.getData();
    this.currentWidgetData = this.getWidgetDataSignature();
    this.markup = this.san.bypassSecurityTrustHtml(buildHtmlViewerMarkup(this.currentData, {
      filters,
      widgetData: this._currentData
    }));
  }

  private getWidgetDataSignature(): string {
    try {
      return JSON.stringify(this._currentData || null);
    } catch {
      return '';
    }
  }

  ngOnDestroy() {
    this.subOnFilter?.unsubscribe();
    this.subLinkedWidgetData?.unsubscribe();
    super.ngOnDestroy();
  }
}
