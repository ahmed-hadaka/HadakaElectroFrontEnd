import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, NgClass } from '@angular/common';
import { CustomerService } from '../../services/CustomerService/customer-service';
import { CustomerProductDetailResponse } from '../../../shared/Models/CustomerDTO';
import { environmentDev } from '../../../../environments/environment.dev';
import { CustomerNavBar } from '../customerNavBar/customer-nav-bar';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { ProductDTO } from '../../../shared/Models/ProductDTO';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [DecimalPipe, CustomerNavBar, NgClass, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails {
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private notification = inject(NotificationService);

  response = signal<CustomerProductDetailResponse | null>(null);
  productImageBasePath = environmentDev.backendCustomerBaseUrl;

  // Interactive UI State
  selectedImage = signal<string | null>(null);
  quantity = signal<number>(1);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.loadProduct(id);
    });
  }

  private loadProduct(id: number) {
    this.customerService.getProductDetails(id).subscribe({
      next: (data) => {
        this.response.set(data);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          `An unexpected error occurred while fetching product id ${id}`;
        this.notification.notify(message, 'danger');
      }
    });
  }

  // --- UI Action Methods ---

  changeMainImage(imageUrl: string) {
    this.selectedImage.set(imageUrl);
  }

  increaseQty() {
    this.quantity.update(q => q + 1);
  }

  decreaseQty() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  // --- Helper Methods ---

  getDiscountedPrice(price: number, discountPercent: number): number {
    if (!discountPercent || discountPercent <= 0) return price;
    return price - (price * (discountPercent / 100));
  }

  getImagePath(product: ProductDTO): string {
    if (!product || !product.mainImage) {
      return environmentDev.backendCustomerBaseUrl + '/default_images/default-product.png';
    }
    return `${this.productImageBasePath}/${product.id}/${product.mainImage}`;
  }

  getExtraImagePath(productId: number, imageName: string): string {
    return `${this.productImageBasePath}/${productId}/${imageName}`;
  }
}

