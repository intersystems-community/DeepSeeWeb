import {ChangeDetectorRef, Component, forwardRef, Input, OnDestroy, OnInit} from '@angular/core';
import {SidebarService} from '../../../services/sidebar.service';
import {Chart} from 'highcharts';
import {StorageService} from '../../../services/storage.service';
import Highcharts from 'highcharts/highstock';
import {IError} from '../../../services/error.service';
import {BroadcastService} from '../../../services/broadcast.service';
import {I18nPipe} from '../../../services/i18n.service';
import {SidebarActionsComponent} from '../sidebar-actions/sidebar-actions.component';
import {IChartColorsConfig} from '../../../services/dsw.types';
import {ChromePickerComponent, CompactPickerComponent} from '@iplab/ngx-color-picker';
import {ColorPickerComponent} from '../color-picker/color-picker.component';

export interface IChartConfigAppearance {
  showSeries?: boolean[];
  showBackground?: boolean;
  showLines?: boolean;
  showText?: boolean;
  showBorder?: boolean;
}

@Component({
  selector: 'dsw-chart-config',
  templateUrl: './chart-colors-config.component.html',
  styleUrls: ['./../../editor/editor-styles.scss', './chart-colors-config.component.scss'],
  standalone: true,
  imports: [SidebarActionsComponent, I18nPipe, SidebarActionsComponent, ChromePickerComponent, CompactPickerComponent, ColorPickerComponent]
})
export class ChartColorsConfigComponent implements OnInit, OnDestroy {
  @Input() chart!: Chart;
  @Input() widgetSettings!: any;
  @Input() onSave?: () => void;
  @Input() appearance?: IChartConfigAppearance;
  @Input() onUpdate?: (themeColors: IChartColorsConfig) => void;
  model = {
    themeColors: {
      hcColors: [],
      hcTextColor: '',
      hcBackground: '',
      hcLineColor: '',
      hcBorderColor: ''
    } as IChartColorsConfig
  };
  private key = '';
  private isApplied = false;
  private isChanged = false;
  // Store original colors to be able to make cancel
  private originalColors!: IChartColorsConfig;
  private globalOriginalColors: any;

  constructor(private sbs: SidebarService,
              private ss: StorageService,
              private cd: ChangeDetectorRef,
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
      if (settings?.themeColors?.[this.key]) {
        this.globalOriginalColors = JSON.parse(JSON.stringify(settings.themeColors[this.key]));
      }
      if (!settings?.themeColors?.[this.key]) {
        if (!settings.themeColors) {
          settings.themeColors = {};
        }
        settings.themeColors[this.key] = this.model.themeColors;
      } else {
        const tc = settings.themeColors[this.key];
        if (tc) {
          this.model.themeColors = tc;
        }
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
    this.sbs.hide();
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
      if (settings.themeColors) {
        settings.themeColors[this.key] = this.model.themeColors;
      }
      this.ss.setAppSettings(settings);
    }
    this.sbs.hide();
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
    return idx as number;
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

  /**
   * Restores original colors. Used by cancel button
   */
  private restoreColors() {
    if (this.widgetSettings) {
      this.widgetSettings.themeColors[this.key] = this.originalColors;
    } else {
      const settings = this.ss.getAppSettings();
      if (settings.themeColors) {
        settings.themeColors[this.key] = this.globalOriginalColors;
      }
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
  private getDefaultColors(): IChartColorsConfig {
    const opt = Highcharts.getOptions();
    return {
      hcColors: opt.colors?.slice() as any || '',
      hcBackground: opt.chart?.backgroundColor as string || '',
      hcTextColor: (opt as any).labels?.style?.color || '',
      hcBorderColor: '', // opt.plotOptions.bar.borderColor as string,
      hcLineColor: '#e6e6e6' // ((this.chart as any).colorAxis as ColorAxisOptions).minorGridLineColor as string
    };
  }
}
