import {Component, OnDestroy, OnInit} from '@angular/core';
import {dsw} from '../../../../environments/dsw';
import {MenuService} from '../../../services/menu.service';
import {HeaderService} from '../../../services/header.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {SidebarService} from '../../../services/sidebar.service';
import {NamespaceSelectorComponent} from '../namespace-selector/namespace-selector.component';
import {LanguageSelectorComponent} from '../language-selector/language-selector.component';
import {ModalService} from '../../../services/modal.service';
import {AboutComponent} from '../about/about.component';
import {AppSettingsComponent} from '../app-settings/app-settings.component';
import {DataService} from '../../../services/data.service';
import {MenuSettingsComponent} from './menu-settings/menu-settings.component';
import {CURRENT_NAMESPACE} from '../../../services/namespace.service';
import {TextAreaComponent} from '../text-area/text-area.component';
import { I18nPipe } from '../../../services/i18n.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'dsw-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
    //changeDetection: ChangeDetectionStrategy.OnPush
    ,
    standalone: true,
    imports: [NgIf, I18nPipe]
})
export class MenuComponent implements OnInit, OnDestroy {

    public isHome = false;
    readonly version = dsw.const.ver;
    private subOnRouteChange?: Subscription;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private ds: DataService,
                private ms: MenuService,
                private modal: ModalService,
                private sbs: SidebarService,
                private hs: HeaderService) {
        this.checkHome();
    }


    ngOnInit(): void {
        this.subOnRouteChange = this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.checkHome();
            }
        });
    }

    ngOnDestroy() {
        this.subOnRouteChange?.unsubscribe();
    }

    checkHome() {
        const segments = this.router.url.split('/');
        this.isHome = !segments[segments.length - 1]?.endsWith('.dashboard');
    }

    editDashboard() {
        this.hs.resetSearch();
        this.ms.onEditDashboard.emit(true);
    }

    logout() {
        void this.ds.signOut();
    }

    showNamespaceSelector() {
        this.sbs.showComponent({
            component: NamespaceSelectorComponent
        });
    }

    showLanguageSelector() {
        this.sbs.showComponent({
            component: LanguageSelectorComponent
        });
    }

    showAboutDialog() {
        this.modal.show({
            title: 'DeepSeeWeb v.' + this.version,
            component: AboutComponent,
            closeByEsc: true,
            closeByBackdropClick: true
        });
        this.sbs.showComponent(null);
    }

    showSettingsMenu() {
        this.sbs.showComponent({component: MenuSettingsComponent});
    }

    shareDashboard() {
        this.hs.shareDashboard();
    }

    gotoZenDeepSee() {
        this.hs.gotoZenDeepSee();
    }
}
