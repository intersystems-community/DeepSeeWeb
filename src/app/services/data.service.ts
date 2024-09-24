import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {dsw} from '../../environments/dsw';
import {firstValueFrom, Observable, of} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ErrorService} from './error.service';
import {CURRENT_NAMESPACE} from './namespace.service';

import {IFilterValue, IKPIData, IMDXData, IPivotData, IRelatedFiltersRequestData, IWidgetDesc} from './dsw.types';

export let MDX2JSON = 'MDX2JSON';
export let NAMESPACE = 'MDX2JSON';

export interface IKPIFilter {
  name: string; // targetProperty
  value: string;
  exclude?: boolean;
}

// Tile info object
export interface ITileInfo {
  isFolder: boolean;

  path: string;
  fullPath: string;

  // Background color
  color: number;
  // Text color
  fontColor: number;
  icon: number;
  title: string;
  customTitle: string;
  // Widget index to show
  widget: number;
  // Store previously requested widget to track changes
  requestedWidget: string;

  // Position
  x: string;
  y: string;
  // size
  rows: string;
  cols: string;
  // Without title
  hideTitle: boolean;
  idx: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public firstRun = true;
  public dashboardList = new Map<string, string>();
  public username = '';
  private withCredentialsHeaders = {withCredentials: true, headers: new HttpHeaders({'Accept-Language': 'en-US'})};
  private withoutCredentialsHeaders = {
    headers: new HttpHeaders({'Accept-Language': 'en-US'})
  };
  private withCredentialsTimeoutHeaders = {
    withCredentials: true,
    headers: new HttpHeaders({timeout: dsw.const.timeout.toString(), 'Accept-Language': 'en-US'})
  };
  private withoutCredentialsTimeoutHeaders = {
    headers: new HttpHeaders({
      timeout: dsw.const.timeout.toString(),
      'Accept-Language': 'en-US'
    })
  };

  constructor(private route: ActivatedRoute,
              public router: Router,
              private http: HttpClient,
              private es: ErrorService) {
  }

  public get url() {
    let prefix = '';
    const redirect = localStorage.getItem('connectorRedirect');
    if (redirect) {
      prefix = redirect;
    }
    return prefix + '../' + MDX2JSON + '/';
  }


  // adjustEndpoints() {
  //     if (localStorage.connectorRedirect && (dsw.mobile || location.host.split(':')[0].toLowerCase() === 'localhost')) {
  //         _this.url = localStorage.connectorRedirect;
  //         _this.newAPI = localStorage.connectorRedirect.replace("/" + MDX2JSON, '') + 'api/deepsee/Data/MDXExecute';
  //     } else {
  //         _this.url = $location.$$protocol + "://" + $location.$$host;
  //         if ($location.$$port) _this.url += ":" + $location.$$port;
  //         _this.url += `/${MDX2JSON}/`;
  //
  //         _this.newAPI = $location.$$protocol + "://" + $location.$$host;
  //         if ($location.$$port) _this.newAPI += ":" + $location.$$port;
  //         _this.newAPI += '/api/deepsee/Data//MDXExecute';
  //     }
  // }

  /**
   * Navigates to login page
   */
  gotoLoginPage() {
    // TODO: implement
    // var url = $location.$$url;
    // if ($location.$$path !== "/login") {
    //   $location.path("/login").search({from: url});
    // }
  }

  /**
   * Returns current namespace
   * @returns {string} Namespace
   */
  // getNamespace(): string {
  //     const lastNS = localStorage.namespace || 'samples';
  //     const ns = this.route.snapshot.queryParamMap.get('ns') || lastNS;
  //     return ns.toUpperCase();
  // }

