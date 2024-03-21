import {EventEmitter, Injectable} from '@angular/core';
import {DashboardService} from "./dashboard.service";
import {IWidgetInfo} from "../components/widgets/base-widget.class";
import {DataService} from "./data.service";
import {ModalService} from "./modal.service";
import {SidebarService} from "./sidebar.service";
import {BehaviorSubject} from "rxjs";
import {BroadcastService} from "./broadcast.service";
import {TypeAndDatasourceComponent} from "../components/editor/type-and-datasource/type-and-datasource.component";
import {ErrorService} from "./error.service";
import {WidgetEditorComponent} from "../components/editor/widget-editor/widget-editor.component";

export interface IWidgetListItem {
    label: string;
    name: string;
}

export interface IEditedWidgetChangedEvent {
    widget: Partial<IWidgetInfo>;
    refreshData?: boolean;
    reCreate?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class EditorService {
    onCancelEditing = new EventEmitter<void>();
    onNewWidget = new EventEmitter<Partial<IWidgetInfo>>();
    onEditedWidgetChanged = new EventEmitter<IEditedWidgetChangedEvent>();
    onSave = new EventEmitter<IEditedWidgetChangedEvent>();
    onUnsavedChanged = new BehaviorSubject<boolean>(false);
    onDeleteWidget = new EventEmitter<Partial<IWidgetInfo>>();

    constructor(private dbs: DashboardService,
                private ms: ModalService,
                private sbs: SidebarService,
                private bs: BroadcastService,
                private es: ErrorService,
                private ds: DataService) {
    }

    resetSavedState() {
        this.onUnsavedChanged.next(false);
    }

    unsaved() {
        this.onUnsavedChanged.next(true);
    }

    getWidgetsList(excludeWidgetNames: string[] = [], includeEmpty = true): IWidgetListItem[] {
        const list = this.dbs.getWidgetsWithoutEmpty(excludeWidgetNames).map(w => {
            return {
                name: w.name,
                label: w.name + (w.title ? ` (${w.title})` : '')
            };
        });
        return includeEmpty ? [{ label: '', name: ''}, ...list] : list;
    }

    updateEditedWidget(event: IEditedWidgetChangedEvent) {
        this.unsaved();
        if (event.reCreate) {
            event.widget.edKey = 'ed' + new Date().getTime();
        }
        this.onEditedWidgetChanged.emit(event);
    }

    cancelEditing() {
        this.onCancelEditing.emit();
        this.resetSavedState();
    }

    save(widget: Partial<IWidgetInfo>) {
        if (!this.validate(widget)) {
            return;
        };
        this.dbs.generateDisplayInfo(widget);
        if (!widget.dashboard) {
            console.error('no dashboard specified in widget:', widget);
            return;
        }
        this.ds.saveWidget(widget.dashboard, widget, widget?.oldWidget?.name)
            .then(d => {
                this.dbs.saveWidgetPositionAndSize(widget as IWidgetInfo);
                this.onSave.emit();
                this.sbs.showComponent(null);
                this.resetSavedState();
                this.bs.broadcast('refresh-dashboard');
            })
            .catch(e => {
                // this.ms.show(e.message);
            });
    }

    async generateWidgetMdx(w: Partial<IWidgetInfo>) {
        w.mdx = '';
        w.kpiclass = '';
        w.kpitype = '';

        if (!w.dataSource) {
            return;
        }

       // try {
            const parts = w.dataSource.split('.');
            const ext = parts.pop()?.toLowerCase();
            if (ext === 'kpi') {
                w.kpiclass = parts.join('.');
                w.kpitype = 'sql';
            } else {
                const ds: any = await this.ds.getPivotData(w.dataSource);
                if (ds) {
                    w.mdx = ds.mdx || '';
                }
            }
       /* } catch (e) {
            this.ms.show(`Data source "${w.dataSource}" not found.`);
            console.error(e);
        }*/
    }

    private askForWidgetDeletion(widget: IWidgetInfo, okCallback: () => void) {
        this.ms.show({
            message: `Do you really want do delete widget "${widget.name}"?`,
            buttons: [
                {
                    label: 'No',
                    autoClose: true
                },
                {
                    label: 'Yes',
                    default: true,
                    autoClose: true,
                    click: okCallback
                }
            ]
        });
    }

    deleteWidget(widget: IWidgetInfo) {
        const del = () => {
            this.onDeleteWidget.emit(widget);
            this.sbs.showComponent(null);
        };

        this.askForWidgetDeletion(widget, () => {
            if (widget.oldWidget) {
                this.ds.deleteWidget(widget.dashboard, widget.oldWidget.name)
                    .then(() => {
                        del();
                    });
            } else {
                del();
            }
        });
    }

    private validate(widget: Partial<IWidgetInfo>) {
        if (!widget.name) {
            this.es.show('Please enter widget name', true);
            this.sbs.showComponent({component: WidgetEditorComponent, single: true, inputs: {
                    invalid: ['name']
                }});
            return;
        }
        if (!widget.dataSource && !widget.dataLink) {
            this.es.show('Please choose "Data source" or "Reference to"', true);
            this.navigateDataSourceAndType(widget, ['datasource']);
            return;
        }

        return true;
    }

    navigateDataSourceAndType(widget: Partial<IWidgetInfo>, invalidControls: string[] = []) {
        this.sbs.showComponent({
            component: TypeAndDatasourceComponent,
            single: true,
            inputs: {
                model: widget,
                invalid: invalidControls
            }
        });
    }
}
