import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';
import {environment} from './environments/environment';
import {enableProdMode} from '@angular/core';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));


/*
import {APP_INITIALIZER, enableProdMode, importProvidersFrom} from '@angular/core';


import {environment} from './environments/environment';
import {AppComponent} from './app/app.component';
import {ColorPickerModule} from 'ngx-color-picker';
import {ServiceWorkerModule} from '@angular/service-worker';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {AppRoutingModule} from './app/app-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';
import {bootstrapApplication, BrowserModule} from '@angular/platform-browser';
import {GridsterModule} from 'angular-gridster2';
import {provideAnimations} from '@angular/platform-browser/animations';
import {ConfigResolver} from './app/services/config-resolver';
import {StartupService} from './app/services/startup.service';
import {DataService} from './app/services/data.service';
import {I18nService} from './app/services/i18n.service';
import More from "highcharts/highcharts-more";
import Highcharts from "highcharts/highstock";
import Tree from "highcharts/modules/treemap";
import Heatmap from "highcharts/modules/heatmap";
import SolidGauge from "highcharts/modules/solid-gauge";
import Exporting from "highcharts/modules/exporting";
import Map from "highcharts/modules/map";


More(Highcharts);
Tree(Highcharts);
Heatmap(Highcharts);
SolidGauge(Highcharts);
// Initialize exporting module.
Exporting(Highcharts);
Map(Highcharts);

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(GridsterModule, BrowserModule, NgSelectModule, FormsModule, ReactiveFormsModule, AppRoutingModule, ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}), ColorPickerModule),
        I18nService,
        DataService,
        StartupService,
        ConfigResolver,
        /!*
        {provide: COMPILER_OPTIONS, useValue: {}, multi: true},
        {provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS]},
        {provide: Compiler, useFactory: createCompiler, deps: [CompilerFactory]},*!/
        {
            provide: APP_INITIALIZER,
            useFactory: (start: StartupService) => () => start.initialize(),
            deps: [StartupService],
            multi: true
        },
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi())
    ]
})
    .catch(err => console.error(err));
*/
