import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/CartService/cart-service';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { CartItemDTO } from '../../../shared/Models/CartItemDTO';
import { environmentDev } from '../../../../environments/environment.dev';
import {GeneralSettingDTO} from '../../../shared/Models/CustomerDTO';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [DecimalPipe, RouterLink, NgClass],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.css'
})
export class ShoppingCart implements OnInit {
  private cartService = inject(CartService);
  private notification = inject(NotificationService);

  cartItems = signal<CartItemDTO[]>([]);
  productImageBasePath = environmentDev.backendCustomerBaseUrl;

  // Automatically calculates the total based on the cartItems array
  estimatedTotal = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  currencySymbol = signal<string>('$');
  currencySymbolPosition = signal<string>('Before price');

  ngOnInit() {
    this.handleCurrencyFormating();
    this.loadCart();
  }

  loadCart() {
    this.cartService.getCartItems().subscribe({
      next: (items) => this.cartItems.set(items),
      error: (err) => this.handleError(err, 'Failed to load shopping cart.')
    });
  }

  updateQuantity(item: CartItemDTO, newQuantity: number) {
    if (newQuantity < 1 || newQuantity > 5) {
      this.notification.notify('Quantity must be between 1 and 5', 'warning');
      return;
    }

    this.cartService.updateQuantity(item.productId, newQuantity).subscribe({
      next: (res) => {
        this.notification.notify(res['message'], 'success');
        this.loadCart(); // Reload to ensure sync with backend
      },
      error: (err) => this.handleError(err, 'Failed to update quantity.')
    });
  }

  removeProduct(productId: number) {
    this.cartService.removeProduct(productId).subscribe({
      next: (res) => {
        this.notification.notify(res.message, 'success');
        this.loadCart();
      },
      error: (err) => this.handleError(err, 'Failed to remove product.')
    });
  }

  getImagePath(item: CartItemDTO): string {
    if (!item.mainImage) {
      return this.productImageBasePath + '/default_images/default-product.png';
    }
    return `${this.productImageBasePath}/product_images/${item.productId}/${item.mainImage}`;
  }

  private handleError(err: any, fallbackMessage: string) {
    const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || fallbackMessage;
    this.notification.notify(message, 'danger');
  }

  private handleCurrencyFormating() {
    const settings = JSON.parse(sessionStorage.getItem('siteSettings')!) as GeneralSettingDTO[];
    const curSymbolSetting = settings
      .find(setting => setting.key === 'CURRENCY_SYMBOL');

    this.currencySymbol.set(curSymbolSetting ? curSymbolSetting.value : '$');

    const curSymbolPosition = settings
      .find(setting => setting.key === 'CURRENCY_SYMBOL_POSITION');

    this.currencySymbolPosition.set(curSymbolPosition ? curSymbolPosition.value : 'Before price');

  }
}
