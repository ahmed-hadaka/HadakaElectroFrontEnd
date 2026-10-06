import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environmentDev} from '../../../../environments/environment.dev';
import {AddressDTO} from '../../../shared/Models/AddressDTO';


@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);
  private baseUrl = environmentDev.backendCustomerBaseUrl + '/address-book';

  getAddresses(): Observable<{ addresses: AddressDTO[] }> {
    return this.http.get<{ addresses: AddressDTO[] }>(this.baseUrl);
  }

  getAddress(id: number): Observable<AddressDTO> {
    return this.http.get<AddressDTO>(`${this.baseUrl}/${id}`);
  }

  saveAddress(address: AddressDTO): Observable<string> {
    return this.http.post(`${this.baseUrl}/save`, address, { responseType: 'text' });
  }

  setDefaultAddress(id: number): Observable<string> {
    return this.http.patch(`${this.baseUrl}/set-default/${id}`, {}, { responseType: 'text' });
  }

  deleteAddress(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, { responseType: 'text' });
  }
}
