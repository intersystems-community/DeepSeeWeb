import {DataService} from "../../../services/data.service";
import {VariablesService} from "../../../services/variables.service";
import {FilterService} from "../../../services/filter.service";
import {UtilService} from "../../../services/util.service";
import {StorageService} from "../../../services/storage.service";
import {SidebarService} from "../../../services/sidebar.service";
import {ErrorService} from "../../../services/error.service";
import {HeaderService} from "../../../services/header.service";
import {DashboardService} from "../../../services/dashboard.service";
import {ActivatedRoute} from "@angular/router";
import {I18nService} from "../../../services/i18n.service";
import {NamespaceService} from "../../../services/namespace.service";
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from "@angular/core";
import {BroadcastService} from "../../../services/broadcast.service";
import {EditorService, IEditedWidgetChangedEvent} from "../../../services/editor.service";
import {MenuService} from "../../../services/menu.service";
import {WidgetComponent} from "../../widgets/base/widget/widget.component";
import {GridsterComponent} from "angular-gridster2";
import {IWidgetDesc} from "../../../services/dsw.types";
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  template: '',
  standalone: true
})
export class DashboardEditingClass implements OnDestroy {
  // Public
  @ViewChild('gridster') gridster!: GridsterComponent;
  @ViewChildren('widgets') widgets!: QueryList<WidgetComponent>;
  list: IWidgetDesc[] = [];
  editedWidget?: IWidgetDesc;

  // Services
  protected dbs = inject(DashboardService);
  protected cd = inject(ChangeDetectorRef);
  protected eds = inject(EditorService);
  protected route = inject(ActivatedRoute);
  protected ss = inject(StorageService);
  protected ns = inject(NamespaceService);
  protected ds = inject(DataService);
  protected sbs = inject(SidebarService);
  protected fs = inject(FilterService);
  protected bs = inject(BroadcastService);
  protected ms = inject(MenuService);
  protected r2 = inject(Renderer2);
  protected us = inject(UtilService);
  protected hs = inject(HeaderService);
  protected vs = inject(VariablesService);
  protected i18n = inject(I18nService);
  protected es = inject(ErrorService);

  // On edited widget changed
  private subOnEditedWidgetChanged = this.eds.onEditedWidgetChanged.pipe(takeUntilDestroyed());
  // On add new widget
  private subOnNewWidget = this.eds.onNewWidget.pipe(takeUntilDestroyed());
  // On save
  private subOnSaveWidget = this.eds.onSave.pipe(takeUntilDestroyed());
  // On cancel editing
  private subCancelEditing = this.eds.onCancelEditing.pipe(takeUntilDestroyed());
  // On delete widget
  private subOnDeleteWidget = this.eds.onDeleteWidget.pipe(takeUntilDestroyed());

  // Private
  private scrollToNewWidgetTimeout?: ReturnType<typeof setTimeout>;

  ngOnDestroy() {
    clearTimeout(this.scrollToNewWidgetTimeout);
  }

  protected getWidgetByInfo(info?: IWidgetDesc) {
    if (!info) {
      return;
    }
    return this.widgets.find((w) => w.widget === info);
  }

  protected subscribeForEditing() {
    // On edited widget changed
    this.subOnEditedWidgetChanged.subscribe(e => this.updateEditedWidget(e));

    // On add new widget
    this.subOnNewWidget.subscribe(w => this.newWidget(w as IWidgetDesc));

    // On save
    this.subOnSaveWidget.subscribe(() => this.onSaveWidget());

    // On cancel editing
    this.subCancelEditing.subscribe(() => this.cancelEditing());

    // On delete widget
    this.subOnDeleteWidget.subscribe(w => this.deleteWidget(w as IWidgetDesc))
  }

  private updateEditedWidget(e: IEditedWidgetChangedEvent) {
    if (!this.editedWidget) {
      this.editedWidget = e.widget as IWidgetDesc;
    }

    const w = this.getWidgetByInfo(this.editedWidget);
    if (w) {
      w.header?.cd.detectChanges();
      w.cd.detectChanges();

      if (e.refreshData) {
        w.requestData();
      }
    }

    this.detectChanges();
  }

  private newWidget(w: IWidgetDesc) {
    const last = this.dbs.getWidgetsWithoutEmpty().pop();
    if (last) {
      w.cols = last.cols;
      w.rows = last.rows;
    }
    this.editedWidget = w;
    this.list.push(this.editedWidget);
    const pos = this.gridster.getFirstPossiblePosition(this.editedWidget);
    this.editedWidget.x = pos.x;
    this.editedWidget.y = pos.y;
    this.editedWidget.cols = pos.cols;
    this.editedWidget.rows = pos.rows;

    this.detectChanges();

    this.scrollNewWidgetIntoView();
  }

  private onSaveWidget() {
    if (this.editedWidget) {
      this.editedWidget.edKey = '';
    }
    this.editedWidget = undefined;

    this.detectChanges();
  }

  private cancelEditing() {
    if (!this.editedWidget) {
      return;
    }

    const idx = this.list.indexOf(this.editedWidget);

    if (this.editedWidget?.oldWidget) {
      this.editedWidget = this.editedWidget.oldWidget;
      this.editedWidget.edKey = 'ed' + new Date().getTime();
      this.list[idx] = this.editedWidget;

      this.cd.detectChanges();
      this.editedWidget.edKey = '';
      this.editedWidget = undefined;

      this.detectChanges();
      return;
    } else {
      if (idx !== -1) {
        this.list.splice(idx, 1);
      }
    }
    this.editedWidget = undefined;
    this.detectChanges();
  }

  private scrollNewWidgetIntoView() {
    clearTimeout(this.scrollToNewWidgetTimeout);
    this.scrollToNewWidgetTimeout = setTimeout(() => {
      const el = document.getElementById('edited-widget');
      if (!el) {
        return;
      }
      el.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }, 300);
  }

  private detectChanges() {
    const sX = this.gridster.el.scrollLeft;
    const sY = this.gridster.el.scrollTop;
    this.cd.detectChanges();
    this.gridster.onResize();
    this.gridster.el.scrollLeft = sX;
    this.gridster.el.scrollTop = sY;
  }

  private deleteWidget(w: IWidgetDesc) {
    this.editedWidget = undefined;
    const idx = this.list.indexOf(w);
    if (idx !== -1) {
      this.list.splice(idx, 1);
    }
    this.list = [...this.list];
    this.cd.detectChanges();
  }
}
