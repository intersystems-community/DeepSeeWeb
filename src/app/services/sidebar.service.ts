import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

// Sidebar toggle information
export interface ISidebarInfo {
    component: any;
    inputs?: any;
    // TODO: implement dynamic width
    width?: number;
}

@Injectable({
    providedIn: 'root'
})
export class SidebarService {

    // Toggle sidebar, set "component" to class to create dynamic component. Set null to hide sidebar
    public sidebarToggle = new BehaviorSubject<ISidebarInfo>(null);
    // Triggers before sidebar animation starts
    public onAnimStart = new EventEmitter();
    // Triggers after sidebar animation ends
    public onAnimEnd = new EventEmitter();

    constructor() {
    }
}
