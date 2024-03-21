import {DataService} from "../../../services/data.service";
import {VariablesService} from "../../../services/variables.service";
import {FilterService} from "../../../services/filter.service";
import {UtilService} from "../../../services/util.service";
import {StorageService} from "../../../services/storage.service";
import {SidebarService} from "../../../services/sidebar.service";
import {ErrorService} from "../../../services/error.service";
import {HeaderService} from "../../../services/header.service";
import {DashboardService} from "../../../services/dashboard.service";
import {ActivatedRoute, Router} from "@angular/router";
import {I18nService} from "../../../services/i18n.service";
import {NamespaceService} from "../../../services/namespace.service";
import {
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    OnDestroy,
    QueryList,
    Renderer2, ViewChild,
    ViewChildren
} from "@angular/core";
import {BroadcastService} from "../../../services/broadcast.service";
import {EditorService, IEditedWidgetChangedEvent} from "../../../services/editor.service";
import {MenuService} from "../../../services/menu.service";
import {IWidgetInfo} from "../../widgets/base-widget.class";
import {Subscription} from "rxjs";
import {WidgetComponent} from "../../widgets/base/widget/widget.component";
import {GridsterComponent} from "angular-gridster2";

@Component({
    template: ''
})
export class DashboardEditingClass implements OnDestroy {
    // Services
    protected ds: DataService;
    protected vs: VariablesService;
    protected fs: FilterService;
    public us: UtilService;
    protected ss: StorageService;
    protected sbs: SidebarService;
    protected es: ErrorService;
    protected hs: HeaderService;
    public dbs: DashboardService;
    protected router: Router;
    protected i18n: I18nService;
    protected ns: NamespaceService;
    protected cd: ChangeDetectorRef;
    protected bs: BroadcastService;
    protected eds: EditorService;
    protected r2: Renderer2;
    protected ms: MenuService;
    protected route: ActivatedRoute;

    // Private
    private subOnNewWidget?: Subscription;
    private subOnEditedWidgetChanged?: Subscription;
    private scrollToNewWidgetTimeout?: ReturnType<typeof setTimeout>;
    private subCancelEditing?: Subscription;
    private subOnSaveWidget?: Subscription;
    private subOnDeleteWidget?: Subscription;

    // Public
    @ViewChild('gridster') gridster!: GridsterComponent;
    @ViewChildren('widgets') widgets!: QueryList<WidgetComponent>;
    list: IWidgetInfo[] = [];
    editedWidget?: IWidgetInfo;


    constructor(@Inject(Injector) protected inj: Injector) {
        this.ds = this.inj.get(DataService);
        this.vs = this.inj.get(VariablesService);
        this.fs = this.inj.get(FilterService);
        this.us = this.inj.get(UtilService);
        this.ss = this.inj.get(StorageService);
        this.sbs = this.inj.get(SidebarService);
        this.es = this.inj.get(ErrorService);
        this.hs = this.inj.get(HeaderService);
        this.dbs = this.inj.get(DashboardService);
        this.router = this.inj.get(Router);
        this.i18n = this.inj.get(I18nService);
        this.ns = this.inj.get(NamespaceService);
        this.cd = this.inj.get(ChangeDetectorRef);
        this.bs = this.inj.get(BroadcastService);
        this.eds = this.inj.get(EditorService);
        this.r2 = this.inj.get(Renderer2);
        this.ms = this.inj.get(MenuService);
        this.route = this.inj.get(ActivatedRoute);
    }

    protected getWidgetByInfo(info?: IWidgetInfo) {
        if (!info) {
            return;
        }
        return this.widgets.find((w) => w.widget === info);
    }

    protected subscribeForEditing() {
        // On edited widget changed
        this.subOnEditedWidgetChanged = this.eds.onEditedWidgetChanged.subscribe(e => this.updateEditedWidget(e));

        // On add new widget
        this.subOnNewWidget = this.eds.onNewWidget.subscribe(w => this.newWidget(w as IWidgetInfo));

        // On save
        this.subOnSaveWidget = this.eds.onSave.subscribe(() => this.onSaveWidget());

        // On cancel editing
        this.subCancelEditing = this.eds.onCancelEditing.subscribe(() => this.cancelEditing());

        // On delete widget
        this.subOnDeleteWidget = this.eds.onDeleteWidget.subscribe(w => this.deleteWidget(w as IWidgetInfo))
    }

    private updateEditedWidget(e: IEditedWidgetChangedEvent) {
        if (!this.editedWidget) {
           this.editedWidget = e.widget as IWidgetInfo;
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

    private newWidget(w: IWidgetInfo) {
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
        }  else {
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
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }

    ngOnDestroy() {
        clearTimeout(this.scrollToNewWidgetTimeout);
        this.subOnNewWidget?.unsubscribe();
        this.subOnEditedWidgetChanged?.unsubscribe();
        this.subCancelEditing?.unsubscribe();
        this.subOnSaveWidget?.unsubscribe();
        this.subOnDeleteWidget?.unsubscribe();
    }

    private detectChanges() {
        const sX = this.gridster.el.scrollLeft;
        const sY = this.gridster.el.scrollTop;
        this.cd.detectChanges();
        this.gridster.onResize();
        this.gridster.el.scrollLeft = sX;
        this.gridster.el.scrollTop = sY;
    }

    private deleteWidget(w: IWidgetInfo) {
        this.editedWidget = undefined;
        const idx = this.list.indexOf(w);
        if (idx !== -1) {
            this.list.splice(idx, 1);
        }
        this.list = [...this.list];
        this.cd.detectChanges();
    }
}
