import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentDev } from '../../../../environments/environment.dev';
import { CustomerDTO } from '../../../shared/Models/CustomerDTO';
import { Page } from '../../../shared/Models/PageModel';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customerApiBaseUrl = environmentDev.backendInternalBaseUrl + '/customers';

  constructor(private http: HttpClient) {}

  listCustomers(
    keyword?: string,
    page: number = 0,
    size: number = 20,
    sort: string = 'firstName',
    direction: string = 'ASC'
  ): Observable<Page<CustomerDTO>> {
    let params = new HttpParams()
      .set('size', size.toString())
      .set('page', page.toString())
      .set('sort', sort)
      .set('direction', direction);

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<Page<CustomerDTO>>(this.customerApiBaseUrl, { params });
  }

  getCustomerById(customerId: number): Observable<CustomerDTO> {
    return this.http.get<CustomerDTO>(`${this.customerApiBaseUrl}/${customerId}`);
  }

  updateCustomer(customerDto: CustomerDTO): Observable<string> {
    return this.http.post(`${this.customerApiBaseUrl}/update`, customerDto, { responseType: 'text' });
  }

  toggleEnableStatus(customerId: number): Observable<string> {
    return this.http.post(`${this.customerApiBaseUrl}/toggle-enable-status/${customerId}`, null, { responseType: 'text' });
  }

  deleteCustomer(customerId: number): Observable<string> {
    return this.http.delete(`${this.customerApiBaseUrl}/delete/${customerId}`, { responseType: 'text' });
  }
}

