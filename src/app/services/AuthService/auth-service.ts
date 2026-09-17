import {inject, Service, signal} from '@angular/core';
import {LoginRequestDTO} from './LoginRequestDTO';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environmentDev} from '../../../environments/environment.dev';

@Service()
export class AuthService {
  private httpClient = inject(HttpClient);

  login(loginReqDTO: LoginRequestDTO){
    const loginUrl = environmentDev.backendInternalBaseUrl+'/auth/login';

    const data =  this.httpClient.post<Record<string,string>>(
      loginUrl,
      loginReqDTO
    );

    return data
  }

  logout(){
    const logoutUrl = environmentDev.backendInternalBaseUrl+'/auth/logout';
    return this.httpClient.post<Record<string,string>>(
      logoutUrl,null);
  }
}
