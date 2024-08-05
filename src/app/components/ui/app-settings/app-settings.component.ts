import {Component, OnInit} from '@angular/core';
import {SidebarService} from '../../../services/sidebar.service';
import {StorageService} from '../../../services/storage.service';
import {UtilService} from '../../../services/util.service';
import {CURRENT_NAMESPACE} from '../../../services/namespace.service';
import {DEFAULT_COL_COUNT} from '../../screens/dashboard-screen/dashboard-screen.component';
import {ModalService} from '../../../services/modal.service';
import {I18nPipe, I18nService} from '../../../services/i18n.service';
import {FormsModule} from '@angular/forms';
import {InputComponent} from '../input/input/input.component';
import {SidebarActionsComponent} from '../sidebar-actions/sidebar-actions.component';

@Component({
  selector: 'dsw-app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./../../editor/editor-styles.scss', './app-settings.component.scss'],
  standalone: true,
  imports: [SidebarActionsComponent, InputComponent, FormsModule, I18nPipe]
})
export class AppSettingsComponent implements OnInit {
  model: any;

  private settings: any;

  constructor(private sbs: SidebarService,
              private ss: StorageService,
              private us: UtilService,
              private modal: ModalService,
              private i18n: I18nService) {
    this.settings = this.ss.getAppSettings();
    this.model = {
      isSaveFilters: this.settings.isSaveFilters === undefined ? true : this.settings.isSaveFilters,
      isRelatedFilters: this.settings.isRelatedFilters === undefined ? true : this.settings.isRelatedFilters,
      isTilePushDisabled: !!this.settings.isTilePushDisabled,
      colCount: this.settings.colCount || DEFAULT_COL_COUNT
    };
  }

  ngOnInit(): void {
  }

  onCancel() {
    this.sbs.hide();
  }

  onApply() {
    this.applySettings();
    this.sbs.hide();
  }

  /**
   * Read settings from file
   * @param {event} evt Event
   */
  readSettings(evt) {
    const f = evt.target.files[0];
    if (!f) {
      return;
    }
    const r = new FileReader();
    r.onload = (e: any) => {
      const contents = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(e.target.result) as any));
      this.ss.setAllSettings(contents);
      this.ss.onSettingsChanged.emit(this.ss.getAppSettings());
      this.sbs.hide();
      this.modal.show(this.i18n.get('settingsImported'), () => {
        window.location.reload();
      });
    };
    r.readAsArrayBuffer(f);
  }

  /**
   * Exports settings to file
   */
  exportSettings() {
    const filename = CURRENT_NAMESPACE + '.' + new Date().toLocaleDateString() + '.json';
    const data = JSON.stringify(this.ss.getAllSettings());
    this.downloadFile(filename, data);
  }

  /**
   * Reset user settings(position, sizes, icons, etc.)
   */
  resetSettings() {
    const removeSettings = st => {
      // const all = this.ss.getAllSettings();
      // const us = all.userSettings;
      // if (us) {
      // const o = JSON.parse(us);
      // delete o[CURRENT_NAMESPACE];
      // all.userSettings = JSON.stringify(o);
      delete st['userSettings'];
      this.modal.show(this.i18n.get('settingsReset'), () => {
        window.location.reload();
      });
      // this.ss.saveUserSettings();
      // }
    };

    // Remove both from local and session storage
    removeSettings(sessionStorage);
    try {
      removeSettings(localStorage);
    } catch {
    }

    //  reloadPage();
  }

  private applySettings() {
    this.settings.isSaveFilters = !!this.model.isSaveFilters;
    this.settings.isRelatedFilters = !!this.model.isRelatedFilters;
    this.settings.isTilePushDisabled = !!this.model.isTilePushDisabled;
    this.settings.colCount = this.model.colCount;

    this.ss.onSettingsChanged.emit(this.settings);
    this.ss.setAppSettings(this.settings);
  }

  /**
   * Starts file download locally from js
   * @param {string} filename File name
   * @param {string} data Data to download
   */
  private downloadFile(filename: string, data: string) {
    const a = document.createElement('a');
    a.style.setProperty('display', 'none');
    a.download = filename;
    const blob = new Blob([data], {type: 'application/octet-stream'});
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    document.body.appendChild(a);
    a.click();
    setTimeout(_ => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }


}
