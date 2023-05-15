import {Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {Subscription} from "rxjs";

@Component({
  selector: 'dsw-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchInputComponent),
            multi: true
        }
    ]
})
export class SearchInputComponent implements ControlValueAccessor {
    @Input() model: string;
    @Output() search = new EventEmitter<string>();
    formControl = new FormControl();
    isSearchActive = false;
    private subOnSearch: Subscription;

    constructor() {
        this.subOnSearch = this.formControl.valueChanges
            .pipe(debounceTime(200), distinctUntilChanged())
            .subscribe(term => {
                this.search.emit(this.formControl.value);
            });
    }

    onChange = (_) => { };
    onTouched = () => { };

    writeValue(value: any): void {
        this.model = value;
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        return;
    }
}
