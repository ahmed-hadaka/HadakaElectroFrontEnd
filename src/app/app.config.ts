import {
  ApplicationConfig, inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {csrfInterceptor} from './core/interceptors/csrf.interceptor';
import {CsrfService} from './shared/services/CsrfService/csrf-service';
import {authInterceptor} from './core/interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([csrfInterceptor, authInterceptor])),
    provideAppInitializer(()=>{

    })
  ]
};
