import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SidebarService} from "../../../services/sidebar.service";

@Component({
    selector: 'dsw-sidebar-actions',
    templateUrl: './sidebar-actions.component.html',
    styleUrls: ['./sidebar-actions.component.scss']
})
export class SidebarActionsComponent implements OnInit {
    @Input() isBack = false;
    @Output() cancel = new EventEmitter();
    @Output() apply = new EventEmitter();

    constructor(private sbs: SidebarService) {
    }

    ngOnInit(): void {
    }

    onCloseClick() {
        if (this.isBack) {
            this.sbs.popComponent();
        }
        this.cancel.emit();
    }
}
