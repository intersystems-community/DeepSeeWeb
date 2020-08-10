import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class HeaderService {
    visible$ = new BehaviorSubject(false);
    onSearch = new BehaviorSubject<string>('');
    onSearchReset = new EventEmitter();

    // onSetTitle = new BehaviorSubject<string>('');

    constructor() {

    }

    resetSearch() {
        this.onSearchReset.emit();
    }
}
