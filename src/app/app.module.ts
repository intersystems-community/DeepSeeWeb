import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginScreenComponent} from './components/screens/login-screen/login-screen.component';
import {I18nPipe, I18nService} from './services/i18n.service';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FocusNextDirective} from './directives/focus-next.directive';
import {AutoFocusDirective} from './directives/auto-focus.directive';
import {DataService} from './services/data.service';
import {StartupService} from './services/startup.service';
import {FolderScreenComponent} from './components/screens/folder-screen/folder-screen.component';
import {ConfigResolver} from './services/config-resolver';
import {GridsterModule} from 'angular-gridster2';
import {HeaderComponent} from './components/ui/header/header.component';
import {SidebarComponent} from './components/ui/sidebar/sidebar.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MenuComponent} from './components/ui/menu/menu.component';
import {HomeEditorComponent} from './components/ui/home-editor/home-editor.component';
import {SidebarActionsComponent} from './components/ui/sidebar-actions/sidebar-actions.component';
import {DashboardScreenComponent} from './components/screens/dashboard-screen/dashboard-screen.component';
import {ErrorComponent} from './components/ui/error/error.component';
import {WidgetComponent} from './components/widgets/base/widget/widget.component';
import {WTextComponent} from './components/widgets/text/wtext.component';
import {WPivotComponent} from './components/widgets/wpivot/pivot.component';
import {MapWidgetComponent} from './components/widgets/map-widget/map-widget.component';
import {ColumnChartComponent} from './components/widgets/charts/column-chart.component';
import {MainScreenComponent} from './components/screens/main-screen/main-screen.component';
import {WidgetHeaderComponent} from './components/widgets/base/widget-header/widget-header.component';
import {WidgetFilterComponent} from './components/widgets/base/widget-filter/widget-filter.component';
import {FilterPopupComponent} from './components/ui/filter-popup/filter-popup.component';
import {ModalComponent} from './components/ui/modal/modal.component';
import {EmptyWidgetComponent} from './components/widgets/empty-widget.component';
import {TreeMapComponent} from './components/widgets/charts/tree-map.component';
import {HtmlViewerComponent} from './components/widgets/html-viewer.component';
import {WorldMapComponent} from './components/widgets/world-map.component';
import {BubbleChartComponent} from './components/widgets/charts/bubble-chart.component';
import {NamespaceSelectorComponent} from './components/ui/namespace-selector/namespace-selector.component';
import {LanguageSelectorComponent} from './components/ui/language-selector/language-selector.component';
import {TextAreaComponent} from './components/ui/text-area/text-area.component';
import {LineChartComponent} from './components/widgets/charts/line-chart.component';
import {HiLowChartComponent} from './components/widgets/charts/hi-low-chart.component';
import {SpeedometerChartComponent} from './components/widgets/charts/speedometer-chart.component';
import {FuelGaugeChartComponent} from './components/widgets/charts/fuel-gauge-chart.component';
import {AreaChartComponent} from './components/widgets/charts/area-chart.component';
import {BullseyeChartComponent} from './components/widgets/charts/bullseye-chart.component';
import {PieChartComponent} from './components/widgets/charts/pie-chart.component';
import {XyChartComponent} from './components/widgets/charts/xy-chart.component';
import {TimeChartComponent} from './components/widgets/charts/time-chart.component';
import {AboutComponent} from './components/ui/about/about.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {ChartConfigComponent} from './components/ui/chart-config/chart-config.component';
import {ColorPickerModule} from 'ngx-color-picker';
import { AppSettingsComponent } from './components/ui/app-settings/app-settings.component';

@NgModule({
    declarations: [
        AppComponent,
        I18nPipe,
        LoginScreenComponent,
        FocusNextDirective,
        AutoFocusDirective,
        FolderScreenComponent,
        HeaderComponent,
        SidebarComponent,
        MenuComponent,
        HomeEditorComponent,
        SidebarActionsComponent,
        DashboardScreenComponent,
        ErrorComponent,
        WidgetComponent,
        WTextComponent,
        WPivotComponent,
        MapWidgetComponent,
        ColumnChartComponent,
        MainScreenComponent,
        WidgetHeaderComponent,
        WidgetFilterComponent,
        FilterPopupComponent,
        ModalComponent,
        EmptyWidgetComponent,
        TreeMapComponent,
        HtmlViewerComponent,
        WorldMapComponent,
        BubbleChartComponent,
        NamespaceSelectorComponent,
        LanguageSelectorComponent,
        TextAreaComponent,
        LineChartComponent,
        HiLowChartComponent,
        SpeedometerChartComponent,
        FuelGaugeChartComponent,
        AreaChartComponent,
        BullseyeChartComponent,
        PieChartComponent,
        XyChartComponent,
        TimeChartComponent,
        AboutComponent,
        ChartConfigComponent,
        AppSettingsComponent
    ],
    imports: [
        BrowserAnimationsModule,
        GridsterModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        HttpClientModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        ColorPickerModule
    ],
    providers: [
        I18nService,
        DataService,
        StartupService,
        ConfigResolver,
        {
            provide: APP_INITIALIZER,
            useFactory: (start: StartupService) => () => start.initialize(),
            deps: [StartupService],
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
