import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environmentDev} from '../../../../environments/environment.dev';
import {CheckoutDataDTO} from '../../../shared/Models/CheckoutDTO';


@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private http = inject(HttpClient);
  private baseUrl = environmentDev.backendCustomerBaseUrl + '/checkout';

  getCheckoutInfo(): Observable<CheckoutDataDTO> {
    return this.http.get<CheckoutDataDTO>(this.baseUrl);
  }

  placeOrder() {
    return this.http.post<any>(`${this.baseUrl}/place-order`,{});
  }
}
