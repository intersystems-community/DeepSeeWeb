import {Component, Input, OnInit} from '@angular/core';
import {SidebarService} from '../../../services/sidebar.service';
import {Chart, ColorAxisOptions, PlotSeriesDataLabelsOptions} from 'highcharts';
import {StorageService} from '../../../services/storage.service';
import * as  Highcharts from 'highcharts/highstock';
import {IError} from '../../../services/error.service';

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
export class ChartConfigComponent implements OnInit {
    @Input() chart: Chart;
    @Input() widgetSettings: any;
    @Input() onSave: () => void;
    @Input() onUpdate: (themeColors: IThemeColors) => void;

    private key: string;

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

    constructor(private sbs: SidebarService, private ss: StorageService) {
    }

    ngOnInit() {
        const settings = this.ss.getAppSettings();

        // For widget settings use widget colors
        this.key = settings.theme || '';
        const cols = this.widgetSettings.themeColors[this.key];
        if (cols) {
            this.model.themeColors = cols;
        } else {
            this.widgetSettings.themeColors[this.key] = {};
            this.model.themeColors = this.widgetSettings.themeColors[this.key];
        }

        this.initColors();
    }

    onCancel() {
        this.restoreColors();
        this.sbs.sidebarToggle.next(null);
    }

    onApply() {
        this.onSave();
        this.sbs.sidebarToggle.next(null);
    }

    update() {
        this.onUpdate(this.model.themeColors);
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
        this.widgetSettings.themeColors[this.key] = this.originalColors;
        this.onUpdate(this.originalColors);
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
            hcBorderColor: '', // opt.plotOptions.bar.borderColor as string,
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
        this.onUpdate(tc);
    }
}
