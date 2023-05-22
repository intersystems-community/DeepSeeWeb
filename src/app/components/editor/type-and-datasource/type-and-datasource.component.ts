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
    @Input() model: IWidgetInfo = null;
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
                private eds: EditorService,
                private ds: DashboardService) {
    }

    ngOnInit() {
        this.widgetList = this.eds.getWidgetsList([this.model?.name]);
        this.type = WIDGET_TYPES[this.model?.type?.toLowerCase()];
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
            minHeight: true,
            outputs: {
                select: (ds: IDataSourceInfo) => {
                    this.model.dataSource = ds.value + '.' + ds.type;
                    this.onDatasourceChanged();
                }
            }
        });
    }

    ngOnDestroy() {
        this.eds.cancelEditing();
    }

    onTypeChange() {
        if (this.model) {
            this.model.type = Object.entries(WIDGET_TYPES).find(el => el[1] === this.type)[0];
        }
        this.eds.updateEditedWidget({widget: this.model, reCreate: true});
    }

    onDatasourceChanged() {
        this.eds.generateWidgetMdx(this.model)
            .then(() => {
                this.eds.updateEditedWidget({widget: this.model, refreshData: true});
            });
    }

    onLinkChange() {
        this.eds.updateEditedWidget({widget: this.model, reCreate: true});
    }

    onSave() {
        this.eds.save(this.model);
    }
}
