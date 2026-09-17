import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs';

export interface CsrfToken{
  headerName:string;
  parameterName:string;
  token:string;
}

@Service()
export class CsrfService {

  private httpClient = inject(HttpClient);
  private initialLink = 'http://localhost:8080/ElectroInternal/auth/';

  getCsrfToken() {
    return this.httpClient.get<CsrfToken>(this.initialLink).pipe(
      tap((csrf) => {
        // Store token in sessionStorage for application access
        sessionStorage.setItem('csrfToken', csrf.token);
        sessionStorage.setItem('csrfHeader', csrf.headerName);
      })
    );
  }
}
