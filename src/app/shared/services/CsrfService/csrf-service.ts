import { Injectable, inject } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs';
import {environmentDev} from '../../../../environments/environment.dev';

export interface CsrfToken{
  headerName:string;
  parameterName:string;
  token:string;
}

@Injectable({
  providedIn: 'root'
})
export class CsrfService {

  private httpClient = inject(HttpClient);
  private internalUrl = environmentDev.backendInternalBaseUrl+'/auth/';
  private customerUrl = environmentDev.backendCustomerBaseUrl+'/auth/';

  getCsrfToken(domain:string) {
    const csrfToken = sessionStorage.getItem('csrfToken');
    const csrfDomain = sessionStorage.getItem('csrfDomain');
    if(csrfToken !== null && csrfDomain === domain)
      return;

    let link:string = '';
    if(domain === 'INTERNAL'){
      link = this.internalUrl;
    }else
      link = this.customerUrl;

    return this.httpClient.get<CsrfToken>(link).pipe(
       tap((csrf) => {
        // Store token in sessionStorage for application access
        sessionStorage.setItem('csrfToken', csrf.token);
        sessionStorage.setItem('csrfHeader', csrf.headerName);
        sessionStorage.setItem('csrfDomain', domain);
      })
    );
  }
}
