import {AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit, ViewChildren} from '@angular/core';
import {BaseWidget, IWidgetDataProperties, IWidgetInfo} from '../base-widget.class';
import * as numeral from 'numeral';
import {dsw} from '../../../../environments/dsw';
import { NgFor } from '@angular/common';

interface ITextWidgetData {
    label: string;
    value: string;
    color: string;
    valueColor: string;
    dimension: string;
}

@Component({
    selector: 'dsw-wtext',
    templateUrl: './wtext.component.html',
    styleUrls: ['./wtext.component.scss'],
    standalone: true,
    imports: [NgFor]
})
export class WTextComponent extends BaseWidget implements OnInit, AfterViewInit {
    @ViewChildren('images') images: ElementRef[] = [];
    @Input() widget: IWidgetInfo = {} as IWidgetInfo;

    @HostBinding('style.flex-direction')
    get flexDirection() {
        const el = this.el?.nativeElement;
        if (!el) {
            return;
        }
        return el.offsetWidth > el.offsetHeight ? 'row' : 'column';
    }

    get canDrillthrough() {
        return this.canDoDrillthrough;
    }

    ngOnInit(): void {
        // this.parseOverridesForDataProperties();
        this.model.textData = [];
        super.ngOnInit();
    }

    ngAfterViewInit() {
        // this.adjustSize();
    }

    /**
     * Finds data property by name
     * @param {string} str Name
     * @returns {undefined|object} Data property
     */
    findDataPropByName(str: string) {
        if (!this.widget.dataProperties) {
            return;
        }
        for (let k = 0; k < this.widget.dataProperties.length; k++) {
            if (this.widget.dataProperties[k].dataValue === str) {
                return this.widget.dataProperties[k];
            }
        }
        return;
    }

    adjustSize() {
        this.images.forEach(image => {
            const svg = image.nativeElement;
           /* svg.style.position = 'fixed';
            svg.style.left = '0px';
            svg.style.top = '0px';*/

            const text = svg.firstChild;
            const bbox = text.getBBox();
            // const bbox = text.getClientRects()[0];

          /*  delete svg.style.position;
            delete svg.style.left;
            delete svg.style.top;
*/
            svg.setAttribute('viewBox', [bbox.x, bbox.y, bbox.width, bbox.height].join(' '));
        });
    }

    /**
     * Fills widget with data retrieved from server
     * @param {object} result Result of MDX query
     */
    retrieveData(result) {
        this.model.textData = [];
        this.hideLoading();
        if (result) {
            for (let i = 0; i < result.Cols[0].tuples.length; i++) {
                let dProp: IWidgetDataProperties|null = null;
                if (this.widget.dataProperties) {
                    dProp = this.getDataPropByDataValue(result.Cols[0].tuples[i].dimension) ?? null;
                }
                if (!dProp) {
                    continue;
                }
                // Format value
                const v = this.getDataValue(i, result, dProp);
                /*let v = result.Data[i];
                const fmt = this.getFormat(result, dProp);
                if (fmt) {
                    v = numeral(v).format(fmt);
                }*/

                // Change font color, if widget is displayed on tile
                let color = 'var(--cl-text-widget-font)'; // getComputedStyle(document.documentElement).getPropertyValue('--cl-text-widget-font');
                if (this.widget.tile) {
                    const el = document.querySelector('.' + dsw.const.fontColors[this.widget.tile.fontColor]);
                    if (el) {
                        color = window.getComputedStyle(el).getPropertyValue('color');
                    }
                }

                let caption = result.Cols[0].tuples[i].caption;
                const prop = this.findDataPropByName(result.Cols[0].tuples[i]?.caption);
                if (prop) {
                    if (prop.label === '$auto') {
                        caption = prop.dataValue || caption;
                    } else {
                        caption = prop.label || caption;
                    }
                }

                if (caption.substr(0, 5).toLowerCase() === 'delta') {
                    const idx = parseInt(caption.substring(5, caption.length), 10) - 1;
                    if (!isNaN(idx) && this.model.textData[idx] && v.toString() !== '0') {
                        if (v.toString()[0] !== '-') {
                            this.model.textData[idx].delta = '+' + v.toString();
                        } else {
                            this.model.textData[idx].deltaNeg = v.toString();
                        }
                    }
                } else {
                    let valueColor = color;
                    if (prop) {
                        const lower = parseFloat(prop.thresholdLower.toString());
                        const upper = parseFloat(prop.thresholdUpper.toString());
                        const o = prop.override;

                        if (o.normalStyle) {
                            const css = this.getCss(o.normalStyle);
                            if (css.fill) {
                                valueColor = css.fill;
                            };
                        }
                        if ((lower !== undefined) && (!isNaN(lower)) && (this.getNumber(v) < lower)) {
                            let col = this.widget.properties?.lowRangeColor;

                            if (o.lowStyle) {
                                const css = this.getCss(o.lowStyle);
                                col = css.fill;
                            }

                            if (col) {
                                valueColor = col;
                            }
                        }
                        if ((upper !== undefined) && (!isNaN(upper)) && (this.getNumber(v) > upper)) {
                            let col = this.widget.properties?.highRangeColor;

                            if (o.highStyle) {
                                const css = this.getCss(o.highStyle);
                                col = css.fill;
                            }

                            if (col) {
                                valueColor = col;
                            }
                        }
                    }

                    // Add parameter
                    this.model.textData.push({
                        label: caption,
                        value: v,
                        color,
                        valueColor,
                        dimension: result.Cols[0].tuples[i].dimension
                    } as unknown as ITextWidgetData);
                }
            }
        }
        this.cd.detectChanges();
        setTimeout(() => this.adjustSize());
    }

    private getCss(css: string): any {
        const res = {};
        css.split(';')
            .filter(s => s)
            .forEach(a => {
                const parts = a.split(':');
                res[parts[0]] = parts[1];
            });
        return res;
    }

    private getNumber(v: string|number): number {
        if (typeof v === 'string') {
            return parseFloat(v.replace(/,/g, '').replace(/ /g, ''));
        }
        return v;
    }

    onClick(item: ITextWidgetData) {
        void this.doDrillthrough('', item.label);
    }
}
