import {Injectable, EventEmitter} from '@angular/core';
import {DataService} from './data.service';
import {dsw} from '../../environments/dsw';
import {I18nService} from './i18n.service';
import {ActivatedRoute} from '@angular/router';
import * as Highcharts from 'highcharts';
import {UtilService} from './util.service';
import {CURRENT_NAMESPACE} from './namespace.service';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private settings: any = {};
    public serverSettings: any = {};

    private configLoaded = false;
    private isLocalStorage = false;

    onSettingsChanged = new EventEmitter<any>();

    // Returns local or session storage depending on support
    public get storage(): Storage {
        if (this.isLocalStorage) {
            return localStorage;
        } else {
            return sessionStorage;
        }
    }

    constructor(private ds: DataService,
                private i18n: I18nService,
                private route: ActivatedRoute,
                private us: UtilService) {
        // check for local storage support
        this.checkForLocalStorage();
    }

    /**
     * Check if local storage available
     * note: in incognito mode only session storage is available
     */
    checkForLocalStorage() {
        const key = 'dws_ls_test';
        try {
            localStorage.setItem(key, 'test');
        } catch (e) {
            return;
        }
        localStorage.removeItem(key);
        this.isLocalStorage = true;
    }

    /**
     * Saves user settings to storage
     */
    saveUserSettings() {
        const us = JSON.parse(this.storage.userSettings || '{}');
        us[CURRENT_NAMESPACE] = this.settings;
        this.storage.userSettings = JSON.stringify(us);
    }

    /**
     * Loads config
     */
    loadConfig(response: any) {
        this.settings = {};
        this.configLoaded = true;
        if (response) {
            if (response.constructor === Object) {
                this.settings = response;
            } else {
                let o;
                try {
                    o = JSON.parse(response);
                } catch (e) {
                    o = {};
                }
                this.settings = o;
            }
        }

        // Override settings by user settings
        let userSettings = null;
        if (this.storage.userSettings) {
            userSettings = JSON.parse(this.storage.userSettings)[CURRENT_NAMESPACE];
        }
        if (userSettings) {
            this.us.mergeRecursive(this.settings, userSettings);
        }

        const settings = this.getAppSettings();
        if (!dsw.mobile) {
            if (settings.theme) {
                let link = document.getElementById('page-theme') as HTMLLinkElement;
                if (!link) {
                    link = document.createElement('link');
                }
                link.id = 'page-theme';
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = 'css/' + settings.theme;
                document.head.appendChild(link);
            }
        }
        this.i18n.current = settings.language || 'en';

        // Get colors from theme
        const cols = Highcharts.getOptions().colors;
        for (let i = 1; i <= cols.length; i++) {
            // TODO: check working
            const c = window.getComputedStyle(document.querySelector('.hc' + i.toString())).getPropertyValue('background-color');
            // const c = $('.hc' + i.toString()).css('background-color').toLowerCase();
            if (c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') {
                cols[i - 1] = c;
            }
        }

        const tc = settings.themeColors[settings.theme] || {};
        Highcharts.setOptions({
            xAxis: {labels: {style: {color: tc.hcTextColor}}},
            yAxis: {labels: {style: {color: tc.hcTextColor}}},
            zAxis: {labels: {style: {color: tc.hcTextColor}}},
            chart: {backgroundColor: tc.hcBackground},
            // TODO: check label colors
            // labels: {style: {color: tc.hcTextColor}},
            colors: tc.hcColors || cols,
            time: {
                useUTC: false
            },
            lang: {
                loading: '<div class=\'loader\'></div>',
                shortMonths: (this.i18n.get('shortMonths') as any),
                rangeSelectorZoom: this.i18n.get('zoom'),
                rangeSelectorFrom: this.i18n.get('from'),
                rangeSelectorTo: this.i18n.get('to'),
                noData: this.i18n.get('noData')
            },
            noData: {
                style: {
                    fontWeight: 'bold',
                    fontSize: '15px',
                    color: '#303030'
                }
            }
        });
    }

    /**
     * Returns application settings stored in sessionStorage
     * @returns {object} Application settings
     */
    getAppSettings() {
        const lang = this.route.snapshot.queryParamMap.get('lang');
        if (!this.settings.app) {
            this.settings.app = {};
        }
        const settings = this.settings.app;
        if (lang) {
            settings.language = lang;
        }
        if (!settings.themeColors) {
            settings.themeColors = {};
        }

        // Override theme from url
        const theme = this.route.snapshot.queryParamMap.get('theme');
        if (theme) {
            const t = dsw.const.themes.find((th) => {
                return th.text === theme;
            });
            if (t) {
                settings.theme = t.file;
            }
        }
        return settings;
    }

    /**
     * Save application settings to storage
     * @param {object} settings
     * this object can have:
     *   .language current language
     *   .hideFolders hide or not folders on dashboard list
     *   .showImages show images on tiles
     *   .isMetro use or not metro theme
     */
    setAppSettings(settings) {
        this.settings.app = settings;
        this.saveUserSettings();
    }

    /**
     * Returns widget settings(placement, sizes etc.)
     * @returns {object} Widget settings
     */
    getWidgetsSettings(dashboard) {
        if (this.settings &&
            this.settings.ns &&
            this.settings.ns.widgets) {
            return this.settings.ns.widgets[dashboard] || {};
        } else {
            return {};
        }
    }

    /**
     * Save widget settings to storage
     * @param {object} widgets Widget settings to store
     */
    setWidgetsSettings(widgets: any, dashboard: string) {
        if (!this.settings) {
            this.settings = {};
        }
        if (!this.settings.ns) {
            this.settings.ns = {};
        }
        if (!this.settings.ns.widgets) {
            this.settings.ns.widgets = {};
        }
        this.settings.ns.widgets[dashboard] = JSON.parse(JSON.stringify(widgets));
        this.saveUserSettings();
    }

    /**
     * Returns tiles settings(placement, sizes, icons, colors etc.)
     * @returns {object} Tiles settings
     */
    getTilesSettings() {
        if (this.settings && this.settings.ns) {
            return this.settings.ns.tiles || {};
        } else {
            return {};
        }
    }

    /**
     * Save tiles settings to storage
     * @param {object} tiles Tiles settings to store
     */
    setTilesSettings(tiles) {
        if (!this.settings) {
            this.settings = {};
        }
        if (!this.settings.ns) {
            this.settings.ns = {};
        }
        this.settings.ns.tiles = JSON.parse(JSON.stringify(tiles));
        this.saveUserSettings();
    }

    /**
     * Returns all settings
     */
    getAllSettings() {
        return this.settings;
    }

    /**
     * Sets all settings
     */
    setAllSettings(set) {
        this.settings = set;
        this.saveUserSettings();
    }

    loadServerSettings(settings) {
        this.serverSettings = settings || {};
        // TODO: check broadcast
        // $rootScope.$broadcast('servSettings:loaded');
    }
}
