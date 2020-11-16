import {Injectable} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {dsw} from '../../environments/dsw';
import {DataService} from './data.service';
import {StorageService} from './storage.service';
import {WidgetTypeService} from './widget-type.service';
import {CURRENT_NAMESPACE, NamespaceService} from './namespace.service';

@Injectable()
export class ConfigResolver implements Resolve<any> {
    private model = {};
    private isLoaded = false;


    private previousNS = '';

    constructor(private router: Router,
                private ds: DataService,
                private route: ActivatedRoute,
                private st: StorageService,
                private ns: NamespaceService,
                private wt: WidgetTypeService) {
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
                this.ds.loadConfig(CURRENT_NAMESPACE)
                    .then(conf => this.st.loadConfig(conf))
                    .catch(err => this.st.loadConfig(null))
                    .finally(() => {
                        this.previousNS = CURRENT_NAMESPACE;
                        done();
                    });
            }
        );
    }
}
