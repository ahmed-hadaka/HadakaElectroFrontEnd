import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentDev } from '../../../../environments/environment.dev';
import { Page } from '../../../shared/Models/PageModel';
import { OrderDTO, OrderListDTO } from '../../../shared/Models/OrderDTO';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orderApiBaseUrl = environmentDev.backendInternalBaseUrl + '/orders';

  constructor(private http: HttpClient) {}

  listOrders(
    keyword?: string,
    page: number = 0,
    size: number = 10,
    sort: string = 'orderTime',
    direction: string = 'DESC'
  ): Observable<Page<OrderListDTO>> {
    let params = new HttpParams()
      .set('size', size.toString())
      .set('page', page.toString())
      .set('sort', sort)
      .set('direction', direction);

    if (keyword && keyword.trim() !== '') {
      params = params.set('keyword', keyword.trim());
    }

    return this.http.get<Page<OrderListDTO>>(this.orderApiBaseUrl, { params });
  }

  getOrderById(id: number): Observable<OrderDTO> {
    return this.http.get<OrderDTO>(`${this.orderApiBaseUrl}/${id}`);
  }

  deleteOrder(id: number): Observable<string> {
    return this.http.delete(`${this.orderApiBaseUrl}/delete/${id}`, { responseType: 'text' });
  }
}
