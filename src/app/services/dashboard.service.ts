import {Injectable} from '@angular/core';
import {IWidgetInfo} from '../components/widgets/base-widget.class';
import {dsw} from "../../environments/dsw";
import {BehaviorSubject} from "rxjs";
import {StorageService} from "./storage.service";

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private widgets: IWidgetInfo[] = [];
    private allWidgets: IWidgetInfo[] = [];

    current = new BehaviorSubject<string>('');

    constructor(private ss: StorageService) {
    }

    setWidgets(widgets: IWidgetInfo[]) {
        this.widgets = widgets;
    }

    getWidgets(): IWidgetInfo[] {
        return this.widgets;
    }

    getWidgetsWithoutEmpty(excludeNames: string[] = []): IWidgetInfo[] {
        return this.widgets.filter(w => (w.type !== dsw.const.emptyWidgetClass && !excludeNames.includes(w.name)));
    }

    setAllWidgets(widgets: IWidgetInfo[]) {
        this.allWidgets = widgets;
    }

    getAllWidgets(): IWidgetInfo[] {
        return this.allWidgets;
    }

    saveWidgetPositionAndSize(widget: IWidgetInfo) {
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

}