  /**
   * Requests dashboard list
   * @returns {object} $http promise
   */
  getDashboards(): Observable<ITileInfo[]> {
    // Get cached result for namespace if exists
    const key = CURRENT_NAMESPACE.toLowerCase();
    if (this.dashboardList.has(key)) {
      return of(JSON.parse(this.dashboardList.get(key) || '{}'));
    }
    // Else return from REST
    return this.http.post(
      this.url + 'Dashboards?Namespace=' + CURRENT_NAMESPACE,
      {Folder: ''},
      {withCredentials: true}
    ).pipe(
      tap((data) => {
        this.dashboardList.set(CURRENT_NAMESPACE.toLowerCase(), JSON.stringify(data));
      }),
      this.handleError()
    ) as Observable<ITileInfo[]>;
  }

  /**
   * Request KPI data
   */
  getKPIData(name: string, filters?: IFilterValue[], isDrillthrough = false) {
    return firstValueFrom(
      this.http.post<IKPIData>(
        this.url + 'KPI?Namespace=' + CURRENT_NAMESPACE,
        {KPI: name, FILTERS: filters, Drillthrough: isDrillthrough ? 1 : undefined},
        this.withCredentialsTimeoutHeaders
      )
    );
  }

  /**
   * Request pivot data
   * @param {string} name Name of pivot
   * @returns {object} $http promise
   */
  getPivotData(name: string
  ) {
    return firstValueFrom(
      this.http.post<IPivotData>(
        this.url + 'DataSource?Namespace=' + CURRENT_NAMESPACE,
        {DataSource: name},
        this.withCredentialsTimeoutHeaders
      )
    );
  }

  /**
   * Request pivot data
   * @param {string} name Name of pivot
   * @returns {object} $http promise
   */
  getTermList(name: string) {
    return this.http.post(
      this.url + 'TermList?Namespace=' + CURRENT_NAMESPACE,
      {TermList: name},
      this.withCredentialsTimeoutHeaders
    ).toPromise();
  }

  /**
   * Requests MDX query result
   * @param {string} mdx MDX query
   * @returns {object} $http promise
   */
  async execMDX(mdx: string) {
    const parts = mdx.split(' ');
    if (parts && parts.length !== 0 && parts[0].toUpperCase() === 'DRILLTHROUGH') {
      return this.execMDXDrillthrough(mdx, CURRENT_NAMESPACE);
    }

    return firstValueFrom(
      this.http.post<IMDXData>(
        this.url + 'MDX?Namespace=' + CURRENT_NAMESPACE,
        {MDX: mdx},
        this.withCredentialsTimeoutHeaders
      )
    );
  }

  /**
   * Requests MDX drillthrough query result
   */
  async execMDXDrillthrough(mdx: string, namespace: string) {
    return firstValueFrom(
      this.http.post<IMDXData>(
        this.url + 'MDXDrillthrough?Namespace=' + namespace,
        {MDX: mdx},
        this.withCredentialsTimeoutHeaders
      )
    );
  }

  /**
   * Requests widgets list
   */
  getWidgets(dashboard) {
    return firstValueFrom<any>(this.http.post(
      this.url + 'Dashboard?Namespace=' + CURRENT_NAMESPACE,
      {Dashboard: dashboard},
      {...this.withCredentialsTimeoutHeaders, ...{'Content-Type': 'application/json'}}
    ).pipe(this.handleError()));
  }

  /**
   * Handles server errors
   */
  handleError() {
    return catchError(err => {
      if (err.status === 401 || err.status === 403) {
        void this.router.navigateByUrl('/login?from=' + encodeURIComponent(this.router.url));
        return of();
      }
      let msg = err.message;
      if (err?.error?.summary) {
        msg = err?.error?.summary;
      }
      this.es.show(msg);
      throw err;
    });
  }


  /**
   * Requests filter values
   */
  searchFilters(searchStr: string, dataSource: string, relatedFilters?: IRelatedFiltersRequestData[], requestFilters?: string[]) {
    const data: any = {
      DataSource: dataSource,
      Values: 1,
      Search: searchStr
    };
    if (relatedFilters && relatedFilters.length) {
      data.RelatedFilters = relatedFilters;
    }
    if (requestFilters && requestFilters.length) {
      data.RequestedFilters = requestFilters;
    }
    return firstValueFrom(
      this.http.post(
        this.url + 'Filters?Namespace=' + CURRENT_NAMESPACE,
        data,
        this.withCredentialsTimeoutHeaders
      )
    );
  }

