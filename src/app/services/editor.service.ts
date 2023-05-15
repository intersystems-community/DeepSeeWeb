import {EventEmitter, Injectable} from '@angular/core';
import {DashboardService} from "./dashboard.service";
import {IWidgetInfo} from "../components/widgets/base-widget.class";

export interface IWidgetListItem {
    label: string;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class EditorService {
    onNewWidget = new EventEmitter<Partial<IWidgetInfo>>();
    onWidgetDataChanged = new EventEmitter<Partial<IWidgetInfo>>();

    constructor(private dbs: DashboardService) {
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
}
