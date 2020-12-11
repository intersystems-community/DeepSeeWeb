import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    // Triggers dashboard editing mode on/off
    public onEditDashboard = new EventEmitter<boolean>();
    onSetTitle = new EventEmitter<string>();

    constructor() {
    }
}
