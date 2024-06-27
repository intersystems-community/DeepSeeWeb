import {Component, OnDestroy, OnInit} from '@angular/core';
import {dsw} from '../../../../environments/dsw';
import {MenuService} from '../../../services/menu.service';
import {HeaderService} from '../../../services/header.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {SidebarService} from '../../../services/sidebar.service';
import {ModalService} from '../../../services/modal.service';
import {DataService} from '../../../services/data.service';
import {I18nPipe} from '../../../services/i18n.service';


@Component({
  selector: 'dsw-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
  standalone: true,
  imports: [I18nPipe]
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
      component: import('./../../ui/namespace-selector/namespace-selector.component')
    });
  }

  showLanguageSelector() {
    this.sbs.showComponent({
      component: import('./../../ui/language-selector/language-selector.component')
    });
  }

  showAboutDialog() {
    this.modal.show({
      title: 'DeepSeeWeb v.' + this.version,
      component: import('./../../ui/about/about.component'),
      closeByEsc: true,
      closeByBackdropClick: true
    });
    this.sbs.hide();
  }

  showSettingsMenu() {
    this.sbs.showComponent({component: import('./../../ui/menu/menu-settings/menu-settings.component')});
  }

  shareDashboard() {
    this.hs.shareDashboard();
  }

  gotoZenDeepSee() {
    this.hs.gotoZenDeepSee();
  }
}
