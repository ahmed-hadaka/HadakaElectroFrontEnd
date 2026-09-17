import { Component, inject, signal } from '@angular/core';
import { ProductService } from '../../services/ProductService/product-service';
import { ProductListDTO } from '../../Models/ProductDTO';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environmentDev } from '../../../environments/environment.dev';
import { NotificationService } from '../../services/NotificationService/notification-service';
import { CategoryService } from '../../services/CategoryService/category-service';
import { CategorySelectDTO } from '../../Models/CategoryDTO';

@Component({
  selector: 'app-list-products',
  templateUrl: './list-products.html',
  styleUrl: './list-products.css',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ]
})
export class ListProducts {
  private productService = inject(ProductService);
  protected notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  productsPageContent = signal<ProductListDTO[] | null>(null);
  categories = signal<CategorySelectDTO[]>([]);
  productImageBasePath = environmentDev.backendInternalBaseUrl + '/product_images/';

  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);

  searchForm!: FormGroup;
  productIdToDelete = signal<number | null>(null);

  ngOnInit() {
    this.initializeForm();
    this.loadProducts();
  }

  private initializeForm() {
    this.searchForm = this.fb.group({
      keyword: [''],
      categoryId: [null]
    });
  }


  loadProducts(page: number = 0) {
    const keyword:string = this.searchForm.get('keyword')?.value || '';
    const categoryId:number = this.searchForm.get('categoryId')?.value;

    this.productService.listProducts(keyword, categoryId, page, this.pageSize()).subscribe({
      next: (data) => {
        this.productsPageContent.set(data.products.content);
        this.categories.set(data.categories);
        this.totalPages.set(data.products.totalPages);
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
    this.loadProducts(0);
  }

  onCategoryChange() {
    this.loadProducts(0);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.loadProducts(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.loadProducts(this.currentPage() - 1);
    }
  }

  confirmDelete(id: number): void {
    this.productIdToDelete.set(id);
  }

  executeDelete(): void {
    const id = this.productIdToDelete();
    if (!id) return;
    this.deleteProduct(id);
  }

  cancelDelete(): void {
    this.productIdToDelete.set(null);
  }

  private deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.productIdToDelete.set(null);
        this.loadProducts(this.currentPage());
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected updateProductStatus(id: number) {
    this.productService.updateProductStatus(id).subscribe({
      next: (data: string) => {
        this.notification.notify(data, 'success');
        this.loadProducts(this.currentPage());
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  getImagePath(productId: number, imageName: string | undefined): string {
    if (!imageName) {
      return environmentDev.backendInternalBaseUrl + '/default_images/default-product.png';
    }
    return `${this.productImageBasePath}${productId}/${imageName}`;
  }
}
