import {
    Component,
    ComponentFactoryResolver,
    EventEmitter, HostBinding,
    Input,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {IWidgetInfo} from '../../base-widget.class';
import {FilterPopupComponent} from '../../../ui/filter-popup/filter-popup.component';
import {FilterService} from '../../../../services/filter.service';
import {ModalService} from '../../../../services/modal.service';

@Component({
    selector: 'dsw-widget-filter',
    templateUrl: './widget-filter.component.html',
    styleUrls: ['./widget-filter.component.scss']
})
export class WidgetFilterComponent implements OnInit {
    @ViewChild('filterPopup', {read: ViewContainerRef, static: true})
    filterPopup: ViewContainerRef;

    @Input() widget: IWidgetInfo;
    @Input() filters: any[];

    @Output() onVariable = new EventEmitter<any>();
    @Output() onDataSource = new EventEmitter<any>();
    @Output() onAction = new EventEmitter<string>();
    @Output() onFilter = new EventEmitter<number>();


    @HostBinding('class.wrap') get hasViewSize(): boolean {
        if (!this.widget) {
            return false;
        }
        return !!this.widget.viewSize;
    }

    openedFilter = -1;

    constructor(private fs: FilterService,
                private r2: Renderer2,
                private ms: ModalService,
                private cfr: ComponentFactoryResolver
                ) {
    }

    ngOnInit(): void {
    }

    emitVarChange(v: any) {
        this.onVariable.emit(v);
    }

    onDataSourceChangeHandler(chooser: any) {
        this.onDataSource.emit(chooser);
    }

    performAction(action: string) {
        this.onAction.emit(action);
    }


    /**
     * Shows filter window on widget, when user pressed filter button or filter input
     * @param {number} idx Filter index
     * @param {object} e Event
     */
    toggleFilter(idx: number, e: MouseEvent) {
        const flt = this.fs.getFilter(idx);
        if (!flt) {
            return;
        }

        this.openedFilter = idx;
        const target = e.target as HTMLElement;
        const b = target.getBoundingClientRect();
        const x = b.x - 2; // 2 is padding
        const y = b.y + b.height;

        this.ms.show({
            component: FilterPopupComponent,
            hideBackdrop: true,
            closeByEsc: true,
            closeByBackdropClick: true,
            buttons: [],
            noPadding: true,
            componentStyles: {
                position: 'absolute',
                left: x + 'px',
                top: y + 'px'
            },
            onComponentInit: (c: FilterPopupComponent) => {
                c.initialize(this.widget, flt, this.widget.dataSource)
            },
            onClose: () => {
                this.openedFilter = -1;
            }
        });
    }
}
