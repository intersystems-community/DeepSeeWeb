import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'dsw-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class TextAreaComponent implements AfterViewInit {
  @Input() value = '';
  @ViewChild('input') input!: ElementRef;

  constructor() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.input.nativeElement.focus();
      this.input.nativeElement.select();
    });
  }
}
