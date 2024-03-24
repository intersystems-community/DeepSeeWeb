import {BaseWidget} from '../base-widget.class';

export interface IMeterWidgetData {
    caption: string;
    state: number;
    value: number;
    min: number;
    max: number;
}

export class WMeterComponent extends BaseWidget {
    data: IMeterWidgetData[] = [];

    protected prepareMeterData(result: any) {
        this.data = [];
        if (!result) {
            return;
        }
        const useProps = !!this.widget?.dataProperties?.length;
        const cols = useProps ? this.widget?.dataProperties : result.Cols[0].tuples;
        for (let i = 0; i < cols.length; i++) {
            let prop;
            if (useProps) {
                prop = cols[i];
            } else {
                prop = this.getDataPropByDataValue(cols[i].dimension);
            }
            // const value = this.getDataValue(i, result, prop);
            let v;
            let caption = '';
            if (useProps) {
                const idx = result.Cols[0].tuples.findIndex(t => t.dimension === prop.dataValue);
                caption = result.Cols[0].tuples[idx].caption;
                v = result.Data[idx];
            } else {
                caption = cols[i].caption;
                v = result.Data[i];
            }
            let state = 1;
            let min = parseFloat(prop.rangeLower.toString());
            let max = parseFloat(prop.rangeUpper.toString());
            if (isNaN(min)) {
                min = 0;
            }
            if (isNaN(max)) {
                max = 100;
            }

            let checkMin = min;
            let checkMax = max;
            if (isNaN(checkMin)) {
                checkMin = 33.33333;
            }
            if (isNaN(checkMax)) {
                checkMax = 66.66666;
            }
            if (v < checkMin) {
                state = 0;
            }
            if (v >= checkMax) {
                state = 2;
            }

            this.data.push({caption, state, value: v, min, max});
        }
    }

    /**
     * Fills widget with data retrieved from server
     * @param {object} result Result of MDX query
     */
    retrieveData(result) {
        this.hideLoading();
        this.prepareMeterData(result);
        this.cd.markForCheck();
        this.cd.detectChanges();
    }
}
