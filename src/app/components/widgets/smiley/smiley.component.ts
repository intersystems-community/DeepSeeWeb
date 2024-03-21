import {ChangeDetectionStrategy, Component, HostBinding, Input} from '@angular/core';
import {IWidgetInfo} from '../base-widget.class';
import {WMeterComponent} from '../base/meter-widget.class';
import { NgFor } from '@angular/common';


@Component({
    selector: 'dsw-wsmiley',
    templateUrl: './smiley.component.html',
    styleUrls: ['./smiley.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgFor]
})
export class WSmileyComponent extends WMeterComponent {
    @Input() widget: IWidgetInfo = {} as IWidgetInfo;;

    @HostBinding('style.grid-template-columns')
    get gridColumns() {
        return 'repeat(' + (this.data?.length >= 3 ? 3 : (this.data?.length || 0)).toString() + ', 1fr)';
    }
}
