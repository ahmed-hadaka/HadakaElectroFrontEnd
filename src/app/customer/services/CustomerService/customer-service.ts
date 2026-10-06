import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentDev } from '../../../../environments/environment.dev';
import {
  CountryDTO,
  CustomerCategoryProductsResponse,
  CustomerProductDetailResponse,
  CustomerDTO,
  GeneralSettingDTO,
  ResetPasswordDTO
} from '../../../shared/Models/CustomerDTO';
import { CategoryListDTO } from '../../../shared/Models/CategoryDTO';
import { Page } from '../../../shared/Models/PageModel';
import {ProductListDTO} from '../../../shared/Models/ProductDTO';
import {SettingStateDTO} from '../../../shared/Models/SettingDTO';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customerApiBaseUrl = environmentDev.backendCustomerBaseUrl;

  constructor(private http: HttpClient) {}

  getCountries(): Observable<CountryDTO[]> {
    return this.http.get<CountryDTO[]>(
      `${this.customerApiBaseUrl}/customers/register`
    );
  }

  saveCustomer(customer: CustomerDTO): Observable<Record<string, string>> {
    return this.http.post<Record<string, string>>(
      `${this.customerApiBaseUrl}/customers/save-customer`,
      customer
    );
  }

  updateCustomer(customer: CustomerDTO): Observable<Record<string, string>> {
    return this.http.post<Record<string, string>>(
      `${this.customerApiBaseUrl}/customers/update-customer`,
      customer
    );
  }

  verifyCustomer(code: string): Observable<Record<string, string>> {
    const params = new HttpParams().set('code', code);
    return this.http.get<Record<string, string>>(
      `${this.customerApiBaseUrl}/customers/verify`,
      { params}
    );
  }

  getCategories(page: number = 0, size: number = 12, sort: string = 'id'): Observable<Page<CategoryListDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<Page<CategoryListDTO>>(
      `${this.customerApiBaseUrl}/list-categories`,
      { params}
    );
  }

   getCategoryProducts(
    categoryId: number,
    page: number = 0,
    size: number = 12,
    sort: string = 'id'
  ): Observable<CustomerCategoryProductsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<CustomerCategoryProductsResponse>(
      `${this.customerApiBaseUrl}/products/c/${categoryId}`,
      { params }
    );
  }

  getProductDetails(productId: number): Observable<CustomerProductDetailResponse> {
    return this.http.get<CustomerProductDetailResponse>(
      `${this.customerApiBaseUrl}/products/p/${productId}`
    );
  }

  getGeneralSettings(): Observable<GeneralSettingDTO[]> {
    return this.http.get<GeneralSettingDTO[]>(
      `${this.customerApiBaseUrl}/general-settings`
    );
  }

  getCustomerDetails(customerEmail: string): Observable<CustomerDTO> {
    return this.http.get<CustomerDTO>(
      `${this.customerApiBaseUrl}/customers/${encodeURIComponent(customerEmail)}`
    );
  }

  requestPasswordReset(customerEmail: string): Observable<Record<string, string>> {
    const params = new HttpParams().set('customer-email', customerEmail);
    return this.http.post<Record<string, string>>(
      `${this.customerApiBaseUrl}/customers/request-password-reset`,
      null,
      { params }
    );
  }

  resetPassword(resetPasswordDto: ResetPasswordDTO): Observable<Record<string, string>> {
    return this.http.post<Record<string, string>>(
      `${this.customerApiBaseUrl}/customers/reset-password`,
      resetPasswordDto

    );
  }

  searchProducts(keyword: string, page: number = 0, size: number = 10) {
    return this.http.get<Page<ProductListDTO>>(
      `${this.customerApiBaseUrl}/products/search/${keyword}?page=${page}&size=${size}`
    );
  }

}
