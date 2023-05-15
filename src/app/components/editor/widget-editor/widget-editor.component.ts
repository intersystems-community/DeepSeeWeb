import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {IWidgetInfo} from "../../widgets/base-widget.class";
import {MenuService} from "../../../services/menu.service";
import {SidebarService} from "../../../services/sidebar.service";
import {DashboardService} from "../../../services/dashboard.service";
import {dsw} from "../../../../environments/dsw";
import {TypeAndDatasourceComponent} from "../type-and-datasource/type-and-datasource.component";
import {IDataSourceInfo} from "../datasource-selector-dialog/datasource-selector-dialog";
import {EditorService} from "../../../services/editor.service";

@Component({
    selector: 'dsw-widget-editor',
    templateUrl: './widget-editor.component.html',
    styleUrls: ['./../editor-styles.scss', './widget-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetEditorComponent implements OnInit, OnDestroy {
    @Input() widget: IWidgetInfo = null;
    model: Partial<IWidgetInfo> = {
        name: '',
        title: '',
        dataSource: '',
        type: 'pivot',
        referenceTo: ''
       /* dependents: [],
        controls: [],
        mdx: '',

        x: 0,
        y: 0,
        rows: 3,
        cols: 2*/
    };

    constructor(private ms: MenuService,
                private ds: DashboardService,
                private eds: EditorService,
                private sbs: SidebarService) {
    }

    ngOnInit() {
        if (!this.widget) {
            this.initializeNewWidget();
        }
    }

    ngOnDestroy() {
    }

    onCancelEditing() {
        // this.restoreOriginalTiles();
        this.close();
    }

    /**
     * Close sidebar and stop editing
     */
    private close() {
        this.ms.onEditDashboard.emit(false);
        this.sbs.showComponent(null);
    }

    onSave() {

    }

    private initializeNewWidget() {
        const count = this.ds.getWidgets().filter(w => w.type !== dsw.const.emptyWidgetClass).length + 1;
        this.model.name = `Widget ${count}`;
        this.eds.onNewWidget.emit(this.model);
        // this.ds.setWidgets([...this.ds.getWidgets(), this.model as IWidgetInfo]);
    }

    onTypeAndDataSourceClick() {
        this.sbs.showComponent({
            component: TypeAndDatasourceComponent,
            inputs: {
                widget: this.model,
                select: (d: IDataSourceInfo) => {

                }
            }
        });
    }
}
