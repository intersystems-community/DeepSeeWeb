import {Injectable} from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import {Observable} from 'rxjs';
import {dsw} from '../../environments/dsw';
import {DataService} from './data.service';
import {StorageService} from './storage.service';
import {WidgetTypeService} from './widget-type.service';
import {CURRENT_NAMESPACE, NamespaceService} from './namespace.service';

@Injectable()
export class ConfigResolver  {
    private model = {};
    private isLoaded = false;

    previousNS = '';

    constructor(private router: Router,
                private ds: DataService,
                private route: ActivatedRoute,
                private st: StorageService,
                private ns: NamespaceService,
                private wt: WidgetTypeService) {
    }

    checkEmbed(state: RouterStateSnapshot): boolean {
        const embedUrl = this.st.serverSettings?.Embed;
        if (embedUrl && state.url.split('?')[0] !== embedUrl) {
            void this.router.navigateByUrl(embedUrl);
            return true;
        }
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> {
        const ns = route.params.ns;
        return new Observable<any>(o => {
                const done = () => {
                    this.isLoaded = true;
                    o.next(this.model);
                    o.complete();
                };

                if (this.checkEmbed(state)) {
                    return;
                }

                if (!CURRENT_NAMESPACE) {
                    if (!ns) {
                        void this.router.navigateByUrl('/login');
                        done();
                        return;
                    }
                    this.ns.setCurrent(ns);
                }
                if (this.previousNS === CURRENT_NAMESPACE) {
                    done();
                    return;
                }
                const p1 = this.ds.loadConfig(CURRENT_NAMESPACE)
                    .then(conf => this.st.loadConfig(conf))
                    .catch(err => this.st.loadConfig(null));

                const p2 = this.loadServerSettings();

                Promise.all([p1, p2])
                    .finally(() => {
                        if (this.checkEmbed(state)) {
                            return;
                        }
                        this.previousNS = CURRENT_NAMESPACE;
                        done();
                    });
            }
        );
    }

    loadServerSettings() {
        return new Promise((res: any) => {
            this.ds.getSettings(CURRENT_NAMESPACE)
                .then((data: any) => {
                    this.st.loadServerSettings(data);
                })
                .finally(() => res());
        });

    }
}
