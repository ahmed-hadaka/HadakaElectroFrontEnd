import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CategoryService } from '../../services/CategoryService/category-service';
import { CategoryListDTO } from '../../../shared/Models/CategoryDTO';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environmentDev } from '../../../../environments/environment.dev';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-list-categories',
  templateUrl: './list_categories.html',
  styleUrl: './list-categories.css',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ]
})
export class ListCategories {
  private cdr = inject(ChangeDetectorRef);
  public isLoading = false;
  private categoryService = inject(CategoryService);
  protected notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  categoriesPageContent = signal<CategoryListDTO[] | null>(null);
  categoryImageBasePath = environmentDev.backendInternalBaseUrl + '/category_images/';

  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);

  searchForm!: FormGroup;
  categoryIdToDelete = signal<number | null>(null);

  ngOnInit() {
    this.initializeForm();
    this.loadCategories();
  }

  private initializeForm() {
    this.searchForm = this.fb.group({
      keyword: ['']
    });
  }

  loadCategories(page: number = 0) {
    const keyword = this.searchForm.get('keyword')?.value || '';

    this.isLoading = true;
    this.cdr.detectChanges();
    this.categoryService.listCategories(keyword, page, this.pageSize()).pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (data) => {
        this.categoriesPageContent.set(data.content);
        this.totalPages.set(data.totalPages);
        this.currentPage.set(page);
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  onSearch() {
    this.loadCategories(0);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.loadCategories(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.loadCategories(this.currentPage() - 1);
    }
  }

  confirmDelete(id: number): void {
    this.categoryIdToDelete.set(id);
  }

  executeDelete(): void {
    const id = this.categoryIdToDelete();
    if (!id) return;
    this.deleteCategory(id);
  }

  cancelDelete(): void {
    this.categoryIdToDelete.set(null);
  }

  private deleteCategory(id: number) {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.categoryService.deleteCategory(id).pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.categoryIdToDelete.set(null);
        this.loadCategories(this.currentPage());
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected updateCategoryStatus(id: number) {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.categoryService.updateCategoryStatus(id).pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (data: string) => {
        this.notification.notify(data, 'success');
        this.loadCategories(this.currentPage());
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  getImagePath(categoryId: number, imageName: string | undefined): string {
    if (!imageName) {
      return environmentDev.backendInternalBaseUrl + '/default_images/default-category.png';
    }
    return `${this.categoryImageBasePath}${categoryId}/${imageName}`;
  }

  exportToCsv() {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.categoryService.exportToCsv().pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (data: Blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(data);
        link.download = 'Hadaka-Electro-Categories.csv';
        link.click();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const message = err.error?.message || 'Failed to export categories';
        this.notification.notify(message, 'danger');
      }
    });
  }
}