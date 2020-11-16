import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {I18nService} from '../../../services/i18n.service';
import {dsw} from '../../../../environments/dsw';
import {ActivatedRoute, Router} from '@angular/router';
import {HeaderService} from '../../../services/header.service';
import {SidebarService} from '../../../services/sidebar.service';
import {NamespaceService} from '../../../services/namespace.service';

declare var cordova: any;

@Component({
    selector: 'app-login-screen',
    templateUrl: './login-screen.component.html',
    styleUrls: ['./login-screen.component.scss']
})
export class LoginScreenComponent implements OnInit {
    public model: any;
    private startTime: number;

    constructor(private ds: DataService,
                private i18n: I18nService,
                private hs: HeaderService,
                private ss: SidebarService,
                private ns: NamespaceService,
                private route: ActivatedRoute,
                private router: Router) {
        this.hs.visible$.next(false);
        this.ss.sidebarToggle.next(null);
        delete sessionStorage.dashboarList;
        if (dsw.desktop) {
            delete localStorage.DSWMobileServer;
        }
        this.initModel();

        if (dsw.mobile) {
            this.fillFieldsWithSelectedServer();
        }

        this.initNamespace();

        // $scope.$on('signinerror', onError);
        // Listened in menu.js

        // TODO: toggle menu
        // $rootScope.$broadcast('toggleMenu', false);

        const namespace = this.route.snapshot.queryParamMap.get('ns');
        this.model.namespace = namespace || '';
    }

    initModel() {
        this.model = {
            isDesktop: dsw.desktop,
            ver: dsw.const.ver,
            server: localStorage.DSWMobileServer || location.hostname,
            login: '',
            password: '',
            namespace: '', // localStorage.namespace || 'Samples',
            error: '',
            oAuthUrl: ''
        };
    }

    initNamespace() {
        const from = this.route.snapshot.queryParamMap.get('from');
        if (from) {
            const str = decodeURIComponent(from);
            const ns = this.getParameterByName('ns', str);
            if (ns) {
                this.model.namespace = ns;
            }
        } else {
            const ns = this.route.snapshot.queryParamMap.get('ns');
            if (ns) {
                this.model.namespace = ns;
            }
        }
    }

    ngOnInit() {
        this.loadOAuthConfig();
    }

    loadOAuthConfig() {
        this.ds.loadOAuthConfig().then((d: any) => {
            try {
                if (typeof d === 'string') {
                    const o = JSON.parse(d);
                    this.model.oAuthUrl = o.url || '';
                } else {
                    this.model.oAuthUrl = d.url || '';
                }
            } catch (e) {
            }
        }).catch(() => {
        });
    }

    fillFieldsWithSelectedServer() {
        let idx = localStorage.selectedServer;
        if (!idx) {
            return;
        }
        idx = parseInt(idx, 10);
        if (isNaN(idx)) {
            return;
        }
        let servers = [];
        try {
            servers = JSON.parse(localStorage.serverList || '[]');
        } catch (ex) {
            console.error(ex);
        }
        const srv = servers[idx];
        if (!srv) {
            return;
        }
        this.model.server = srv.server || '';
        this.model.login = srv.login || '';
        this.model.password = srv.password || '';
        this.model.namespace = srv.namespace || '';
    }

    /**
     * Saves current connection info as item for server list
     */
    saveServer() {
        const name = prompt('Please enter server name', this.model.server);
        let servers = [];
        try {
            servers = JSON.parse(localStorage.serverList || '[]');
        } catch (ex) {
            console.error(ex);
        }
        servers.push({
            name,
            server: this.model.server,
            login: this.model.login,
            password: this.model.password,
            namespace: this.model.namespace
        });
        localStorage.serverList = JSON.stringify(servers);
        localStorage.selectedServer = servers.length - 1;
    }

    /**
     * Show servers list modal dialog
     */
    showServers() {
        // TODO: show modal here
        // ngDialog.open({
        //     template: 'src/views/serverList.html',
        //     data: {callback: fillFieldsWithSelectedServer},
        //     controller: 'serverList',
        //     disableAnimation: dsw.mobile,
        //     showClose: true,
        //     className: 'ngdialog-theme-default wnd-mobile wnd-servers'
        // });
    }


