import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class VariablesService {

    items: any[] = [];
    widgets: any[] = [];

    constructor() {
    }

    /**
     * Initialize service
     */
    init(result) {
        this.items = [];
        this.widgets = [];
        if (!result.widgets) {
            return;
        }
        for (let i = 0; i < result.widgets.length; i++) {
            const w: any = result.widgets[i];
            this.widgets.push(w);
            for (let j = 0; j < w.controls.length; j++) {
                if (w.controls[j].action.toLowerCase() === 'applyvariable') {
                    this.items.push(w.controls[j]);
                }
            }
        }
    }

    /**
     * Clear all variables
     */
    clear() {
        this.items = [];
    }

    isExists(): boolean {
        return this.items.length !== 0;
    }
}

