import {ChangeDetectionStrategy, Component, HostBinding, Input} from '@angular/core';
import {IMeterWidgetData, WMeterComponent} from '../base/meter-widget.class';
import IsNull from "ol/format/filter/IsNull";
import {IWidgetDesc} from "../../../services/dsw.types";


interface ILightbarData extends IMeterWidgetData {
    progress: number;
}

@Component({
    selector: 'dsw-light-bar',
    templateUrl: './light-bar.component.html',
    styleUrls: ['./light-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: []
})
export class WLightBarComponent extends WMeterComponent {
    @Input() widget: IWidgetDesc = {} as IWidgetDesc;
    data: ILightbarData[] = [];
    dots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    @HostBinding('style.grid-template-columns')
    get gridColumns() {
        return 'repeat(' + (this.data?.length >= 5 ? 2 : 1).toString() + ', 1fr)';
    }

    prepareMeterData(result: any) {
        super.prepareMeterData(result);
        this.data.forEach(d => {
            d.progress = (d.value - d.min) / (d.max - d.min) * 10;
            if (isNaN(d.progress)) {
                d.progress = 0;
            }
        });
        console.log(this.data);
    }
}
