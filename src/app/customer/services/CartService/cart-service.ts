import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environmentDev} from '../../../../environments/environment.dev';
import {CartItemDTO} from '../../../shared/Models/CartItemDTO';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private baseUrl = environmentDev.backendCustomerBaseUrl + '/cart';

  getCartItems(): Observable<CartItemDTO[]> {
    return this.http.get<CartItemDTO[]>(this.baseUrl);
  }

  addProduct(productId: number, quantity: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/add/${productId}/${quantity}`, {});
  }

  updateQuantity(productId: number, quantity: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/update/${productId}/${quantity}`, {});
  }

  removeProduct(productId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/remove/${productId}`);
  }
}
