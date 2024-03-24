import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MenuComponent} from '../menu/menu.component';
import {SidebarService} from '../../../services/sidebar.service';
import {HeaderService} from '../../../services/header.service';
import {filter, map, tap} from 'rxjs/operators';
import {merge, Observable, of, Subscription} from 'rxjs';
import {MenuService} from '../../../services/menu.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {UtilService} from '../../../services/util.service';
import {StorageService} from '../../../services/storage.service';
import {CURRENT_NAMESPACE} from '../../../services/namespace.service';
import {ModalService} from '../../../services/modal.service';
import {FilterService} from '../../../services/filter.service';
import {DataService} from "../../../services/data.service";
import {I18nService} from "../../../services/i18n.service";
import {WidgetEditorComponent} from "../../editor/widget-editor/widget-editor.component";
import {SearchInputComponent} from "../search/search-input/search-input.component";

/**
 * Breadcrumb
 */
interface IPathNav {
    title: string;
    url?: string;
    isMoreButton?: boolean;
    moreList?: IPathNav[];
}

@Component({
    selector: 'dsw-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('inpSearch') inpSearch: SearchInputComponent;

    private subTitle: Subscription;
    // private subShareDashboard: Subscription;
    private subGotoDSZ: Subscription;
    private subToggleMobileFilter: Subscription;
    private subOnSearchReset: Subscription;
    private pathSegments: IPathNav[] = [];

    path$: Observable<any>;
    namespace = '';
    isSearch = false;

    title = '';

    path: IPathNav[] = [];
    isMobileFilterButton = false;
    languages: string[];
    selectedLanguage = this.i18n.current.toUpperCase();
    isMorePressed = false;
    shareUrl = '';
    search = '';

    constructor(public ss: SidebarService,
                public hs: HeaderService,
                private ds: DataService,
                private ms: MenuService,
                private us: UtilService,
                private modal: ModalService,
                private fs: FilterService,
                private storage: StorageService,
                private i18n: I18nService,
                private route: ActivatedRoute,
                private router: Router
    ) {
        this.languages = this.i18n.getLanguages().map(l => l.toUpperCase());

        this.path$ = this.getNavigationEndStream();
        if (this.storage.serverSettings?.Embed || this.us.isEmbedded()) {
            this.hs.visible$.next(false);
        }

        this.subOnSearchReset = this.hs.onSearchReset.subscribe(() => {
            this.inpSearch.value = '';
            this.inpSearch.emitValueChanged();
        });
    }

    static processPath(path: string[], p: string, idx: number) {
        let title = decodeURIComponent(p);
        if (title.indexOf('?') !== -1) {
            title = title.split('?')[0];
        }
        return {title, url: decodeURIComponent(path.slice(0, idx + 1).join('/'))};
    }

    ngOnInit() {
        this.namespace = CURRENT_NAMESPACE;

        this.subTitle = this.ms.onSetTitle.subscribe(t => {
            this.title = t || this.path[this.path?.length - 1]?.title || '';
        });

        /*this.subShareDashboard = this.hs.shareDashboardEmitter.subscribe(() => {
            this.showShareDashboard();
        });*/

        this.subGotoDSZ = this.hs.gotoZenDeepSeeEmitter.subscribe(() => {
            this.gotoZenDeepSee();
        });

        this.subToggleMobileFilter = this.hs.mobileFilterToggle.subscribe((state: boolean) => {
            this.isMobileFilterButton = state;
        });
    }

    ngOnDestroy() {
        this.subOnSearchReset.unsubscribe();
        this.subToggleMobileFilter.unsubscribe();
        // this.subShareDashboard.unsubscribe();
        this.subGotoDSZ.unsubscribe();
        this.subTitle.unsubscribe();
    }

    ngAfterViewInit() {
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
        this.buildMoreDropdown();
        return this.pathSegments;
    }

    /**
     * Toggles main menu
     */
    toggleMenu() {
        if (this.ss.sidebarToggle.value) {
            this.ss.showComponent(null);
        } else {
            this.ss.showComponent({component: MenuComponent});
        }
    }

    /**
     * Returns path segments for breadcrumbs from NavigationEnd event
     */
    private getPathFromNavigation(e: any): IPathNav[] {
        const tree = this.router.parseUrl(this.router.url);
        const path = tree.root.children.primary?.segments?.map(s => s.path) || [];
        this.initSearch(path);
        this.pathSegments = path.map((p, idx) => HeaderComponent.processPath(path, p, idx));
        this.buildMoreDropdown();

        return this.pathSegments;
    }

    private buildMoreDropdown() {
        if (this.pathSegments.length > 3) {
            const more = this.pathSegments.splice(1, this.pathSegments.length - 2);
            this.pathSegments.splice(1, 0, {
                title: '',
                isMoreButton: true,
                moreList: more
            });
        }
    }

    /**
     * Initializes search field visibility
     * @param path
     */
    private initSearch(path: string[]) {
        this.isSearch = !path[path.length - 1]?.split('?')[0]?.endsWith('.dashboard');
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
        const folder = this.storage.serverSettings.DefaultApp || ('/csp/' + CURRENT_NAMESPACE);
        const dashboard = this.path[this.path.length - 1].url.split('/').slice(1).join('/');
        const prefix = location.pathname.split('/').slice(0, -2).join('/') || '';
        const url = prefix + folder + '/_DeepSee.UserPortal.DashboardViewer.zen?DASHBOARD=' + encodeURIComponent(decodeURIComponent(dashboard));
        window.open(url);
    }

    /**
     * Shows share dashboard screen
     */
    showShareDashboard() {
        this.shareUrl = this.fs.getFiltersShareUrl();
        /*if (asModal) {
            this.modal.show({
                title: 'Share dashboard',
                component: ShareDashboardComponent,
                closeByEsc: true,
               /!* onComponentInit: (c: TextAreaComponent) => {
                    c.value = url;
                }*!/
            });
        }*/

        /*const url = this.fs.getFiltersShareUrl();
        this.modal.show({
            title: 'Share dashboard',
            component: TextAreaComponent,
            closeByEsc: true,
            onComponentInit: (c: TextAreaComponent) => {
                c.value = url;
            }
        });*/
    }

    /**
     * Shows mobile filter dialog
     */
    toggleMobileFilter() {
        this.hs.toggleMobileFilterDialog();
    }

    selectLanguage(l: string) {
        const lang = l.toLowerCase();
        const settings = this.storage.getAppSettings();
        this.i18n.current = lang;
        settings.language = lang;
        this.storage.setAppSettings(settings);
        window.location.reload();
    }

    logout() {
        void this.ds.signOut();
    }

    @HostListener('document:click', ['$event'])
    hideMoreDropdown(e: MouseEvent, isMoreBtn = false) {
        if (isMoreBtn || (e?.target as any)?.classList?.contains('btn-more')) {
            return;
        }

        this.isMorePressed = false;
    }

    onAddClick() {
        this.ss.showComponent(null);
        this.ss.showComponent({component: WidgetEditorComponent, single: true});
    }

    onSearch(term: string) {
        // Cancel editing during search
        this.ms.onEditDashboard.emit(false);
        // Emit search event
        this.hs.onSearch.next(term);
    }
}
