import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {ChromePickerComponent, Color, ColorPickerControl, getValueByType} from '@iplab/ngx-color-picker';

@Component({
  selector: 'dsw-color-picker',
  standalone: true,
  imports: [
    ChromePickerComponent
  ],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorPickerComponent {
  @ViewChild('pickerComponent', {static: true}) pickerComponent!: ChromePickerComponent;
  @Input() isImmediate = false;
  @Output() public colorChange: EventEmitter<string> = new EventEmitter();
  colorControl = new ColorPickerControl();
  isVisible = false;
  isTop = false;

  constructor(private el: ElementRef) {
    this.colorControl.hideAlphaChannel();
  }

  private _color?: Color;

  @Input()
  public set color(color: string) {
    this.colorControl.setValueFrom(color);
    this._color = this.colorControl.value;
  }

  @HostBinding('style.background-color')
  get background(): string {
    return this._color ? this._color.toHexString() : '';
  }

  @HostListener('document:mousedown', ['$event'])
  onWidowClick(e: MouseEvent) {
    if (e.composedPath().includes(this.el.nativeElement)) {
      return;
    }
    this.isVisible = false;
  }

  @HostListener('click', ['$event'])
  showColorPicker(event: MouseEvent) {
    if (!this.isVisible) {
      const r = this.el.nativeElement.getBoundingClientRect();
      this.isTop = (r.top + r.height + 320 > window.innerHeight) && (r.top - 320 > 0);
    }
    this.isVisible = true;
  }

  applyClick(event: MouseEvent): void {
    event.stopPropagation();
    this._color = this.colorControl.value;
    this.triggerUpdate();
    this.isVisible = false;
  }

  onColorChanged() {
    if (!this.isImmediate) {
      return;
    }
    this.triggerUpdate();
  }

  private triggerUpdate() {
    this.colorChange.emit(getValueByType(this.colorControl.value, this.colorControl.initType));
  }
}
