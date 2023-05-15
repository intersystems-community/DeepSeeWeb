import {ComponentRef, EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

// Sidebar toggle information
export interface ISidebarInfo {
    component: any;
    inputs?: any;
    outputs?: any;
    // If component already created. Used for stack to pop previous state of sidebar screens
    compRef?: ComponentRef<any>;
    // TODO: implement dynamic width
    width?: number;
}

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    private stack: ISidebarInfo[] = [];

    // Toggle sidebar, set "component" to class to create dynamic component. Set null to hide sidebar
    sidebarToggle = new BehaviorSubject<ISidebarInfo>(null);

    // Triggers before sidebar animation starts
    onAnimStart = new EventEmitter();
    // Triggers after sidebar animation ends
    onAnimEnd = new EventEmitter();


    constructor() {
    }

    showComponent(info: ISidebarInfo) {
        if (!info) {
            this.resetComponentStack();
        }
        // Push to state info with component
        if (info?.component) {
            this.stack.push(info);
        }
        this.sidebarToggle.next(info);
    }

    private resetComponentStack() {
        this.stack.forEach(s => {
            if (s.compRef) {
                s.compRef.destroy();
            }
        });
        this.stack = [];
    }

    popComponent() {
        this.stack.pop();
        const comp = this.stack.pop() || null;
        this.showComponent(comp);
    }
}
