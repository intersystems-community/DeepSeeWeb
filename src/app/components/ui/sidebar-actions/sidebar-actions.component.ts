import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
    selector: 'dsw-sidebar-actions',
    templateUrl: './sidebar-actions.component.html',
    styleUrls: ['./sidebar-actions.component.scss']
})
export class SidebarActionsComponent implements OnInit {

    @Output() cancel = new EventEmitter();
    @Output() apply = new EventEmitter();

    constructor() {
    }

    ngOnInit(): void {
    }

}
