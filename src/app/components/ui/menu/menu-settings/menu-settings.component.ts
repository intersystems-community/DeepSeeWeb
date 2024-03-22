import {Component, OnInit} from '@angular/core';
import {SidebarService} from '../../../../services/sidebar.service';
import {ThemeSettingsComponent} from '../../theme-settings/theme-settings.component';
import {AppSettingsComponent} from '../../app-settings/app-settings.component';
import {ChartConfigComponent} from '../../chart-config/chart-config.component';

@Component({
    selector: 'dsw-menu-settings',
    templateUrl: './menu-settings.component.html',
    styleUrls: ['./../menu.component.scss'],
    standalone: true
})
export class MenuSettingsComponent implements OnInit {

    constructor(private sbs: SidebarService) {
    }

    ngOnInit(): void {
    }

    showThemeSettings() {
        this.sbs.showComponent({component: import('./../../theme-settings/theme-settings.component')});
    }

    showAppSettings() {
        this.sbs.showComponent({component: import('./../../app-settings/app-settings.component')});
    }

    showChartsSettings() {
        this.sbs.showComponent({component: import('./../../../ui/chart-config/chart-config.component')});
    }
}
