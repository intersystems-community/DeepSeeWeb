import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

@Component({
    selector: 'dsw-text-area',
    templateUrl: './text-area.component.html',
    styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements AfterViewInit {
    @Input() value = '';
    @ViewChild('input') input: ElementRef;

    constructor() {
    }

    ngAfterViewInit(){
        setTimeout(()=> {
            this.input.nativeElement.focus();
            this.input.nativeElement.select();
        });
    }
}
