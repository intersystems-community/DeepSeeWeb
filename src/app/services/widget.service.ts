import {EventEmitter, Injectable} from '@angular/core';
import {IWidgetInfo} from '../components/widgets/base-widget.class';

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
