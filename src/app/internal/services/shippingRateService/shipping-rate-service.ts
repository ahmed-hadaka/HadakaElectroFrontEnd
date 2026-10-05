import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ShippingRateDTO, ShippingRatePageResponse} from '../../../shared/Models/ShippingRateDTO';
import {environmentDev} from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class ShippingRateService {
  private http = inject(HttpClient);
  private baseUrl = environmentDev.backendInternalBaseUrl + '/shipping-rates';

  listAllShippingRates(keyword: string, page: number, size: number): Observable<ShippingRatePageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword && keyword.trim() !== '') {
      params = params.set('keyword', keyword.trim());
    }

    return this.http.get<ShippingRatePageResponse>(this.baseUrl, { params });
  }

  getShippingRateById(id: number): Observable<ShippingRateDTO> {
    return this.http.get<ShippingRateDTO>(`${this.baseUrl}/${id}`);
  }

  saveShippingRate(shippingRate: ShippingRateDTO): Observable<string> {
    return this.http.post(`${this.baseUrl}/save`, shippingRate, { responseType: 'text' });
  }

  updateCODStatus(id: number): Observable<string> {
    return this.http.patch(`${this.baseUrl}/update-cod-status/${id}`, {}, { responseType: 'text' });
  }

  deleteShippingRate(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, { responseType: 'text' });
  }
}
