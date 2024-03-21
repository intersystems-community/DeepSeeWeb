import {AfterViewInit, Component, ElementRef, HostBinding, HostListener, Input, OnInit, Renderer2} from '@angular/core';
import {ErrorService, IError} from '../../../services/error.service';
import {animate, style, transition, trigger} from '@angular/animations';

export const ERROR_TOGGLE_ANIMATION = trigger(
    'toggleError', [
        transition(':enter', [
            style({transform: 'translateX(100%)'}),
            animate('100ms', style({transform: 'translateX(0)'}))
        ]),
        transition(':leave', [
            style({transform: 'translateX(0)'}),
            animate('100ms', style({transform: 'translateX(100%)'}))
        ])
    ],
);

export const ERROR_TOGGLE_LEFT_ANIMATION = trigger(
    'toggleErrorLeft', [
        transition(':enter', [
            style({transform: 'translateX(-100%)'}),
            animate('100ms', style({transform: 'translateX(0)'}))
        ]),
        transition(':leave', [
            style({transform: 'translateX(0)'}),
            animate('100ms', style({transform: 'translateX(-100%)'}))
        ])
    ],
);


@Component({
    selector: 'dsw-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit, AfterViewInit {

    @Input() error!: IError;
    private height = 32;

    constructor(private es: ErrorService,
                private el: ElementRef) {
    }

    @HostBinding('class.left')
    get isLeft() {
        return this.error.isLeft;
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        // this.height = this.el.nativeElement.getBoundingClientRect().height;
    }

    @HostListener('click', ['$event'])
    onClick(e: MouseEvent) {
        this.es.close(this.error);
    }

    @HostBinding('style.bottom.px')
    get getOffset(): number {
        const idx = this.es.getIndex(this.error);
        return 8 + idx * (this.height + 8);
    }
}
