import {EventEmitter, Injectable} from '@angular/core';

import {IWidgetDesc} from "./dsw.types";

export interface IButtonToggle {
  widget: IWidgetDesc;
  name: string;
  state: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WidgetService {

  onToggleHeaderButton = new EventEmitter<IButtonToggle>();

  constructor() {
  }

  toggleButton(btn: IButtonToggle) {
    this.onToggleHeaderButton.emit(btn);
  }
}
