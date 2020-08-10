import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ModalComponent} from '../components/ui/modal/modal.component';

const DEFAULT_BUTTONS = [{label: 'OK', default: true, autoClose: true}];

export interface IModalButton {
    label: string;
    click?: (modal?: ModalComponent, info?: IModal, button?: IModalButton) => void;
    autoClose?: boolean;
    default?: boolean;
}

export interface IModal {
    title?: string;
    message?: string;
    closeByEsc?: boolean;
    closeByBackdropClick?: boolean;
    noPadding?: boolean;
    buttons?: IModalButton[];
    component?: any;
    hideBackdrop?: boolean;
    componentStyles?: {[key: string]:string};
    onComponentInit?: (comp: any) => void;
    onClose?: () => void;
}

@Injectable({
    providedIn: 'root'
})
export class ModalService {

    modals = new BehaviorSubject<IModal[]>([]);

    constructor() {
    }

    /**
     * Shows modal
     */
    show(modal: IModal|string) {
        // If show called with simple string mage modal with simple message
        if (typeof modal === 'string') {
            modal = {message: modal};
        }

        if (!modal.buttons) {
            modal.buttons = DEFAULT_BUTTONS;
        }

        const cur = this.modals.getValue();
        cur.push(modal);
        this.modals.next(cur);
    }

    /**
     * Closes modal
     */
    close(modal: IModal) {
        const cur = this.modals.getValue();
        const idx = cur.indexOf(modal);
        if (idx === -1) {
            return;
        }

        cur.splice(idx, 1);
        this.modals.next(cur);
        if (modal.onClose) {
            modal.onClose();
        }
    }
}
