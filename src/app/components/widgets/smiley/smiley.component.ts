import {ChangeDetectionStrategy, Component, HostBinding, Input} from '@angular/core';
import {WMeterComponent} from '../base/meter-widget.class';
import {IWidgetDesc} from "../../../services/dsw.types";


@Component({
  selector: 'dsw-wsmiley',
  templateUrl: './smiley.component.html',
  styleUrls: ['./smiley.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: []
})
export class WSmileyComponent extends WMeterComponent {
  @Input() widget: IWidgetDesc = {} as IWidgetDesc;
;

  @HostBinding('style.grid-template-columns')
  get gridColumns() {
    return 'repeat(' + (this.data?.length >= 3 ? 3 : (this.data?.length || 0)).toString() + ', 1fr)';
  }
}
