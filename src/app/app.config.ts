import {APP_INITIALIZER, ApplicationConfig, importProvidersFrom} from '@angular/core';
import {PreloadAllModules, provideRouter, withHashLocation, withPreloading} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient, withFetch} from "@angular/common/http";
import {BrowserModule} from "@angular/platform-browser";
import {provideAnimations} from "@angular/platform-browser/animations";
import {StartupService} from "./services/startup.service";
import {GridsterModule} from "angular-gridster2";
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {environment} from '../environments/environment';

export const initializeApplication = (ss: StartupService) => {
  return async () => {
    await ss.initialize();
  };
};


export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      GridsterModule,
      BrowserModule,
      NgSelectModule,
      FormsModule,
      ReactiveFormsModule
    ),
    provideHttpClient(withFetch()/*, withInterceptors([httpInterceptor])*/),
    provideAnimations(),
    environment.production ?
      provideRouter(
        routes,
        withHashLocation(),
      ) :
      provideRouter(
        routes,
        withHashLocation(),
        // For dev mode load all modules to be able open sources by filename in devtoio
        withPreloading(PreloadAllModules)
        // withInMemoryScrolling(scrollConfig)
        // withDebugTracing()
      ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApplication,
      multi: true,
      deps: [StartupService]
    }
  ]
};
