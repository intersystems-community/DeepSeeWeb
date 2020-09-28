import {Injectable} from '@angular/core';
import {IWidgetInfo} from '../components/widgets/base-widget.class';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private widgets: IWidgetInfo[] = [];

    constructor() {
    }

    setWidgets(widgets: IWidgetInfo[]) {
        this.widgets = widgets;
    }

    getWidgets(): IWidgetInfo[] {
        return this.widgets;
    }
}