  /**
   * Requests pivot variables
   * @param {string} cube Cube name
   * @returns {object} $http promise
   */
  getPivotVariables(cube: string) {
    return this.http.get(
      this.url + 'PivotVariables/' + cube + '?Namespace=' + CURRENT_NAMESPACE,
      this.withCredentialsTimeoutHeaders
    ).toPromise();
  }

  /**
   * Loads file
   * @returns {object} $http promise
   */
  getFile(url: string) {
    return this.http.get(url, {responseType: 'text'}).toPromise();
  }

  // /**
  //  * Requests favorites
  //  * @returns {object} $http promise
  //  */
  // function getFavorites() {
  //   return $http({
  //     method: 'GET',
  //     data: {},
  //     url: _this.url + 'Favorites?Namespace=' + getNamespace(),
  //     withCredentials: true
  //   }).then(transformResponse);
  // }
  //
  // /**
  //  * Adds favorite
  //  * @param {string} path Favorite path
  //  * @returns {object} $http promise
  //  */
  // function addFavorite(path) {
  //   return $http({
  //     method: 'POST',
  //     data: {},
  //     url: _this.url + 'Favorites/'+ encodeURIComponent(path) + '?Namespace=' + getNamespace(),
  //     withCredentials: true
  //   }).then(transformResponse);
  // }
  //
  // /**
  //  * Deletes favorite
  //  * @param {string} path Favorite path
  //  * @returns {object} $http promise
  //  */
  // function deleteFavorite(path) {
  //   return $http({
  //     method: 'DELETE',
  //     data: {},
  //     url: _this.url + 'Favorites/'+ encodeURIComponent(path) + '?Namespace=' + getNamespace(),
  //     withCredentials: true
  //   }).then(transformResponse);
  // }

