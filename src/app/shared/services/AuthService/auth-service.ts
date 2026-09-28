import { Injectable, inject } from '@angular/core';
import {LoginRequestDTO} from '../../Models/LoginRequestDTO';
import {HttpClient} from '@angular/common/http';
import {environmentDev} from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private httpClient = inject(HttpClient);

  login(loginReqDTO: LoginRequestDTO, loginUrl:string){

    const data =  this.httpClient.post<Record<string,any>>(
      loginUrl,
      loginReqDTO,
    );

    return data
  }

  logout(logoutUrl:string){
    return this.httpClient.post<Record<string,string>>(
      logoutUrl,
      null,
    );
  }

  googleLogin(idToken: string) {
    const googleLoginUrl = environmentDev.backendCustomerBaseUrl+'/auth/google-login';

    return this.httpClient.post<Record<string, string>>(
      googleLoginUrl,
      { idToken: idToken },
    );
  }

}
