import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {SIDEBAR_TOGGLE_ANIMATION, SidebarComponent} from './components/ui/sidebar/sidebar.component';
import {SidebarService} from './services/sidebar.service';
import {ErrorService, IError} from './services/error.service';
import {
  ERROR_TOGGLE_ANIMATION,
  ERROR_TOGGLE_LEFT_ANIMATION,
  ErrorComponent
} from './components/ui/error/error.component';
import {HeaderService} from './services/header.service';
import {ModalService} from './services/modal.service';
import {NavigationStart, Router, RouterOutlet} from '@angular/router';
import {ModalComponent} from './components/ui/modal/modal.component';
import {HeaderComponent} from './components/ui/header/header.component';
import {AsyncPipe, NgClass} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [SIDEBAR_TOGGLE_ANIMATION, ERROR_TOGGLE_ANIMATION, ERROR_TOGGLE_LEFT_ANIMATION],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    SidebarComponent,
    RouterOutlet,
    ModalComponent,
    NgClass,
    ErrorComponent,
    AsyncPipe
  ],
})
export class AppComponent implements OnInit {
  title = 'DeepSeeWeb';
  isSidebar = false;

  @ViewChild('sidebar') sidebar!: SidebarComponent;
  errors: IError[] = [];

  constructor(public sbs: SidebarService,
              public hs: HeaderService,
              public es: ErrorService,
              public ms: ModalService,
              private router: Router) {

    /*setTimeout(() => {
        this.sbs.showComponent({ component: import('./components/ui/menu/menu.component'), inputs: { }});
    }, 400);*/
  }

  ngOnInit() {
    // Hide sidebar on any route change
    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        this.sbs.hide();
      }
    });
    this.sbs.sidebarToggle.subscribe(info => {
      this.isSidebar = !!info;
    });
  }

  onAnimDone() {
    this.sbs.onAnimEnd.emit();
  }

  onAnimStart() {
    this.sbs.onAnimStart.emit();
  }

  trackError(idx: number, err: IError) {
    return err.id;
  }

  /**
   * This method is not used. It needed to tell compiler that we will load addons
   * from 'addons' folder, to compile it into separate bundles
   */
  /*notUsedOnlyToCompileAddons(addon: string) {
      return [
          import(/!* webpackChunkName: 'addon-' *!/`src/addons/${addon}`)
      ];
  }*/
}
