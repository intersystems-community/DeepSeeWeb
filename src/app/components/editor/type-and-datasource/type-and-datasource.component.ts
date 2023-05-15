import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {animate, style, transition, trigger} from "@angular/animations";
import {IWidgetInfo} from "../../widgets/base-widget.class";
import {ModalService} from "../../../services/modal.service";
import {DataSourceSelectorDialog, IDataSourceInfo} from "../datasource-selector-dialog/datasource-selector-dialog";
import {DashboardService} from "../../../services/dashboard.service";
import {WIDGET_TYPES} from "../../../services/widget-type.service";
import {EditorService, IWidgetListItem} from "../../../services/editor.service";

@Component({
    selector: 'dsw-type-and-ds',
    templateUrl: './type-and-datasource.component.html',
    styleUrls: ['./../editor-styles.scss', './type-and-datasource.component.scss'],
})
export class TypeAndDatasourceComponent implements OnInit, OnDestroy {
    @Input() widget: IWidgetInfo = null;
    widgetList: IWidgetListItem[] = [];
    widgetTypes = [
        WIDGET_TYPES.pivot,
        WIDGET_TYPES.columnchart,
        WIDGET_TYPES.columnchartstacked,
        WIDGET_TYPES.columnchart3d,
        WIDGET_TYPES.barchart,
        WIDGET_TYPES.barchartstacked,
        WIDGET_TYPES.linechart,
        WIDGET_TYPES.linechartmarkers,
        WIDGET_TYPES.combochart,
        WIDGET_TYPES.hilowchart,
        WIDGET_TYPES.areachart,
        WIDGET_TYPES.bubblechart,
        WIDGET_TYPES.xychart,
        WIDGET_TYPES.piechart,
        WIDGET_TYPES.piechart3d,
        WIDGET_TYPES.donutchart,
        WIDGET_TYPES.donutchart3d,
        WIDGET_TYPES.treemapchart,
        WIDGET_TYPES.bullseyechart,
        WIDGET_TYPES.timechart,
        WIDGET_TYPES.regular,
        WIDGET_TYPES.textmeter,
        WIDGET_TYPES.map,
    ];
    type: any;

    constructor(private ms: ModalService,
                private es: EditorService,
                private ds: DashboardService) {
        this.widgetList = this.es.getWidgetsList([this.widget?.name])
    }

    ngOnInit() {
        this.type = WIDGET_TYPES[this.widget?.type];
    }

    onSelectDataSource() {
        this.ms.show({
            title: 'Choose data source',
            component: DataSourceSelectorDialog,
            buttons: [{
                label: 'Cancel',
                autoClose: true
            }],
            closeByEsc: true,
            search: '',
            outputs: {
                select: (ds: IDataSourceInfo) => {
                    this.widget.dataSource = ds.value;
                }
            }
        });
    }

    ngOnDestroy() {
    }

    onTypeChange() {
        if (this.widget) {
            this.widget.type = Object.entries(WIDGET_TYPES).find(el => el[1] === this.type)[0];
        }
    }
}
