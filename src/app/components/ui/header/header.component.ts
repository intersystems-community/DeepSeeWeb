import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {MenuComponent} from '../menu/menu.component';
import {SidebarService} from '../../../services/sidebar.service';
import {HeaderService} from '../../../services/header.service';
import {FormControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, filter, map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {combineLatest, Observable, of, merge, Subscription} from 'rxjs';
import {MenuService} from '../../../services/menu.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {UtilService} from '../../../services/util.service';
import {StorageService} from '../../../services/storage.service';
import {CURRENT_NAMESPACE} from '../../../services/namespace.service';
import {TextAreaComponent} from '../text-area/text-area.component';
import {ModalService} from '../../../services/modal.service';
import {FilterService} from '../../../services/filter.service';

/**
 * Breadcrumb
 */
interface IPathNav {
    title: string;
    url?: string;
}

@Component({
    selector: 'dsw-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
    searchField = new FormControl();
    private subOnSearch: Subscription;
    private subOnSearchReset: Subscription;

    private pathSegments: IPathNav[] = [];

    path$: Observable<any>;
    namespace = '';
    isSearch = false;

    private path: IPathNav[] = [];

    constructor(public ss: SidebarService,
                public hs: HeaderService,
                private ms: MenuService,
                private us: UtilService,
                private modal: ModalService,
                private fs: FilterService,
                private storage: StorageService,
                private route: ActivatedRoute,
                private router: Router
    ) {
        this.path$ = this.getNavigationEndStream();
        if (this.us.isEmbedded()) {
            this.hs.visible$.next(false);
        }
    }

    static processPath(path: string[], p: string, idx: number) {
        let title = decodeURIComponent(p);
        if (title.indexOf('?') !== -1) {
            title = title.split('?')[0];
        }
        return {title, url: path.slice(0, idx + 1).join('/')};
    }

    ngOnInit() {
        this.namespace = 'IRISAPP';
    }

    ngOnDestroy() {
        this.subOnSearch.unsubscribe();
        this.subOnSearchReset.unsubscribe();
    }

    ngAfterViewInit() {
        this.subOnSearch = this.searchField.valueChanges
            .pipe(debounceTime(200), distinctUntilChanged())
            .subscribe(term => {
                // Cancel editing during search
                this.ms.onEditDashboard.emit(false);
                this.ss.sidebarToggle.next(null);

                // Emit search event
                this.hs.onSearch.next(term);
            });

        this.subOnSearchReset = this.hs.onSearchReset.subscribe(() => {
            this.searchField.setValue('', {emitEvent: false});
            this.hs.onSearch.next('');
        });
    }

    /**
     * Get path for breadcrumb on first init from location,
     * because there is no angular's NavigationEnd on init phase
     */
    private getPathFromLocation(): IPathNav[] {
        const path = window.location.href
            .split('#')[1]
            .split('/').slice(1);
        this.initSearch(path);
        this.pathSegments = path.map((p, idx) => HeaderComponent.processPath(path, p, idx));
        return this.pathSegments;
    }

    /**
     * Toggles main menu
     */
    toggleMenu() {
        if (this.ss.sidebarToggle.value) {
            this.ss.sidebarToggle.next(null);
        } else {
            this.ss.sidebarToggle.next({component: MenuComponent});
        }
    }

    /**
     * Returns path segments for breadcrumbs from NavigationEnd event
     */
    private getPathFromNavigation(e: any): IPathNav[] {
        const tree = this.router.parseUrl(this.router.url);
        let path = tree.root.children.primary?.segments?.map(s => s.path) || [];
        this.initSearch(path);
        this.pathSegments = path.map((p, idx) => HeaderComponent.processPath(path, p, idx));
        return this.pathSegments;
    }

    /**
     * Initializes search field visibility
     * @param path
     */
    private initSearch(path: string[]) {
        this.isSearch = !path[path.length - 1]?.endsWith('.dashboard');
    }

    /**
     * Returns breadcrumbs stream
     */
    private getNavigationEndStream(): Observable<IPathNav[]> {
        return merge(
            of(this.getPathFromLocation()),
            this.router.events.pipe(
                filter(e => e instanceof NavigationEnd),
                map(e => this.getPathFromNavigation(e))
            )).pipe(tap(path => {
                this.path = path;
                return path;
            }));
    }

    /**
     * Navigates to same dashboard on DeepSeeZen
     */
    gotoZenDeepSee() {
        const folder = this.storage.serverSettings.DefaultApp || '/csp/' + CURRENT_NAMESPACE;
        const dashboard = this.path[this.path.length - 1].url.split('/').slice(1).join('/');
        const url = folder + '/_DeepSee.UserPortal.DashboardViewer.zen?DASHBOARD=' + dashboard;
        window.open(url);
    }

    /**
     * Shows share dashboard screen
     */
    showShareDashboard() {
        const url = this.fs.getFiltersShareUrl();
        this.modal.show({
            title: 'Share dashboard',
            component: TextAreaComponent,
            closeByEsc: true,
            onComponentInit: (c: TextAreaComponent) => {
                c.value = url;
            }
        });
    }
}
