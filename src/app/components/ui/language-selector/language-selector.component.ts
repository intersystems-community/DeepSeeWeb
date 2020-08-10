import {Component, OnInit} from '@angular/core';
import {I18nService} from '../../../services/i18n.service';
import {SidebarService} from '../../../services/sidebar.service';
import {StorageService} from '../../../services/storage.service';

@Component({
    selector: 'dsw-language-selector',
    templateUrl: './language-selector.component.html',
    styleUrls: ['./../menu/menu.component.scss']
})
export class LanguageSelectorComponent {

    languages: string[];

    constructor(public i18n: I18nService,
                private storage: StorageService,
                private ss: SidebarService) {
        this.languages = this.i18n.getLanguages();
    }

    selectLanguage(lang: any) {
        const settings = this.storage.getAppSettings();
        this.i18n.current = lang;
        settings.language = lang;
        this.storage.setAppSettings(settings);
        window.location.reload();

        this.ss.sidebarToggle.next(null);
    }

    /**
     * Returns true if language is selected
     * @param lang
     */
    isSelected(lang: string) {
        return this.i18n.current === lang;
    }
}
