import {
    Component,
    ComponentFactoryResolver,
    ComponentRef, ElementRef,
    HostBinding,
    HostListener,
    Input, OnDestroy,
    OnInit, Renderer2,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {IModal, IModalButton, ModalService} from '../../../services/modal.service';

@Component({
    selector: 'dsw-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {
    @ViewChild('dynamicComponent', {read: ViewContainerRef, static: true})
    dynComponent: ViewContainerRef;

    @Input() data: IModal;


    compRef: ComponentRef<any>;
    component: any;

    @HostBinding('class.no-backdrop') get noBackdrop(): boolean {
        return this.data.hideBackdrop;
    }

    constructor(private ms: ModalService,
                private el: ElementRef,
                private r2: Renderer2,
                private cfr: ComponentFactoryResolver) {
    }

    ngOnInit() {
        if (this.data.component) {
            const factory = this.cfr.resolveComponentFactory(this.data.component);
            this.compRef = this.dynComponent.createComponent(factory);
            this.component = this.compRef.instance;
            this.component.$modal = this;
            this.r2.setAttribute(this.compRef.location.nativeElement, 'dynamic-component', '');
            const styles = this.data.componentStyles;
            if (styles) {
                for (let key in styles) {
                    this.r2.setStyle(this.compRef.location.nativeElement, key, styles[key]);
                }
            }

            if (this.data.onComponentInit) {
                this.data.onComponentInit(this.component);
            }
        }
    }

    ngOnDestroy(){
        if (this.compRef) {
            this.compRef.destroy();
        }
    }

    getPath(e: MouseEvent): HTMLElement[] {
        const path = [];
        let currentElem = e.target;
        while (currentElem) {
            path.push(currentElem);
            currentElem = (currentElem as HTMLElement).parentElement;
        }
        if (path.indexOf(window) === -1 && path.indexOf(document) === -1)
            path.push(document);
        if (path.indexOf(window) === -1)
            path.push(window);
        return path;

    }

    @HostListener('click', ['$event'])
    onClick(e: MouseEvent) {
        if (!this.data.closeByBackdropClick) { return; }
        const clickedOnComponent = this.getPath(e).some(e => e.attributes && e.attributes['dynamic-component']);
        if (!clickedOnComponent) {
            this.close();
            e.preventDefault();
        }
    }


    @HostListener('document:keydown', ['$event'])
    onGlobalKeyPressed(e: KeyboardEvent) {
        // Use hotkeys only for topmost modal
        if (!this.isTopmost()) {
            return;
        }
        switch (e.code.toLowerCase()) {
            case 'enter': case 'numpadenter':
                this.processEnterKey();
                break;
            case 'escape':
                this.processEscapeKey();
                break;
        }
    }

    /**
     * Closes modal
     */
    close() {
        this.ms.close(this.data);
    }

    /**
     * On modal button click
     */
    onButtonClick(btn: IModalButton) {
        if (btn.click) {
            btn.click(this, this.data, btn);
        }
        if (btn.autoClose) {
            this.close();
        }
    }

    /**
     * Processing pressing of enter key
     */
    private processEnterKey() {
        if (!this.data.buttons?.length) {
            return;
        }
        const btn = this.data.buttons.find(b => b.default);
        if (!btn) {
            return;
        }
        if (btn.click) {
            btn.click(this, this.data, btn);
        }
        if (btn.autoClose) {
            this.close();
        }
    }

    private processEscapeKey() {
        if (this.data.closeByEsc) {
            this.close();
        }
    }

    /**
     * Checks if modal is topmost
     */
    private isTopmost(): boolean {
        const modals = this.ms.modals.getValue();
        return modals[modals.length - 1] === this.data;
    }
}
