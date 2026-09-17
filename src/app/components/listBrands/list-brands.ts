import { Component, inject, signal } from '@angular/core';
import { BrandService } from '../../services/BrandService/brand-service';
import { BrandDTO } from '../../Models/BrandDTO';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environmentDev } from '../../../environments/environment.dev';
import { NotificationService } from '../../services/NotificationService/notification-service';

@Component({
  selector: 'app-list-brands',
  templateUrl: './list-brands.html',
  styleUrl: './list-brands.css',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ]
})
export class ListBrands {
  private brandService = inject(BrandService);
  protected notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  brandsPageContent = signal<BrandDTO[] | null>(null);
  brandLogoBasePath = environmentDev.backendInternalBaseUrl + '/brand_logos/';
  
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  
  searchForm!: FormGroup;
  brandIdToDelete = signal<number | null>(null);

  ngOnInit() {
    this.initializeForm();
    this.loadBrands();
  }

  private initializeForm() {
    this.searchForm = this.fb.group({
      keyword: ['']
    });
  }

  loadBrands(page: number = 0) {
    const keyword = this.searchForm.get('keyword')?.value || '';

    this.brandService.listBrands(keyword, page, this.pageSize()).subscribe({
      next: (data) => {
        this.brandsPageContent.set(data.content);
        this.totalPages.set(data.totalPages);
        this.currentPage.set(page);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || 
          (typeof err.error === 'string' ? err.error : null) || 
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  onSearch() {
    this.loadBrands(0);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.loadBrands(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.loadBrands(this.currentPage() - 1);
    }
  }

  confirmDelete(id: number): void {
    this.brandIdToDelete.set(id);
  }

  executeDelete(): void {
    const id = this.brandIdToDelete();
    if (!id) return;
    this.deleteBrand(id);
  }

  cancelDelete(): void {
    this.brandIdToDelete.set(null);
  }

  private deleteBrand(id: number) {
    this.brandService.deleteBrand(id).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.brandIdToDelete.set(null);
        this.loadBrands(this.currentPage());
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || 
          (typeof err.error === 'string' ? err.error : null) || 
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  getLogoPath(brandId: number, logoName: string | undefined): string {
    if (!logoName) {
      return environmentDev.backendInternalBaseUrl + '/default_images/default-brand.png';
    }
    return `${this.brandLogoBasePath}${brandId}/${logoName}`;
  }
}
