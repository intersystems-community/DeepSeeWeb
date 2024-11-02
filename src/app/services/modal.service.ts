import {Injectable, signal} from '@angular/core';
import {ModalComponent} from '../components/ui/modal/modal.component';

const DEFAULT_BUTTONS = [{label: 'OK', default: true, autoClose: true}];

type ModalButtonClickCallback = (modal?: ModalComponent, info?: IModal, button?: IModalButton) => void;

export interface IModalButton {
  label: string;
  click?: ModalButtonClickCallback;
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
  inputs?: any;
  search?: string;
  hideBackdrop?: boolean;
  class?: string;
  componentStyles?: { [key: string]: string };
  onComponentInit?: (comp: any) => void;
  onClose?: () => void;
  outputs?: { [key: string]: (...args) => void };
  minHeight?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  #modals = signal<IModal[]>([]);
  modals = this.#modals.asReadonly();

  constructor() {
  }

  /**
   * Shows modal
   */
  async show(modal: IModal | string, okCallback?: ModalButtonClickCallback) {
    // If show called with simple string mage modal with simple message
    if (typeof modal === 'string') {
      modal = {message: modal};
    }

    if (!modal.buttons) {
      modal.buttons = JSON.parse(JSON.stringify(DEFAULT_BUTTONS));

      if (okCallback && modal.buttons) {
        modal.buttons[0].click = okCallback;
      }
    }

    if (!modal.inputs) {
      modal.inputs = {};
    }

    // Check if lazy loading
    if (modal.component && modal.component.then) {
      await modal.component;
      const module = await modal.component;
      modal.component = module[Object.keys(module)[0]];
    }

    this.#modals.update(m => [...m, modal]);
  }

  /**
   * Closes modal
   */
  close(modal: IModal) {
    const cur = this.#modals();
    const idx = cur.indexOf(modal);
    if (idx === -1) {
      return;
    }

    this.#modals.update(m => {
      m.splice(idx, 1);
      return [...m];
    });

    if (modal.onClose) {
      modal.onClose();
    }
  }
}
