import {Injectable} from '@angular/core';
import {IWidgetInfo} from '../components/widgets/base-widget.class';
import {dsw} from "../../environments/dsw";

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private widgets: IWidgetInfo[] = [];
    private allWidgets: IWidgetInfo[] = [];

    constructor() {
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
}
