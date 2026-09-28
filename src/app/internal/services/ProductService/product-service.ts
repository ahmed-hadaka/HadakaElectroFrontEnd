import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../../../shared/Models/PageModel';
import { ProductDTO, ProductListDTO } from '../../../shared/Models/ProductDTO';
import { BrandSelectDTO } from '../../../shared/Models/BrandDTO';
import {environmentDev} from '../../../../environments/environment.dev';
import {CategorySelectDTO} from '../../../shared/Models/CategoryDTO';

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private productApiBaseUrl = environmentDev.backendInternalBaseUrl+'/products';

  constructor(private http: HttpClient) {}

  listProducts(
    keyword?: string,
    categoryId?: number,
    page:number = 0,
    size: number = 10,
    sort: string = 'id',
    direction: string = 'ASC'
  ): Observable<any> {
    let params = new HttpParams()
      .set('size', size.toString())
      .set('page', page.toString())
      .set('sort', sort)
      .set('direction', direction);

    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }

    return this.http.get<{ products:Page<ProductListDTO>, categories:CategorySelectDTO[] }>(`${this.productApiBaseUrl}`, { params });
  }

  getNewProductFormData(): Observable<{ brands: BrandSelectDTO[],categories:CategorySelectDTO[] }> {
    return this.http.get<{ brands: BrandSelectDTO[],categories:CategorySelectDTO[] }>(`${this.productApiBaseUrl}/new-product`);
  }

  saveProduct(formData: FormData): Observable<string> {
    return this.http.post(`${this.productApiBaseUrl}/save-product`, formData,{responseType:'text'});
  }

  // getProductById(id: number): Observable<ProductDTO> {
  //   return this.http.get<ProductDTO>(`${this.productApiBaseUrl}/${id}`);
  // }

  getEditProductData(id: number): Observable<{ product: ProductDTO; brands: BrandSelectDTO[],categories:CategorySelectDTO[] }> {
    return this.http.get<{ product: ProductDTO; brands: BrandSelectDTO[],categories:CategorySelectDTO[] }>(`${this.productApiBaseUrl}/edit/${id}`);
  }

  deleteProduct(id: number): Observable<string> {
    return this.http.delete(`${this.productApiBaseUrl}/delete/${id}`,{responseType:'text'});
  }

  updateProductStatus(id: number): Observable<string> {
    return this.http.patch(`${this.productApiBaseUrl}/update-enable-status/${id}`, null,{responseType:'text'});
  }
}