    getParameterByName(name: string, url: string) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results) {
            return null;
        }
        if (!results[2]) {
            return '';
        }
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    /**
     * Login with intersystems oauth
     */
    onLoginOAuthClick() {
        window.location.href = this.model.oAuthUrl;
    }

    /**
     * Click event handler for login button
     */
    onLoginClick() {
        this.clearError();
        const s = this.getMobileUrl();
        this.startTime = new Date().getTime();
        this.ds
            .signIn(this.model.login, this.model.password, this.model.namespace, (dsw.mobile && !dsw.desktop) ? s : undefined)
            .catch((r) => this.onError(r))
            .then((r) => this.onSuccess(r, this.model.namespace));
    }

    getMobileUrl(): string {
        let s = this.model.server;
        const isMdx2Json = s.replace('://', '').indexOf('/') !== -1;
        if (s.toLowerCase().indexOf('http') === 0 - 1) {
            s = 'http://' + s;
        }
        if (!isMdx2Json) {
            s += '/MDX2JSON/';
        }
        if (s.charAt(s.length - 1) !== '/') {
            s += '/';
        }
        return s;
    }

    /**
     * Callback for success login
     */
    onSuccess(res, namespace: string) {
        if (!res) {
            return;
        }
        if (dsw.mobile && !dsw.desktop) {
            // TODO: mobile url
            // this.ds.url = this.getMobileUrl();
        }
        localStorage.DSWMobileServer = this.model.server;
        // TODO: load settings here
        //Storage.loadServerSettings(res);
        localStorage.userName = this.ds.username;

        // Set namespaces
        this.ns.setNamespaces(res.Mappings.Mapped);
        this.ns.setCurrent(namespace);

        // Listened in menu.js
        const from = this.route.snapshot.queryParamMap.get('from');
        const search = {};
        if (from) {
            this.router.navigateByUrl(from);
        } else {
            this.router.navigateByUrl('/' + namespace);
        }
    }

    /**
     * Callback for error during login request
     * @param {object|string} data Server response
     * @param {string} status Response status
     * @param {object} headers Response headers
     * @param {object} config Response config
     */
    onError(e) {
        const {error, status} = e;
        const respTime = new Date().getTime() - this.startTime;
        if (respTime >= dsw.const.timeout) {
            this.showError(this.i18n.get('errTimeout'));
            return;
        }
        // if (data) {
        //     let o = null;
        //     if (typeof data === 'object') {
        //         o = data;
        //     } else {
        //         try {
        //             o = JSON.parse(data);
        //         } catch (e) {
        //         }
        //     }
        //     if (o) {
        //         if (o.Error) {
        //             this.showError(o.Error);
        //             return;
        //         }
        //     }
        // }
        //const st = status || data.status;
        switch (status) {
            case 0:
                this.showError(this.i18n.get('errNotFound'));
                break;
            case 401: case 403:
                this.showError(this.i18n.get('errUnauth'));
                break;
            case 500:
                this.showError(error.Error || e.message);
                break;
            default:
                this.showError(e.message);
                break;
        }
    }

    /**
     * Clears error message
     */
    clearError() {
        this.model.error = '';
    }

    /**
     * Shows error message
     * @param {string} txt Error message
     */
    showError(txt) {
        this.model.error = txt;
    }

    scanSettings() {
        cordova.plugins.barcodeScanner.scan(
            (result) => {
                const str = result.text;
                const params = str.split('|');
                if (params[0].toLowerCase() !== 'dsw') {
                    alert('Incorrect QR code');
                    return;
                }
                this.model.server = params[1];
                this.model.login = params[2];
                this.model.password = params[3];
                this.model.namespace = params[4];
                this.onLoginClick();
            },
            (error: any) => {
                alert('Scanning failed: ' + error);
            }
        );
    }
}
