import {Injectable} from '@angular/core';
import {StorageService} from './storage.service';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router, RouterStateSnapshot} from '@angular/router';
import {filter, map, switchMap, tap} from 'rxjs/operators';
import {subscriptionLogsToBeFn} from 'rxjs/internal/testing/TestScheduler';
import {DataService} from "./data.service";

const KEY_NAMESPACES = 'dsw.namespaces';
const KEY_NAMESPACE = 'dsw.namespace';
export let CURRENT_NAMESPACE = '';

@Injectable({
    providedIn: 'root'
})
export class NamespaceService {
    private list: string[] = [];

    constructor(private ss: StorageService,
                private router: Router,
                private route: ActivatedRoute) {
        this.loadNamespaces();

        // this.route.params.pipe(
        //
        //     switchMap(params => {
        //         return params['ns'];
        //     })).subscribe(() => {
        //     console.log('fdsd');
        // })

        // this.router.events.pipe(
        //     filter(e => e instanceof NavigationEnd)
        // ).subscribe(e => {
        //     console.log('NAV END2:', e);
        //     const ns = e['url'].split('/')[1];
        //     if (!ns) { return; }
        //     if (CURRENT_NAMESPACE.toLowerCase() !== ns.toLowerCase()) {
        //         this.setCurrent(ns);
        //     }
        // })
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> {
        return new Observable<any>(o => {
            const done = () => {
                o.next();
                o.complete();
            };
            if (CURRENT_NAMESPACE) {
                void this.router.navigateByUrl(CURRENT_NAMESPACE);
                return;
            }
            void this.router.navigateByUrl('/login');
        });
    }

    public get namespaces(): string[] {
        return this.list;
    }

    loadNamespaces() {
        try {
            const ns = this.ss.storage.getItem(KEY_NAMESPACE) || '';
            CURRENT_NAMESPACE = ns;
            const list = this.ss.storage.getItem(KEY_NAMESPACES) || '[]';
            this.list = JSON.parse(list);
        } catch (e) {
            console.warn(`Can't parse namespace list from storage`);
        }
    }

    setNamespaces(list: string[]) {
        this.list = list;
        try {
            this.ss.storage.setItem(KEY_NAMESPACES, JSON.stringify(list));
        } catch (e) {
            console.warn(`Can't set namespace list to storage`);
        }
    }

    /**
     * Returns list of namespaces
     */
    getNamespaces(): string[] {
        return this.list;
    }

    setCurrent(ns: string) {
        this.ss.storage.setItem(KEY_NAMESPACE, ns);
        CURRENT_NAMESPACE = ns;
    }
}
