import {Injectable} from '@angular/core';
import {dsw} from "../../environments/dsw";
import {BehaviorSubject} from "rxjs";
import {StorageService} from "./storage.service";
import {IWidgetDisplayInfo, IWidgetDesc} from "./dsw.types";

export interface IDashboardDisplayInfo {
    gridCols: number;
    gridMode: number;
    gridRows: number;
    snapToGrid: number;
}

export interface IDashboard {
    displayInfo: IDashboardDisplayInfo;
    filters: any[];
    info: any;
    widgets: IWidgetDesc[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private widgets: IWidgetDesc[] = [];
    private allWidgets: IWidgetDesc[] = [];

    current = new BehaviorSubject<string>('');
    dashboard = new BehaviorSubject<IDashboard|null>(null);

    constructor(private ss: StorageService) {
    }

    setWidgets(widgets: IWidgetDesc[]) {
        this.widgets = widgets;
    }

    getWidgets(): IWidgetDesc[] {
        return this.widgets;
    }

    getWidgetsWithoutEmpty(excludeNames: string[] = []): IWidgetDesc[] {
        return this.widgets.filter(w => (w.type !== dsw.const.emptyWidgetClass && !excludeNames.includes(w.name)));
    }

    setAllWidgets(widgets: IWidgetDesc[]) {
        this.allWidgets = widgets;
    }

    getAllWidgets(): IWidgetDesc[] {
        return this.allWidgets;
    }

    saveWidgetPositionAndSize(widget: IWidgetDesc) {
        const widgets = this.ss.getWidgetsSettings(widget.dashboard);
        const k = widget.name;
        if (!widgets[k]) {
            widgets[k] = {};
        }

        if (!isNaN(widget.x)) {
            widgets[k].col = widget.x;
        }
        if (!isNaN(widget.y)) {
            widgets[k].row = widget.y;
        }
        if (!isNaN(widget.cols)) {
            widgets[k].sizeX = widget.cols;
        }
        if (!isNaN(widget.rows)) {
            widgets[k].sizeY = widget.rows;
        }

        this.ss.setWidgetsSettings(widgets, widget.dashboard);
    }

    generateDisplayInfo(widget: Partial<IWidgetDesc>) {
        // Only generate if not exist
        if (widget.displayInfo) {
            return;
        }
        let tc = 1;
        let tr = 1;
        const dash = this.dashboard.value;
        if (dash) {
            tc = Math.floor(12 / dash.displayInfo.gridCols);
            if (tc < 1) {
                tc = 1;
            }
            if (tr < 1) {
                tr = 1;
            }
        }

        const info: IWidgetDisplayInfo = {
            topCol: Math.floor((widget.x || 0) / tc),
            leftRow: Math.floor((widget.y || 0) / tr),
            colWidth:  Math.floor((widget.cols || 1) / tc),
            rowHeight:  Math.floor(widget.rows || 1),
        };

        widget.displayInfo = info;
    }
}
