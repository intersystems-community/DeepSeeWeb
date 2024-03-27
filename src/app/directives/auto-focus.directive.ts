import {AfterViewInit, Directive, ElementRef} from '@angular/core';
import {UtilService} from '../services/util.service';

@Directive({
  selector: '[dswAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements AfterViewInit {

  constructor(private el: ElementRef, private us: UtilService) {
  }

  ngAfterViewInit() {
    if (this.el.nativeElement.attributes.getNamedItem('dswAutoFocus').value === 'desktop') {
      // Focus only for desktop and ignore mobile
      if (this.us.isMobile()) {
        return;
      }
    }
    this.el.nativeElement.focus();
  }

}
