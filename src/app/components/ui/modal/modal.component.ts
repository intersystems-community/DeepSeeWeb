import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {IModal, IModalButton, ModalService} from '../../../services/modal.service';
import {Subscription} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {SearchInputComponent} from '../search/search-input/search-input.component';
import {NgComponentOutlet} from '@angular/common';

@Component({
  selector: 'dsw-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  standalone: true,
  imports: [SearchInputComponent, FormsModule, NgComponentOutlet]
})
export class ModalComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @ViewChild(NgComponentOutlet, {read: ElementRef}) dynCompEl?: ElementRef;
  @ViewChild(NgComponentOutlet) ngComponentOutlet?: NgComponentOutlet;
  @Input() data!: IModal;
  search = new EventEmitter<string>();
  isInitialized = false;
  private subscriptions: Subscription[] = [];

  constructor(private ms: ModalService,
              private cd: ChangeDetectorRef,
              private el: ElementRef,
              private r2: Renderer2) {
  }

  @HostBinding('class.no-backdrop') get noBackdrop(): boolean {
    return !!this.data.hideBackdrop;
  }

  ngOnInit() {
    this.data.inputs._modal = this;
    this.isInitialized = true;
  }

  ngAfterViewInit() {
    this.initDynamicComponent();
    this.updateHostStyles();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getPath(e: MouseEvent): HTMLElement[] {
    const path: any[] = [];
    let currentElem = e.target;
    while (currentElem) {
      path.push(currentElem);
      currentElem = (currentElem as HTMLElement).parentElement;
    }
    if (path.indexOf(window) === -1 && path.indexOf(document) === -1) {
      path.push(document);
    }
    if (path.indexOf(window) === -1) {
      path.push(window);
    }
    return path;

  }

  @HostListener('mousedown', ['$event'])
  onClick(e: MouseEvent) {
    if (!this.data.closeByBackdropClick) {
      return;
    }
    const clickedOnComponent = this.getPath(e).some(e => !!e.classList?.contains('modal'));
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
      case 'enter':
      case 'numpadenter':
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

  onSearch(term: string) {
    this.search.emit(term);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']?.currentValue && changes['data'].currentValue !== changes['data'].previousValue) {
      this.cd.detectChanges();
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

  private subscribeForOutputs(comp: any) {
    if (!this.data.outputs) {
      return;
    }
    for (const o in this.data.outputs) {
      const e: EventEmitter<any> = comp[o];
      if (!e) {
        return;
      }
      if (!(e instanceof EventEmitter)) {
        return;
      }
      this.subscriptions.push(e.subscribe((...args) => this.data.outputs?.[o](...args)));
    }
  }

  private updateHostStyles() {
    const styles = this.data.componentStyles;
    let el = this.dynCompEl?.nativeElement;
    if (!el) {
      return;
    }
    if (el.nodeName === '#comment') {
      el = el.previousElementSibling;
    }
    if (styles) {
      for (const key in styles) {
        this.r2.setStyle(el, key, styles[key]);
      }
    }
  }

  private initDynamicComponent() {
    let comp: any;
    // TODO: Workaround to access component instance from template outlet,
    // may be changed in future versions on Angular
    // @ts-ignore
    if (this.ngComponentOutlet?._componentRef?.instance) {
      // @ts-ignore
      comp = this.ngComponentOutlet._componentRef.instance;
    }
    if (!comp) {
      return;
    }
    if (this.data.onComponentInit) {
      this.data.onComponentInit(comp);
    }
    this.subscribeForOutputs(comp);
  }
}
