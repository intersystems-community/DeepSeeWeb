import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {fromEvent, Subscription} from "rxjs";

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
export class SearchInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @ViewChild('inp', {static: true}) inp: ElementRef;
    @Output() search = new EventEmitter<string>();
    value = '';
    private subOnSearch: Subscription;
    constructor() {
    }

    ngOnInit() {
        this.subOnSearch = fromEvent(this.inp.nativeElement, 'input')
            .pipe(debounceTime(200), distinctUntilChanged())
            .subscribe(() => {
                this.search.emit(this.value);
            });

    }

    onChange = (_) => { };
    onTouched = () => { };

    writeValue(value: any): void {
        this.value = value;
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

    onModelChange(txt: any) {
        this.writeValue(txt);
        this.onChange(txt);
    }

    emitValueChanged() {
        this.search.emit(this.value);
    }

    ngOnDestroy() {
        if (this.subOnSearch) {
            this.subOnSearch.unsubscribe();
        }
    }
}
