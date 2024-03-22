import {APP_INITIALIZER, ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter, withHashLocation} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient, withFetch} from "@angular/common/http";
import {BrowserModule, provideClientHydration} from "@angular/platform-browser";
import {provideAnimations} from "@angular/platform-browser/animations";
import {StartupService} from "./services/startup.service";
import {GridsterModule} from "angular-gridster2";
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ColorPickerModule} from "ngx-color-picker";
import {I18nService} from "./services/i18n.service";
import {DataService} from "./services/data.service";
import {ConfigResolver} from "./services/config-resolver";

export const initializeApplication = (ss: StartupService) => {
    return async () => {
        await ss.initialize();
    };
};

/*const scrollConfig: InMemoryScrollingOptions = {
  anchorScrolling: 'disabled',
  scrollPositionRestoration: 'disabled'
};*/

export const appConfig: ApplicationConfig = {
    providers: [
        importProvidersFrom(
            GridsterModule,
            BrowserModule,
            NgSelectModule,
            FormsModule,
            ReactiveFormsModule,
            ColorPickerModule
        ),
       /* I18nService,
        DataService,
        StartupService,
        ConfigResolver,*/
        provideHttpClient(withFetch()/*, withInterceptors([httpInterceptor])*/),
        //provideClientHydration(),
        provideAnimations(),
        provideRouter(
            routes,
            withHashLocation()
            // withInMemoryScrolling(scrollConfig)
            // withDebugTracing()
            // withPreloading(PreloadAllModules)
        ),
      /*  {
            provide: APP_INITIALIZER,
            useFactory: initializeApplication,
            multi: true,
            deps: [StartupService],
        },*/
    ]
};
