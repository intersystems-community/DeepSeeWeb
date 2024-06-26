import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {ModalService} from "../../../services/modal.service";
import {IDataSourceInfo} from "../datasource-selector-dialog/datasource-selector-dialog";
import {DashboardService} from "../../../services/dashboard.service";
import {WIDGET_TYPES} from "../../../services/widget-type.service";
import {EditorService, IWidgetListItem} from "../../../services/editor.service";
import {InputComponent} from "../../ui/input/input/input.component";
import {FormsModule} from "@angular/forms";
import {NgSelectModule} from "@ng-select/ng-select";

import {SidebarActionsComponent} from "../../ui/sidebar-actions/sidebar-actions.component";
import {IWidgetDesc} from "../../../services/dsw.types";

@Component({
  selector: 'dsw-type-and-ds',
  templateUrl: './type-and-datasource.component.html',
  styleUrls: ['./../editor-styles.scss', './type-and-datasource.component.scss'],
  standalone: true,
  imports: [
    SidebarActionsComponent,
    NgSelectModule,
    FormsModule,
    InputComponent
  ],
})
export class TypeAndDatasourceComponent implements OnInit, OnDestroy {
  @Input() model?: IWidgetDesc;
  @Input() invalid: string[] = [];
  widgetList: IWidgetListItem[] = [];
  widgetTypes = [
    WIDGET_TYPES.pivot,
    WIDGET_TYPES.columnChart,
    WIDGET_TYPES.columnChartStacked,
    WIDGET_TYPES.columnChart3D,
    WIDGET_TYPES.barChart,
    WIDGET_TYPES.barChartStacked,
    WIDGET_TYPES.lineChart,
    WIDGET_TYPES.lineChartMarkers,
    WIDGET_TYPES.comboChart,
    WIDGET_TYPES.hilowChart,
    WIDGET_TYPES.areaChart,
    WIDGET_TYPES.bubbleChart,
    WIDGET_TYPES.xyChart,
    WIDGET_TYPES.pieChart,
    WIDGET_TYPES.pieChart3D,
    WIDGET_TYPES.donutChart,
    WIDGET_TYPES.donutChart3D,
    WIDGET_TYPES.treeMapChart,
    WIDGET_TYPES.bullseyeChart,
    WIDGET_TYPES.timeChart,
    WIDGET_TYPES.regular,
    WIDGET_TYPES.textMeter,
    WIDGET_TYPES.map,
  ];
  type: any;

  constructor(private ms: ModalService,
              private eds: EditorService,
              private ds: DashboardService) {
  }

  ngOnInit() {
    this.widgetList = this.eds.getWidgetsList([this.model?.name ?? '']);
    this.type = WIDGET_TYPES[this.model?.type?.toLowerCase() ?? ''];
  }

  onSelectDataSource() {
    void this.ms.show({
      title: 'Choose data source',
      component: import('./../datasource-selector-dialog/datasource-selector-dialog'),
      buttons: [{
        label: 'Cancel',
        autoClose: true
      }],
      closeByEsc: true,
      search: '',
      minHeight: true,
      outputs: {
        select: (ds: IDataSourceInfo) => {
          if (this.model) {
            this.model.dataSource = ds.value + '.' + ds.type;
          }
          this.onDatasourceChanged();
        }
      }
    });
  }

  ngOnDestroy() {
    this.eds.cancelEditing();
  }

  onTypeChange() {
    if (!this.model) {
      return;
    }
    this.model.type = Object.entries(WIDGET_TYPES).find(el => el[1] === this.type)?.[0] || '';
    this.eds.updateEditedWidget({widget: this.model, reCreate: true});
  }

  onDatasourceChanged() {
    if (!this.model) {
      return;
    }
    this.eds.generateWidgetMdx(this.model)
      .then(() => {
        if (!this.model) {
          return;
        }
        this.eds.updateEditedWidget({widget: this.model, refreshData: true});
      });
  }

  onLinkChange() {
    if (!this.model) {
      return;
    }
    this.eds.updateEditedWidget({widget: this.model, reCreate: true});
  }

  onSave() {
    if (!this.model) {
      return;
    }
    this.eds.save(this.model);
  }
}
