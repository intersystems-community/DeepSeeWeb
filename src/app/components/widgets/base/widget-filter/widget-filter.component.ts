import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  input,
  output, signal,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import {FilterPopupComponent} from '../../../ui/filter-popup/filter-popup.component';
import {FilterService} from '../../../../services/filter.service';
import {ModalService} from '../../../../services/modal.service';
import {UtilService} from '../../../../services/util.service';
import {BroadcastService} from '../../../../services/broadcast.service';
import {FormsModule} from '@angular/forms';
import {IWidgetControl, IWidgetDesc} from "../../../../services/dsw.types";


@Component({
  selector: 'dsw-widget-filter',
  templateUrl: './widget-filter.component.html',
  styleUrls: ['./widget-filter.component.scss'],
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.horizontal]': `widget().type === 'horizontalControls'`,
    //'[class]': `'col-' + (widget().viewSize + 1)`,
    '[class.col-1]': 'widget().viewSize === 0',
    '[class.col-2]': 'widget().viewSize === 1',
    '[class.col-3]': 'widget().viewSize === 2',
    '[class.col-4]': 'widget().viewSize === 3',
    '[class.col-5]': 'widget().viewSize === 4',
    '[class.col-6]': 'widget().viewSize === 5'
  }
})
export class WidgetFilterComponent {
  widget = input.required<IWidgetDesc>();
  filters = input<any[]>([]);
  onVariable = output<any>();
  onDataSource = output<any>();
  onAction = output<IWidgetControl>();
  onFilter = output<number>();
  protected openedFilter = signal(-1);
  private filterPopup = viewChild<ViewContainerRef>('filterPopup');

  constructor(private fs: FilterService,
              private ms: ModalService,
              private el: ElementRef,
              private us: UtilService,
              private bs: BroadcastService,
              private cd: ChangeDetectorRef
  ) {
  }

  emitVarChange(v: any) {
    this.onVariable.emit(v);
  }

  onDataSourceChangeHandler(chooser: any) {
    this.onDataSource.emit(chooser);
  }

  performAction(action: IWidgetControl) {
    this.onAction.emit(action);
  }

  /**
   * Shows filter window on widget, when user pressed filter button or filter input
   */
  toggleFilter(idx: number, e: MouseEvent) {
    const flt = this.fs.getFilter(idx);
    if (!flt) {
      return;
    }

    this.openedFilter.set(idx);
    const target = e.target as HTMLElement;
    const b = target.getBoundingClientRect();
    let x = b.x - 4; // 4 is padding
    const y = b.y + b.height + 4;
    const width = flt.isDate ? 420 : 340;
    if (x + width > window.innerWidth) {
      x = b.x + b.width - width;
    }
    const isMobile = this.us.isMobile();
    let height = 0;
    if (isMobile) {
      const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10);
      height = window.document.body.offsetHeight - headerHeight - this.el.nativeElement.offsetHeight;
    }
    void this.ms.show({
      component: import('./../../../ui/filter-popup/filter-popup.component'),
      hideBackdrop: true,
      closeByEsc: true,
      closeByBackdropClick: true,
      buttons: [],
      noPadding: true,
      componentStyles: {
        position: 'absolute',
        left: x + 'px',
        top: y + 'px',
        height: isMobile ? `${height}px` : 'auto'
      },
      onComponentInit: (c: FilterPopupComponent) => {
        c.initialize(this.widget(), flt, this.widget().dataSource);
      },
      onClose: () => {
        this.openedFilter.set(-1);
        this.cd.detectChanges();
      }
    });
  }

  setControlValue(ctrl: any, value: string, input: HTMLInputElement) {
    const v = parseInt(value, 10);
    if (isNaN(v) || v === 0) {
      delete ctrl._value;
      input.value = '';
    } else {
      ctrl._value = value;
    }
    this.bs.broadcast('refresh:' + this.widget().name);
  }

  detectChanges() {
    this.cd.detectChanges();
  }
}
