import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../../Models/PageModel';
import { BrandDTO, BrandSelectDTO } from '../../Models/BrandDTO';
import {environmentDev} from '../../../environments/environment.dev';
import {CategorySelectDTO} from '../../Models/CategoryDTO';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private brandApiBaseUrl = environmentDev.backendInternalBaseUrl+'/brands';

  listBrands(
    keyword?: string,
    page:number = 0,
    size: number = 10,
    sort: string = 'id',
    direction: string = 'ASC'
  ): Observable<Page<BrandDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('direction', direction);

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<Page<BrandDTO>>(`${this.brandApiBaseUrl}`, { params });
  }

  constructor(private http: HttpClient) {}

  getNewBrandFormData(): Observable<CategorySelectDTO[]> {
    return this.http.get<CategorySelectDTO[]>(`${this.brandApiBaseUrl}/new-brand`);
  }

  saveBrand(formData: FormData): Observable<string> {
    return this.http.post(`${this.brandApiBaseUrl}/save-brand`, formData,{responseType:'text'});
  }

  getEditBrandData(id: number): Observable<{ brand: BrandDTO; categories: CategorySelectDTO[] }> {
    return this.http.get<{ brand: BrandDTO; categories: CategorySelectDTO[] }>(`${this.brandApiBaseUrl}/edit/${id}`);
  }

  deleteBrand(id: number): Observable<string> {
    return this.http.delete(`${this.brandApiBaseUrl}/delete/${id}`, {responseType:'text'});
  }
}

