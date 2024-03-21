import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
    selector: '[dswFocusNext]',
    standalone: true
})
export class FocusNextDirective {

    constructor(private el: ElementRef) {
    }

    @HostListener('keydown.enter',  ['$event'])
    onReturnPressed(e: KeyboardEvent) {
        e.preventDefault();
        const focusEl = document.getElementById(this.el.nativeElement.attributes.dswFocusNext.value);
        if (focusEl) {
            focusEl.focus();
        }
    }

}
