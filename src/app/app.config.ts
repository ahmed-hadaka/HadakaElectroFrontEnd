import {
  APP_INITIALIZER,
  ApplicationConfig, inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {csrfInterceptor} from './interceptors/csrf.interceptor';
import {CsrfService} from './services/CsrfService/csrf-service';
import {authInterceptor} from './interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([csrfInterceptor, authInterceptor])),
    provideAppInitializer(()=>{
      const csrfService = inject(CsrfService);
      return csrfService.getCsrfToken();
    })
  ]
};
