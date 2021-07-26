import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {IWidgetInfo} from '../../base-widget.class';
import {StorageService} from '../../../../services/storage.service';
import {UtilService} from '../../../../services/util.service';
import {ActivatedRoute} from '@angular/router';
import {IButtonToggle, WidgetService} from '../../../../services/widget.service';
import {NamespaceService} from '../../../../services/namespace.service';
import {dsw} from '../../../../../environments/dsw';
import {IWidgetType} from '../../../../services/widget-type.service';
import {HeaderService} from '../../../../services/header.service';

@Component({
    selector: 'dsw-widget-header',
    templateUrl: './widget-header.component.html',
    styleUrls: ['./widget-header.component.scss']
})
export class WidgetHeaderComponent {
    @Input() typeDesc: IWidgetType;
    @Output() onButtonClick = new EventEmitter<IButtonToggle>();
    @Output() onBack = new EventEmitter();
    @Output() onResetClickFilter = new EventEmitter();

    widget: IWidgetInfo;
    private widgetsSettings: any;

    constructor(private ss: StorageService,
                private us: UtilService,
                private ws: WidgetService,
                public cd: ChangeDetectorRef,
                private ns: NamespaceService,
                private hs: HeaderService,
                private route: ActivatedRoute) {
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
}
