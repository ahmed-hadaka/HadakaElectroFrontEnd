import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, NgIf } from '@angular/common';
import { CustomerService } from '../../services/CustomerService/customer-service';
import { CustomerCategoryProductsResponse, CustomerProductListDTO } from '../../../shared/Models/CustomerDTO';
import { environmentDev } from '../../../../environments/environment.dev';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products {
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private notification = inject(NotificationService);

  response = signal<CustomerCategoryProductsResponse | null>(null);
  currentPage = signal(0);

  categoryId = signal<number | null>(null);
  searchKeyword = signal<string | null>(null);

  productImageBasePath = environmentDev.backendCustomerBaseUrl;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      const keywordParam = params.get('keyword');

      if (keywordParam) {
        this.searchKeyword.set(keywordParam);
        this.categoryId.set(null);
      } else if (idParam) {
        this.categoryId.set(Number(idParam));
        this.searchKeyword.set(null);
      }

      this.loadProducts(0);
    });
  }

  loadProducts(page: number) {
    const keyword = this.searchKeyword();
    const id = this.categoryId();

    if (keyword) {
      // 1. Search Mode
      this.customerService.searchProducts(keyword, page, 12).subscribe({
        next: (data: any) => {
          this.response.set({
            parentCategories: [],
            products: data
          });
          this.currentPage.set(page);
        },
        error: (err) => this.handleError(err)
      });
    } else if (id !== null) {
      // 2. Category Mode
      this.customerService.getCategoryProducts(id, page, 12).subscribe({
        next: (data) => {
          this.response.set(data);
          this.currentPage.set(page);
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  nextPage() {
    const response = this.response();
    if (response && this.currentPage() < response.products.totalPages - 1) {
      this.loadProducts(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.loadProducts(this.currentPage() - 1);
    }
  }

  getImagePath(product: CustomerProductListDTO): string {
    if (!product) {
      return environmentDev.backendCustomerBaseUrl + '/default_images/default-product.png';
    }
    return `${this.productImageBasePath}/${product.id}/${product.mainImage}`;
  }

  private handleError(err: any) {
    const message = err.error?.message || err.error?.msg ||
      (typeof err.error === 'string' ? err.error : null) ||
      'An unexpected error occurred while loading products';
    this.notification.notify(message, 'danger');
  }
}
