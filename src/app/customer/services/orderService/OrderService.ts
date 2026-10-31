import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Page} from '../../../shared/Models/PageModel';
import {
  CustomerOrderDTO,
  CustomerOrderListDTO,
  CustomerOrderReturnReqDTO,
} from '../../../shared/Models/OrderDTO';
import {environmentDev} from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private ordersApiBaseUrl = environmentDev.backendCustomerBaseUrl + '/orders';


  getCustomerOrders(
    page: number = 0,
    size: number = 5,
    keyword: string = '',
    sortField: string = 'orderTime',
    sortDir: 'asc' | 'desc' = 'desc'
  ): Observable<Page<CustomerOrderListDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('keyword', keyword.trim())
      .set('sort', `${sortField},${sortDir}`);

    return this.http.get<Page<CustomerOrderListDTO>>(this.ordersApiBaseUrl, {params});
  }


  getOrderById(orderId: number): Observable<CustomerOrderDTO> {
    return this.http.get<CustomerOrderDTO>(`${this.ordersApiBaseUrl}/${orderId}`);
  }


  requestOrderReturn(returnReq: CustomerOrderReturnReqDTO): Observable<void> {
    return this.http.post<void>(`${this.ordersApiBaseUrl}/return`, returnReq);
  }
}
