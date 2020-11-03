import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SidebarService} from '../../../services/sidebar.service';
import {Chart, ColorAxisOptions, PlotSeriesDataLabelsOptions} from 'highcharts';
import {StorageService} from '../../../services/storage.service';
import * as  Highcharts from 'highcharts/highstock';
import {IError} from '../../../services/error.service';
import {Subscription} from 'rxjs';
import {skip} from 'rxjs/operators';
import {BroadcastService} from '../../../services/broadcast.service';

export interface IThemeColors {
    hcColors: string[];
    hcTextColor: string;
    hcBackground: string;
    hcLineColor: string;
    hcBorderColor: string;
}

@Component({
    selector: 'dsw-chart-config',
    templateUrl: './chart-config.component.html',
    styleUrls: ['./../home-editor/home-editor.component.scss', './chart-config.component.scss']
})
export class ChartConfigComponent implements OnInit, OnDestroy {
    @Input() chart: Chart;
    @Input() widgetSettings: any;
    @Input() onSave: () => void;
    @Input() onUpdate: (themeColors: IThemeColors) => void;

    private key: string;
    private isApplied = false;
    private isChanged = false;

    model = {
        themeColors: {
            hcColors: [],
            hcTextColor: '',
            hcBackground: '',
            hcLineColor: '',
            hcBorderColor: ''
        } as IThemeColors
    };

    // Store original colors to be able make cancel
    private originalColors: IThemeColors;
    private globalOriginalColors: any;

    constructor(private sbs: SidebarService,
                private ss: StorageService,
                private bs: BroadcastService) {
    }

    ngOnInit() {
        const settings = this.ss.getAppSettings();

        // For widget settings use widget colors
        this.key = settings.theme || '';

        // Changing widget colors
        if (this.widgetSettings) {
            const cols = this.widgetSettings.themeColors[this.key];
            if (cols) {
                this.model.themeColors = JSON.parse(JSON.stringify(cols));
            } else {
                // this.widgetSettings.themeColors[this.key] = {};
                // this.model.themeColors = {} as any; // this.widgetSettings.themeColors[this.key];
            }
        } else {
            // Changing global colors
            if (settings.themeColors[this.key]) {
                this.globalOriginalColors = JSON.parse(JSON.stringify(settings.themeColors[this.key]));
            }
            if (!settings.themeColors[this.key]) {
                settings.themeColors[this.key] = this.model.themeColors;
            } else {
                this.model.themeColors = settings.themeColors[this.key];
            }
        }

        this.initColors();
    }

    ngOnDestroy() {
        if (!this.isApplied) {
            this.restoreColors();
        }
    }

    onCancel() {
        this.sbs.sidebarToggle.next(null);
    }

    onApply() {
        this.isApplied = true;
        if (this.onSave) {
            // Call save on local widget
            if (this.isChanged) {
                this.widgetSettings.themeColors[this.key] = this.model.themeColors;
            }
            this.onSave();
        } else {
            // Save global theme colors
            const settings = this.ss.getAppSettings();
            settings.themeColors[this.key] = this.model.themeColors;
            this.ss.setAppSettings(settings);
        }
        this.sbs.sidebarToggle.next(null);
    }

    update() {
        this.isChanged = true;
        if (this.onUpdate) {
            this.onUpdate(this.model.themeColors);
        } else {
            this.bs.broadcast('charts:update-colors', this.model.themeColors);
        }
    }

    /**
     * init theme colors with default values
     */
    initColors() {
        const tc = this.model.themeColors;
        const def = this.getDefaultColors();
        if (!tc.hcColors || tc.hcColors.length === 0) {
            tc.hcColors = def.hcColors;
        }
        if (!tc.hcTextColor) {
            tc.hcTextColor = def.hcTextColor;
        }
        if (!tc.hcBackground) {
            tc.hcBackground = def.hcBackground;
        }
        if (!tc.hcBorderColor) {
            tc.hcBorderColor = def.hcBorderColor;
        }
        if (!tc.hcLineColor) {
            tc.hcLineColor = def.hcLineColor;
        }

        this.originalColors = JSON.parse(JSON.stringify(tc));
    }

    /**
     * Track colors by index
     * @param idx
     * @param err
     */
    byIndex(idx: number, err: IError) {
        return idx;
    }

    /**
     * Restores original colors. Used by cancel button
     */
    private restoreColors() {
        if (this.widgetSettings) {
            this.widgetSettings.themeColors[this.key] = this.originalColors;
        } else {
            const settings = this.ss.getAppSettings();
            settings.themeColors[this.key] = this.globalOriginalColors;
        }
        if (this.onUpdate) {
            this.onUpdate(this.originalColors);
        } else {
            this.bs.broadcast('charts:update-colors', this.originalColors);
        }
    }

    /**p
     * Returns default colors
     */
    private getDefaultColors(): IThemeColors {
        const opt = Highcharts.getOptions();
        return {
            hcColors: opt.colors.slice(),
            hcBackground: opt.chart.backgroundColor as string,
            hcTextColor: (opt as any).labels.style.color,
            hcBorderColor: null, // opt.plotOptions.bar.borderColor as string,
            hcLineColor: '#FFFFFF' // ((this.chart as any).colorAxis as ColorAxisOptions).minorGridLineColor as string
        };
    }

    /**
     * Resets colors to default
     */
    resetToDefault() {
        const tc = this.getDefaultColors();
        this.model.themeColors.hcLineColor = tc.hcLineColor;
        this.model.themeColors.hcBorderColor = tc.hcBorderColor;
        this.model.themeColors.hcBackground = tc.hcBackground;
        this.model.themeColors.hcTextColor = tc.hcTextColor;
        this.model.themeColors.hcColors = tc.hcColors;
        const colors = this.widgetSettings?.themeColors[this.key];
        if (colors) {
            this.widgetSettings.themeColors[this.key] = null;
        }
        if (this.onUpdate) {
            this.onUpdate(tc);
        } else {
            this.bs.broadcast('charts:update-colors', tc);
        }
        this.isChanged = false;
    }
}
