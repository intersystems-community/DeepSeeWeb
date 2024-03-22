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
  compRef?: any;
  // TODO: implement dynamic width
  width?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // Toggle sidebar, set "component" to class to create dynamic component. Set null to hide sidebar
  sidebarToggle = new BehaviorSubject<ISidebarInfo|undefined>(undefined);
  // Triggers before sidebar animation starts
  onAnimStart = new EventEmitter();
  // Triggers after sidebar animation ends
  onAnimEnd = new EventEmitter();
  private stack: ISidebarInfo[] = [];

  constructor() {
  }

  hide() {
    this.resetComponentStack();
    this.sidebarToggle.next(undefined);
  }

  async showComponent(info?: ISidebarInfo | null) {
    if (!info) {
      this.hide()
      return;
    }

    // Check if lazy loading
    if (info.component && info.component.then) {
      await info.component;
      const module = await info.component;
      info.component = module[Object.keys(module)[0]];
    }

    // check for single instance
    if (info?.single) {
      const exists = this.stack.find(el => el.component === info?.component);
      if (exists) {
        this.sidebarToggle.next(info);
        /*if (exists?.compRef?.instance.cd) {
          exists.compRef.instance.cd.markForCheck();
          exists.compRef.instance.cd.detectChanges();
        }*/
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

  popComponent() {
    this.stack.pop();
    const comp = this.stack.pop() || null;
    this.showComponent(comp);
  }

  private resetComponentStack() {
    this.stack = [];
  }
}
