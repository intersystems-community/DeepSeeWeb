import {EventEmitter, Injectable} from '@angular/core';

import {IWidgetInfo} from "./dsw.types";

export interface IButtonToggle {
    widget: IWidgetInfo;
    name: string;
    state: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class WidgetService {

    onToggleHeaderButton = new EventEmitter<IButtonToggle>();

    constructor() {
    }

    toggleButton(btn: IButtonToggle) {
        this.onToggleHeaderButton.emit(btn);
    }
}
