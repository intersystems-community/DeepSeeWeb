import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from "@angular/core";
import AirDatepicker from 'air-datepicker';

export interface IDatepickerSelectEvent {
    date: Date | Date[];
    formattedDate: string | string[];
    datepicker: AirDatepicker;
}

@Component({
    selector: 'dsw-date-picker',
    templateUrl: './date-picker.component.html',
    styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit, AfterViewInit {
    @Input() inline = false;
    @Input() range = false;
    @Output() select = new EventEmitter<IDatepickerSelectEvent>();
    dp: AirDatepicker;
    private ignoreSelectEvent = false;

    constructor(private el: ElementRef) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.dp = new AirDatepicker(this.el.nativeElement, {
            inline: this.inline,
            range: this.range,
            toggleSelected: false,
            onSelect: ((date, formattedDate, datepicker) => {
                if (this.ignoreSelectEvent) {
                    return;
                }
                this.select.emit({date, formattedDate, datepicker});
            }) as any
        });
    }

    /*ngOnChanges(changes: SimpleChanges) {
        if (!this.dp) {
            return;
        }
        if (changes.range && (changes.range.currentValue !== changes.range.previousValue)) {
            this.dp.update({range: changes.range.currentValue});
        }
    }*/

    setDateRange(from: Date, to?: Date) {
        this.ignoreSelectEvent = true;
        this.dp.clear();

        this.dp.update({range: !!to});
        this.dp.selectDate(from, {silent: true});
        if (to) {
            this.dp.selectDate(to, {silent: true});
        }
        setTimeout(() => {
            this.ignoreSelectEvent = false;
        });
    }
}
