import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../../../shared/Models/PageModel';
import { CategoryListDTO, CategorySelectDTO } from '../../../shared/Models/CategoryDTO';
import {environmentDev} from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private categoryApiBaseUrl = environmentDev.backendInternalBaseUrl+'/categories';

  constructor(private http: HttpClient) {}

  listCategories(
    keyword?: string,
    page:number = 0,
    size: number = 10,
    sort: string = 'id',
    direction: string = 'ASC'
  ): Observable<Page<CategoryListDTO>> {
    let params = new HttpParams()
      .set('size', size.toString())
      .set('page', page.toString())
      .set('sort', sort)
      .set('direction', direction);

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<Page<CategoryListDTO>>(`${this.categoryApiBaseUrl}`, { params });
  }

  getNewCategoryFormData(): Observable<CategorySelectDTO[]> {
    return this.http.get<CategorySelectDTO[]>(`${this.categoryApiBaseUrl}/new-category`);
  }

  saveCategory(formData: FormData): Observable<string> {
    return this.http.post(`${this.categoryApiBaseUrl}/save-category`, formData,{ responseType: 'text' });
  }

  getEditCategoryData(id: number): Observable<{ category: CategoryListDTO; categories: CategorySelectDTO[] }> {
    return this.http.get<{ category: CategoryListDTO; categories: CategorySelectDTO[] }>(`${this.categoryApiBaseUrl}/edit/${id}`);
  }

  deleteCategory(id: number): Observable<string> {
    return this.http.delete(`${this.categoryApiBaseUrl}/delete/${id}`,{ responseType: 'text' });
  }

  updateCategoryStatus(id: number): Observable<string> {
    return this.http.patch(`${this.categoryApiBaseUrl}/update-enable-status/${id}`,null,{ responseType: 'text' });
  }

  exportToCsv(): Observable<Blob> {
    return this.http.get(`${this.categoryApiBaseUrl}/export/csv`, { responseType: 'blob' });
  }
}
