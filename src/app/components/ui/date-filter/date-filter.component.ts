import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from "@angular/core";
import {DatePickerComponent, IDatepickerSelectEvent} from "../date-picker/date-picker.component";

interface IFilterOption {
    label: string;
    dateFrom?: Date;
    dateTo?: Date;
    init?: () => void;
}

@Component({
    selector: 'dsw-date-filter',
    templateUrl: './date-filter.component.html',
    styleUrls: ['./date-filter.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateFilterComponent  {
    @ViewChild('datePicker') datePicker: DatePickerComponent;

    filters: IFilterOption[] = [
        {
            label: 'Today',
            init: function init() {
                const today = new Date();
                this.dateFrom = today;
            }
        },
        {
            label: 'This week',
            init: function init() {
                const today = new Date();
                const first = today.getDate() - today.getDay() + 1;
                const last = first + 6;

                this.dateFrom = new Date(today.setDate(first));
                this.dateTo = new Date(today.setDate(last));
            }
        },
        {
            label: 'Last 30 days',
            init: function init() {
                const today = new Date();
                const from = new Date().setDate(today.getDate() - 30);
                this.dateFrom = new Date(from);
                this.dateTo = today;
            }
        },
        {
            label: 'Last 3 months',
            init: function init() {
                const today = new Date();
                const from = new Date().setMonth(today.getMonth() - 3);
                this.dateFrom = new Date(from);
                this.dateTo = today;
            }
        },
        {
            label: 'Last 6 months',
            init: function init() {
                const today = new Date();
                const from = new Date().setMonth(today.getMonth() - 6);
                this.dateFrom = new Date(from);
                this.dateTo = today;
            }
        },
        {
            label: 'Last year',
            init: function init() {
                const lastYear = new Date(new Date().getFullYear() - 1, 0, 1);
                this.dateFrom = new Date(lastYear.getFullYear(), 0, 1);
                this.dateTo = new Date(lastYear.getFullYear(), 11, 31);
            }
        },
        {
            label: 'This year (Jan - Today)',
            init: function init() {
                const today = new Date();
                this.dateFrom = new Date(today.getFullYear(), 0, 1);
                this.dateTo = today;
            }
        },
        {
            label: 'Custom',
            init: function init() {
                this.dateFrom = new Date();
                this.dateTo = new Date();
            }
        }
    ];
    curFilter = this.filters.length - 1;

    constructor(private cd: ChangeDetectorRef) {
      this.initialize();
    }

    initialize() {
        this.filters.forEach(f => {
            if (f.init) {
                f.init();
            }
        });
    }

    setFilter(f: IFilterOption, idx: number) {
        this.curFilter = idx;
        if (this.datePicker) {
            this.datePicker.setDateRange(f.dateFrom, f.dateTo);
        }
    }

    onSelect(e: IDatepickerSelectEvent) {
        this.curFilter = this.filters.length - 1;
        this.datePicker.dp.update({range: true});
    }

    getValues() {
        const dates = this.datePicker.dp.selectedDates;
        if (dates.length > 1) {
            if (dates[0].toDateString() === dates[1].toDateString()) {
                dates.pop();
            }
        }
        return dates;
    }

    setDateRange(from: Date, to?: Date) {
        this.datePicker.setDateRange(from, to);
        const idx = this.filters.findIndex(f => {
            if (to) {
                return f.dateFrom.toDateString() === from.toDateString() && f.dateTo.toDateString() === to.toDateString();
            } else {
                return f.dateFrom.toDateString() === from.toDateString();
            }
        });
        if (idx !== -1) {
            this.curFilter = idx;
        }
        this.cd.detectChanges();
    }
}
