import {APP_INITIALIZER, ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient, withFetch, withInterceptors} from "@angular/common/http";
import {provideClientHydration} from "@angular/platform-browser";
import {provideAnimations} from "@angular/platform-browser/animations";
import {StartupService} from "./services/startup.service";

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
    //{provide: APP_SSR_COOKIES, useValue: ''},
    provideHttpClient(withFetch()/*, withInterceptors([httpInterceptor])*/),
    provideClientHydration(),
    provideAnimations(),
    provideRouter(
      routes,
      // withInMemoryScrolling(scrollConfig)
      // withDebugTracing()
      // withPreloading(PreloadAllModules)
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApplication,
      multi: true,
      deps: [StartupService],
    },
  ]
};
