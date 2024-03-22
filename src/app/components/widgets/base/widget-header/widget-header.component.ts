import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {StorageService} from '../../../../services/storage.service';
import {UtilService} from '../../../../services/util.service';
import {ActivatedRoute} from '@angular/router';
import {IButtonToggle, WidgetService} from '../../../../services/widget.service';
import {NamespaceService} from '../../../../services/namespace.service';
import {dsw} from '../../../../../environments/dsw';
import {IWidgetType} from '../../../../services/widget-type.service';
import {HeaderService} from '../../../../services/header.service';
import {FilterService} from "../../../../services/filter.service";
import {Subscription} from "rxjs";
import {EditorService} from "../../../../services/editor.service";
import { I18nPipe } from '../../../../services/i18n.service';
import { TooltipDirective } from '../../../../directives/tooltip.directive';
import {IWidgetInfo} from "../../../../services/dsw.types";


@Component({
    selector: 'dsw-widget-header',
    templateUrl: './widget-header.component.html',
    styleUrls: ['./widget-header.component.scss'],
    standalone: true,
    imports: [TooltipDirective, I18nPipe]
})
export class WidgetHeaderComponent implements OnInit, OnDestroy {
    @Input() typeDesc?: IWidgetType;
    @Output() onButtonClick = new EventEmitter<IButtonToggle>();
    @Output() onBack = new EventEmitter();
    @Output() onResetClickFilter = new EventEmitter();

    widget!: IWidgetInfo;
    private widgetsSettings: any;
    hasFilters = false;
    filtersTooltip = '';
    private subFiltersChanged?: Subscription;
    noDrag = false;

    constructor(private ss: StorageService,
                private us: UtilService,
                private ws: WidgetService,
                public cd: ChangeDetectorRef,
                private ns: NamespaceService,
                private fs: FilterService,
                private hs: HeaderService,
                private eds: EditorService,
                private route: ActivatedRoute) {
        this.noDrag = this.route.snapshot.queryParamMap.get('nodrag') === '1';
    }

    ngOnInit() {
        this.subFiltersChanged = this.fs.onFiltersChanged.subscribe(() => {
            this.updateActiveFiltersInfo();
            this.cd.detectChanges();
        });
        this.updateActiveFiltersInfo();
    }

    updateActiveFiltersInfo() {
        if (!this.widget) {
            return;
        }
        if (this.widget.type === dsw.const.emptyWidgetClass) {
            return;
        }
        const active = this.fs.getWidgetFilters(this.widget?.name).filter(f => f.value !== '' || f.isInterval);
        this.hasFilters = !!active.length;
        this.filtersTooltip = active.map(f => f.label + ': <span style="opacity: 0.7">' + f.valueDisplay + '</span>').join('\n');
    }

    /**
     * Loads default buttons state. Called after dynamic widget component created
     */
    loadButtons() {
        this.widgetsSettings = this.ss.getWidgetsSettings(this.widget.dashboard) || {};
        this.loadToolbarButton(this.widgetsSettings, 'isLegend');
        this.loadToolbarButton(this.widgetsSettings, 'isTop');
        this.loadToolbarButton(this.widgetsSettings, 'showZero');
        this.loadToolbarButton(this.widgetsSettings, 'showValues');

        const btns = this.typeDesc?.headerButtons;
        if (btns) {
            for (let i = 0; i < btns.length; i++) {
                this.loadToolbarButton(this.widgetsSettings, btns[i].id, btns[i].defValue);
            }
        }
    }

    /**
     * Header button click event handler
     */
    onClick(button: string) {
        (this.widget[button] as any) = !this.widget[button];
        const widgetsSettings = this.ss.getWidgetsSettings(this.widget.dashboard);
        if (!widgetsSettings[this.widget.name]) { widgetsSettings[this.widget.name] = {}; }
        widgetsSettings[this.widget.name][button] = this.widget[button];
        this.ss.setWidgetsSettings(widgetsSettings, this.widget.dashboard);

        this.onButtonClick.emit({widget: this.widget, name: button, state: this.widget[button]});
    }

    /**
     * Loads state for button
     */
    loadToolbarButton(settings: any, name: string, defValue?: boolean) {
        // For embedded widgets firstly try to settings param from URL
        if (this.us.isEmbedded()) {
            const param = this.route.snapshot.queryParamMap.get(name);
            if (param) {
                let v = false;
                if (param.toLowerCase() === 'true') {
                    v = true;
                } else if (param.toLowerCase() === 'false') {
                    v = false;
                }
                this.widget[name] = v;
                return;
            }
        }
        if (settings[this.widget.name]) {
            if (settings[this.widget.name][name] !== undefined) {
                this.widget[name] = this.widgetsSettings[this.widget.name][name];
            } else {
                if (defValue !== undefined) {
                    this.widget[name] = defValue;
                }
            }
        }
    }

    /**
     * Back button click event handler
     */
    onBackClick() {
        this.onBack.emit();
    }

    /**
     * Reset click filter button click event handler
     */
    onResetClickFilterHandler() {
        this.onResetClickFilter.emit();
    }

    isEmptyWidget(): boolean {
        if (!this.widget) {
            return false;
        }
        const t = this.widget.type;
        return t === dsw.const.emptyWidgetClass || t === 'horizontalControls' || t === 'verticalControls';
    }

    closeMobileFilter() {
        this.hs.toggleMobileFilterDialog();
    }

    ngOnDestroy() {
        this.subFiltersChanged?.unsubscribe();
    }

    onHeaderDoubleClick() {
        if (this.isEmptyWidget() || !this.widget.isSupported) {
            return;
        }
        this.onClick('expand');
    }

    deleteWidgetClick() {
        this.eds.deleteWidget(this.widget);
    }
}
