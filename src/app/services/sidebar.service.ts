import {ComponentRef, EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

// Sidebar toggle information
export interface ISidebarInfo {
    component: any;
    inputs?: any;
    outputs?: any;
    // Only single instance allowed in sidebar
    single?: boolean;
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
    sidebarToggle = new BehaviorSubject<ISidebarInfo|null>(null);

    // Triggers before sidebar animation starts
    onAnimStart = new EventEmitter();
    // Triggers after sidebar animation ends
    onAnimEnd = new EventEmitter();


    constructor() {
    }

    /**
     * Updates dynamic component properties
     */
    updateComponentProperties(component: ComponentRef<any>, info: ISidebarInfo) {
        if (info.inputs) {
            for (const prop in info.inputs) {
                component.instance[prop] = info.inputs[prop];
            }
        }
    }

    showComponent(info?: ISidebarInfo|null) {
        if (!info) {
            this.resetComponentStack();
        }
        // check for single instance
        if (info?.single) {
            const exists = this.stack.find(el => el.component === info?.component);
            if (exists) {
                if (exists.compRef) {
                    this.updateComponentProperties(exists.compRef, info);
                }
                if (exists?.compRef?.instance.cd) {
                    exists.compRef.instance.cd.markForCheck();
                    exists.compRef.instance.cd.detectChanges();
                }
                return;
            }
        }
        // Push to state info with component
        if (info?.component) {
            this.stack.push(info);
        }
        if (info) {
            this.sidebarToggle.next(info);
        }
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
