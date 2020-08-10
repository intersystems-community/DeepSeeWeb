import {Component, OnInit, ViewChild} from '@angular/core';
import {SIDEBAR_TOGGLE_ANIMATION, SidebarComponent} from './components/ui/sidebar/sidebar.component';
import {SidebarService} from './services/sidebar.service';
import {ErrorService, IError} from './services/error.service';
import {ERROR_TOGGLE_ANIMATION} from './components/ui/error/error.component';
import {HeaderService} from './services/header.service';
import {ModalService} from './services/modal.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [SIDEBAR_TOGGLE_ANIMATION, ERROR_TOGGLE_ANIMATION],
})
export class AppComponent implements OnInit {
    title = 'DeepSeeWeb';
    isSidebar = false;

    @ViewChild('sidebar') sidebar: SidebarComponent;
    errors: IError[];

    constructor(public ss: SidebarService,
                public hs: HeaderService,
                public es: ErrorService,
                public ms: ModalService) {

    }

    async addonsComponents() {
        const { HtmlViewerComponent } = await import('./components/widgets/html-viewer.component');

    }

    ngOnInit() {
        this.ss.sidebarToggle.subscribe((constructor) => {
            this.isSidebar = !!constructor;
        });
    }

    onAnimDone() {
        this.ss.onAnimEnd.emit();
    }

    onAnimStart() {
        this.ss.onAnimStart.emit();
    }

    trackError(idx: number, err: IError) {
        return err.id;
    }
}
