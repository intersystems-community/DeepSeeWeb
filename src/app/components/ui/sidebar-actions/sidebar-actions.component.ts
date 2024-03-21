import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input, OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {SidebarService} from "../../../services/sidebar.service";
import {EditorService} from "../../../services/editor.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'dsw-sidebar-actions',
    templateUrl: './sidebar-actions.component.html',
    styleUrls: ['./sidebar-actions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarActionsComponent implements OnInit, OnDestroy {
    @Input() isBack = false;
    @Input() isWidgetEditorWarning = false;
    @Output() cancel = new EventEmitter();
    @Output() apply = new EventEmitter();

    isWidgetEditorWarningVisible = false;
    private subOnUnsavedChanged?: Subscription;

    constructor(private sbs: SidebarService,
                private eds: EditorService,
                private cd: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.subOnUnsavedChanged = this.eds.onUnsavedChanged.subscribe(state => {
            this.isWidgetEditorWarningVisible = state;
            this.cd.detectChanges();
        });
    }

    onCloseClick() {
        if (this.isBack) {
            this.sbs.popComponent();
        }
        this.cancel.emit();
    }

    ngOnDestroy() {
        this.subOnUnsavedChanged?.unsubscribe();
    }
}
