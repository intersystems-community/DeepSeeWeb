import {Component, ElementRef, HostBinding, Input, OnInit, ViewChildren} from '@angular/core';
import {BaseWidget, IWidgetInfo} from '../base-widget.class';
import * as numeral from 'numeral';
import {dsw} from '../../../../environments/dsw';

@Component({
    selector: 'dsw-wtext',
    templateUrl: './wtext.component.html',
    styleUrls: ['./wtext.component.scss']
})
export class WTextComponent extends BaseWidget implements OnInit {
    @ViewChildren('images') images: ElementRef[];
    @Input() widget: IWidgetInfo;

    ngOnInit(): void {
        this.model.textData = [];
        super.ngOnInit();
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
        for (let k = 0; k < this.widget.dataProperties.length - 1; k++) {
            if (this.widget.dataProperties[k].dataValue === str) {
                return this.widget.dataProperties[k];
            }
        }
    }

    adjustSize() {
        this.images.forEach(image => {
            const svg = image.nativeElement;
            const text = svg.firstChild;
            const bbox = text.getBBox();

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
                let propFmt = '';
                if (this.widget && this.widget.properties && this.widget.properties.format) {
                    propFmt = this.widget.properties.format;
                }
                // Format value
                let v = result.Data[i];
                const fmt = result.Cols[0].tuples[i].format || propFmt;
                if (fmt) {
                    v = numeral(v).format(fmt);
                }

                // Change font color, if widget is displayed on tile
                let color = 'var(--cl-text-widget-font)'; // getComputedStyle(document.documentElement).getPropertyValue('--cl-text-widget-font');
                if (this.widget.tile) {
                    color = window.getComputedStyle(
                        document.querySelector('.' + dsw.const.fontColors[this.widget.tile.fontColor])
                    ).getPropertyValue('color');
                }

                let caption = result.Cols[0].tuples[i].caption;
                const prop = this.findDataPropByName(result.Cols[0].tuples[i].dimension);
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
                        const lower = prop.thresholdLower;
                        const upper = prop.thresholdUpper;

                        if (lower !== undefined && lower !== '' && this.widget.properties.lowRangeColor) {
                            if (parseFloat(v) < lower) {
                                valueColor = this.widget.properties.lowRangeColor;
                            }
                        }
                        if (upper !== undefined && upper !== '' && this.widget.properties.highRangeColor) {
                            if (parseFloat(v) > upper) {
                                valueColor = this.widget.properties.highRangeColor;
                            }
                        }
                    }

                    // Add parameter
                    this.model.textData.push({label: caption, value: v, color, valueColor});
                }
            }
        }
        this.cd.detectChanges();
        setTimeout(() => this.adjustSize());
    }
}
