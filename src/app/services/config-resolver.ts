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
        return new Observable<any>(o => {
                const done = () => {
                    this.isLoaded = true;
                    o.next(this.model);
                    o.complete();
                };
                // if (this.isLoaded) {
                //     done();
                //     return;
                // }
                this.ds.loadConfig(CURRENT_NAMESPACE)
                    .then(conf => this.st.loadConfig(conf))
                    .finally(() => done());
            }
        );
    }

   //  async loadConfiguration() {
   //      //return new Promise((res, rej) => {
   //          // In mobile version navigate to login if there is not connection set yet
   //          if (dsw.mobile && !dsw.desktop && !localStorage.connectorRedirect) {
   //              this.router.navigateByUrl('/');
   //              // res();
   //              return;
   //          }
   //
   //          try {
   //              await this.loadSettings();
   //          } catch (e) {}
   //          try {
   //              await this.loadConf();
   //          } catch (e) {}
   //
   //          // // Check if namespace was changed
   //          // const ns = route.snapshot.queryParamMap.get('ns') || '';
   //          // if (ns.toLowerCase() !== (localStorage.namespace || '').toLowerCase()) {
   //          //     // Clear dashboard list
   //          //     // TODO: remove from correct storage
   //          //     delete sessionStorage.dashboarList;
   //          //     return this.loadSettings()
   //          //         .then(() => {
   //          //             this.loadConf();
   //          //         })
   //          //         .catch((e) => {
   //          //             this.router.navigateByUrl('/login');
   //          //             res();
   //          //         })
   //          //         .finally(() => {
   //          //             res();
   //          //         });
   //          // }
   //          // if (this.ds.firstRun) {
   //          //     return this.loadConf();
   //          // } else {
   //          //     res();
   //          // }
   //      //});
   //  }
   //
   //
   //  private onConfigLoaded(result?: any) {
   //      // TODO: broadcast;
   //      // $rootScope.$broadcast('toggleMenu', true);
   //      // $rootScope.$broadcast('refresh', true);
   //
   //      this.st.loadConfig(result);
   //      return this.ds.loadAddons()
   //          .catch((e) => {
   //              console.log(`Can't load addons: ${e}`);
   //          })
   //          .then((addons: any[]) => {
   //              // if (addons && addons.length) {
   //              //     dsw.addons = [...addons];
   //              //     for (let i = 0; i < dsw.addons.length; i++) {
   //              //         const a = dsw.addons[i].split('.');
   //              //         a.pop();
   //              //         dsw.addons[i] = a.join('.');
   //              //     }
   //              // }
   //              // return this.loadAddons(addons);
   //          })
   //          .then(() => {
   //              // TODO: broadcast
   //              // $rootScope.$broadcast('addons:loaded', addons);
   //          })
   //          .then(() => {
   //              return this.loadSettings();
   //          });
   //  }
   //
   //  async loadConf() {
   //      let conf = null;
   //      try {
   //          await this.ds.loadMainConfig();
   //      } catch {}
   //      try {
   //          conf = await this.ds.loadConfig(this.route.snapshot.queryParamMap.get('ns'));
   //      } catch {}
   //      this.onConfigLoaded(conf);
   //
   //      // return new Promise((res) => {
   //      //     // Load main config
   //      //     this.ds.loadMainConfig()
   //      //         .finally(() => {
   //      //             return this.ds.loadConfig(this.route.snapshot.queryParamMap.get('ns'))
   //      //             // Config not found - it's ok, because there can be namespaces without config or DSW without main config
   //      //                 .catch(_ => {
   //      //                     this.onConfigLoaded();
   //      //                     res();
   //      //                 })
   //      //                 .then((d) => {
   //      //                     this.onConfigLoaded(d).then(() => res());
   //      //                 });
   //      //         });
   //      // });
   //  }
   //
   //
   //  // loadAddons(addons: any[]) {
   //  //     return new Promise((res) => {
   //  //         this.wt.initialize();
   //  //         res();
   //  //     });
   //      // if (!addons || !addons.length && !localStorage.devAddons) {
   //      //     return $q.when();
   //      // }
   //      // var defers = [];
   //      // for (var i = 0; i < addons.length; i++) {
   //      //     var url = addons[i] + '?tmp=' + Date.parse(new Date());
   //      //     if (localStorage.connectorRedirect) {
   //      //         url = localStorage.connectorRedirect.split('/').slice(0, -2).join('/') + url;
   //      //     } else {
   //      //         //url = window.location.host + url;
   //      //     }
   //      //     if (url && !localStorage.devAddons) {
   //      // TODO: load addons here
   //      // var defer = $q.defer();
   //      // defers.push(defer.promise);
   //      //
   //      // $ocLazyLoad.load(url).then((function(d){
   //      //     return function() {
   //      //         d.resolve();
   //      //     };
   //      // })(defer)).catch((function(d, u, name){
   //      //     return function(e) {
   //      //         alert("Can't load addon: " + name);
   //      //         d.resolve();
   //      //     };
   //      // })(defer, url, name));
   //      //     }
   //      // }
   //
   //      // Load dev addons from localhost if specified
   //      // TODO: dev addons loading
   //      // if (localStorage.devAddons) {
   //      //     var localAddons = JSON.parse(localStorage.devAddons);
   //      //     localAddons.forEach(a => {
   //      //         if (!dsw.addons) dsw.addons = [];
   //      //         dsw.addons.push(a);
   //      //         let defer = $q.defer();
   //      //         defers.push(defer.promise);
   //      //         $ocLazyLoad.load(a).then((function(d){
   //      //             return function() {
   //      //                 d.resolve();
   //      //             };
   //      //         })(defer)).catch((function(d, u){
   //      //             return function(e) {
   //      //                 alert("Can't load addon: " + u + " " + e);
   //      //                 d.resolve();
   //      //             };
   //      //         })(defer, url));
   //      //     });
   //      // }
   //
   //      //if (defers.length === 0) return $q.when(); else return $q.all(defers);
   // // }
   //
   //  async loadSettings() {
   //      return this.ds.getSettings().then((res) => {
   //          this.st.loadServerSettings(res);
   //      }).catch(e => {
   //          console.log(e);
   //      })
   //  }

}
