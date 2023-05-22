import {EventEmitter, Injectable} from '@angular/core';
import {DashboardService} from "./dashboard.service";
import {IWidgetInfo} from "../components/widgets/base-widget.class";
import {DataService} from "./data.service";
import {ModalService} from "./modal.service";
import {SidebarService} from "./sidebar.service";
import {BehaviorSubject} from "rxjs";
import {BroadcastService} from "./broadcast.service";

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

    constructor(private dbs: DashboardService,
                private ms: ModalService,
                private sbs: SidebarService,
                private bs: BroadcastService,
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
            const ext = parts.pop().toLowerCase();
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
}
