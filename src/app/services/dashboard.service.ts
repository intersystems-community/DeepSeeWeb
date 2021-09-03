import {Injectable} from '@angular/core';
import {IWidgetInfo} from '../components/widgets/base-widget.class';

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

    setAllWidgets(widgets: IWidgetInfo[]) {
        this.allWidgets = widgets;
    }

    getAllWidgets(): IWidgetInfo[] {
        return this.allWidgets;
    }
}
