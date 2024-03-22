import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {MenuService} from "../../../services/menu.service";
import {SidebarService} from "../../../services/sidebar.service";
import {DashboardService} from "../../../services/dashboard.service";
import {dsw} from "../../../../environments/dsw";
import {EditorService} from "../../../services/editor.service";
import {ModalService} from "../../../services/modal.service";

import {FormsModule} from "@angular/forms";
import {InputComponent} from "../../ui/input/input/input.component";
import {SidebarActionsComponent} from "../../ui/sidebar-actions/sidebar-actions.component";
import {IWidgetInfo} from "../../../services/dsw.types";

@Component({
  selector: 'dsw-widget-editor',
  templateUrl: './widget-editor.component.html',
  styleUrls: ['./../editor-styles.scss', './widget-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SidebarActionsComponent, InputComponent, FormsModule]
})
export class WidgetEditorComponent implements OnInit, OnDestroy {
  @Input() widget?: IWidgetInfo;
  @Input() invalid: string[] = [];
  model: Partial<IWidgetInfo> = {
    edKey: 'ed' + new Date().getTime(),

    dashboard: this.dbs.current.value,
    name: '',
    title: '',
    dataSource: '',
    type: 'pivot',
    dataLink: '',

    // Needed to display widget correctly
    dataProperties: [],
    dependents: [],
    controls: [],
    mdx: '',

    // Gridster
    x: 0,
    y: 0,
    rows: 4,
    cols: 4
  };

  constructor(private ms: MenuService,
              private dbs: DashboardService,
              private eds: EditorService,
              private mds: ModalService,
              private sbs: SidebarService) {
  }

  ngOnInit() {
    this.eds.resetSavedState();

    if (!this.widget) {
      this.initializeNewWidget();
    } else {
      this.model = this.widget;
      this.widget.oldWidget = JSON.parse(JSON.stringify(this.widget));
      this.eds.updateEditedWidget({widget: this.model});
      this.eds.resetSavedState();
    }
  }

  ngOnDestroy() {
    this.eds.cancelEditing();
  }

  onCancelEditing() {

    /*if (this.eds.onUnsavedChanged.value) {
        this.mds.show({
            message: 'You have unsaved changes. Cancel editing?',
            buttons: [
                { label: 'Yes', autoClose: true, click: () => {
                        this.close();
                }},
                {label: 'No', autoClose: true}
            ]
        });
    } else {*/
    this.close();
    //}

  }

  onSave() {
    this.eds.save(this.model);
  }

  onTypeAndDataSourceClick() {
    this.eds.navigateDataSourceAndType(this.model);
  }

  updateWidget() {
    this.eds.updateEditedWidget({widget: this.model});
  }

  deleteWidgetClick() {
    this.eds.deleteWidget(this.model as IWidgetInfo);
  }

  /**
   * Close sidebar and stop editing
   */
  private close() {
    this.sbs.hide();
  }

  private initializeNewWidget() {
    const count = this.dbs.getWidgets().filter(w => w.type !== dsw.const.emptyWidgetClass).length + 1;
    this.model.name = `Widget${count}`;
    this.eds.onNewWidget.emit(this.model);
  }
}