  /**
   * Loads main configuration from server
   */
  loadMainConfig() {
    return this.http.get('config.json', {headers: new HttpHeaders({withCredentials: 'false'})})
      .toPromise()
      .then((conf: any) => {
        try {
          if (conf && conf.endpoints && conf.endpoints.mdx2json) {
            MDX2JSON = conf.endpoints.mdx2json.replace(/\//ig, '').replace(/ /g, '');
            NAMESPACE = conf.namespace.replace(/\//ig, '').replace(/ /g, '');
          }
        } catch (e) {
          console.error('Incorrect config in file "config.json"');
        }
      });
  }

  /**
   * Loads namespace configuration from server
   * @returns {object} $http promise
   */
  loadConfig(namespace: string) {
    return this.http.get('configs/' + namespace.toLowerCase() + '.json', {headers: new HttpHeaders({withCredentials: 'false'})}).toPromise();
  }

  /**
   * Loads configuration from server
   */
  async loadAddons() {
    return firstValueFrom(
      this.http.get<string[]>(this.url + 'Addons', this.withCredentialsHeaders)
    );
  }

  /**
   * Loads configuration for namespace
   * @returns {object} $http promise
   */
  loadNamespaceConfig() {
    return this.http.get(this.url + `Config/${CURRENT_NAMESPACE}?Namespace=${NAMESPACE}`, this.withCredentialsHeaders).toPromise();
  }

  /**
   * Load OAuth config file oauth.json
   */
  loadOAuthConfig() {
    const query = location.hash.replace('#/', '').split('?')[1];
    return this.http.get('dswoauth/check' + query ? `?${query}` : '', this.withoutCredentialsHeaders).toPromise();
  }

  /**
   * Saves configuration to server
   * @param {object} config Configuration to save
   * @returns {object} $http promise
   */
  // function saveConfig(config) {
  //     return $http({
  //         method: 'POST',
  //         data: { Application: this.getNamespace(), Config: JSON.stringify(config) },
  //         url: _this.url + 'Config?Namespace=MDX2JSON',
  //         withCredentials: true
  //     }).then(transformResponse);
  // }

//   /**
//    * Saves configuration to server
//    * @param {object} config Configuration to save
//    * @param {string} ns Namespace
//    * @returns {object} $http promise
//    */
// function saveNamespaceConfig(config, ns) {
//     return $http({
//       method: 'POST',
//       data: { Application: ns, Config: JSON.stringify(config) },
//       url: _this.url + `Config?Namespace=${NAMESPACE}`,
//       withCredentials: true
//     }).then(transformResponse);
//   }

  /**
   * Sings in
   * @param {string} login User login
   * @param {string} password User password
   * @param {string} namespace Namespace
   * @param {string|undefined} [url] Custom server address
   * @returns {object} $http promise
   */
  signIn(login: string, password: string, namespace: string, url: string) {
    this.username = login;
    return this.http.get(
      url ? (url + 'Test?Namespace=' + namespace) : (this.url + 'Test?Namespace=' + namespace),
      {
        withCredentials: true,
        headers: new HttpHeaders({
          timeout: dsw.const.timeout.toString(),
          Authorization: 'Basic ' + btoa(login + ':' + password)
        })
      }).toPromise();
  }

  /**
   * Signs out
   */
  signOut() {
    this.firstRun = true;
    const deleteCookie = (name) => {
      document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };


    const setCookie = (name, value, days) => {
      const d = new Date();
      d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
      document.cookie = name + '=' + value + ';path=/;expires=' + d.toUTCString();
    };

    this.username = '';
    try {
      localStorage.userName = '';
      sessionStorage.userName = '';
    } catch {
    }

    const done = () => {
      setCookie('CSPWSERVERID', '', -1);
      setCookie('CacheLoginToken', '', -1);
      setCookie('CSPSESSIONID-SP-80-UP-', '', -1);
      setCookie('CSPSESSIONID-SP-80-UP-MDX2JSON-', '', -1);
      void this.router.navigateByUrl('/login');
    };

    return this.http.get(this.url + `Logout?Namespace=${CURRENT_NAMESPACE}`, this.withCredentialsHeaders).toPromise()
      .then(() => {
        done();
      })
      .catch(() => {
        done();
      });
  }

  /**
   * Requests dashboard list
   * @returns {object} $http promise
   */
  execAction(action: string, cube: string) {
    return this.http.post(
      this.url + 'Action/' + cube + '/' + action + '?Namespace=' + CURRENT_NAMESPACE,
      {},
      this.withCredentialsTimeoutHeaders
    ).toPromise();
  }

  async getSettings(namespace: string) {
    return firstValueFrom(
      this.http.get(
        this.url + 'Test?Namespace=' + namespace,
        this.withCredentialsTimeoutHeaders
      )
    );
  }

  async requestListOfDataSources(type: string) {
    return firstValueFrom<any>(this.http.post(
      this.url + `DataSourceList/${type}?Namespace=` + CURRENT_NAMESPACE,
      {},
      this.withCredentialsTimeoutHeaders
    ));
  }

  async saveWidget(dashboard: string, data: Partial<IWidgetDesc>, key?: string) {
    return firstValueFrom<any>(this.http.post(
      this.url + 'saveWidget?Namespace=' + CURRENT_NAMESPACE,
      {key: key || '', Dashboard: dashboard, WidgetData: data},
      this.withCredentialsTimeoutHeaders
    ).pipe(this.handleError()));
  }

  async deleteWidget(dashboard: string, key?: string) {
    return firstValueFrom<any>(this.http.post(
      this.url + 'deleteWidget?Namespace=' + CURRENT_NAMESPACE,
      {key: key || '', Dashboard: dashboard},
      this.withCredentialsTimeoutHeaders
    ).pipe(this.handleError()));
  }
}
