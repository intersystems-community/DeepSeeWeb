import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {SidebarService} from '../../../services/sidebar.service';
import {dsw} from '../../../../environments/dsw';
import {StorageService} from '../../../services/storage.service';
import { ColorPickerModule } from 'ngx-color-picker';

import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SidebarActionsComponent } from '../sidebar-actions/sidebar-actions.component';

interface ICssVariable {
    name: string;
    value: string;
    isColor: boolean;
}

@Component({
    selector: 'dsw-theme-settings',
    templateUrl: './theme-settings.component.html',
    // TODO: refactor home-editor
    styleUrls: ['./../../editor/editor-styles.scss', './theme-settings.component.scss'],
    standalone: true,
    imports: [SidebarActionsComponent, NgSelectModule, FormsModule, ColorPickerModule]
})
export class ThemeSettingsComponent implements OnDestroy {

    variables: ICssVariable[] = [];
    readonly model: any;
    private isApplied = false;
    private readonly settings: any;

    constructor(private sbs: SidebarService,
                private ss: StorageService,
                private cd: ChangeDetectorRef) {
        this.settings = this.ss.getAppSettings();
        this.model = {
            themes: dsw.const.themes,
            theme: this.settings.theme
        };

        this.initializeVariables();
    }

    ngOnDestroy() {
        if (!this.isApplied) {
            this.restoreTheme();
        }
    }

    private initializeVariables() {
        this.variables = this.getAllCssVariables().map(name => {
            const value = getComputedStyle(document.documentElement).getPropertyValue(name);
            return {
                name: name.replace('--', ''),
                value,
                isColor: this.isColor(value)
            };
        });
    }

    /**
     * Checks if string valid css color
     * @param color
     */
    private isColor(color: string): boolean {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }

    onCancel() {
        this.sbs.hide();
    }

    onApply() {
        const settings = this.ss.getAppSettings();
        settings.theme = this.model.theme;
        this.ss.setAppSettings(settings);
        this.isApplied = true;
        this.sbs.hide();
    }

    private getAllCssVariables(): string[] {
        // TODO: migrate to TS
        // @ts-ignore
        return Array.from(document.styleSheets)
            .filter(
                (sheet: any) =>
                    sheet.href === null || sheet.href.startsWith(window.location.origin)
            )
            .reduce(
                // @ts-ignore
                (acc, sheet) =>
                    // @ts-ignore
                    (acc = [
                        ...acc,
                        // @ts-ignore
                        ...Array.from(sheet.cssRules).reduce(
                            // @ts-ignore
                            (def, rule: any) =>
                                // @ts-ignore
                                (def =
                                    rule.selectorText === ':root'
                                        ? [
                                            ...def,
                                            ...Array.from(rule.style).filter((name: any) =>
                                                name.startsWith('--')
                                            )
                                        ]
                                        : def),
                            []
                        )
                    ]),
                []
            );
    }

    exportTheme() {
        let css = ':root {\r\n';

        this.variables.forEach(v => {
            css += '\t--' + v.name + ': ' + v.value + ';\r\n';
        });

        css += '}';

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(css));
        element.setAttribute('download', 'theme.css');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    /**
     * Updates css variable when changing color
     * @param v
     */
    updateVariable(v: ICssVariable) {
        document.documentElement.style.setProperty('--' + v.name, v.value);
    }

    restoreTheme() {
        this.model.theme = this.settings.theme;
        this.applyTheme();
    }

    trackVariable(idx: number, v: ICssVariable) {
        return v.name;
    }

    applyTheme() {
        this.variables.forEach(v => {
            document.documentElement.style.setProperty('--' + v.name, null);
        });

        let link = document.getElementById('page-theme') as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
        }
        link.id = 'page-theme';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        if (this.model.theme) {
            link.href = 'css/' + this.model.theme;
        } else {
            link.href = '';
        }
        document.head.appendChild(link);
        setTimeout(() => {
            this.initializeVariables();
        }, 100);
    }
}
