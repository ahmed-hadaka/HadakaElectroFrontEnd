import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environmentDev } from '../../../../environments/environment.dev';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { OrderDTO } from '../../../shared/Models/OrderDTO';
import { OrderService } from '../../services/OrderService/order-service';
import {GeneralSettingDTO} from '../../../shared/Models/CustomerDTO';
import {SettingDTO} from '../../../shared/Models/SettingDTO';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe
  ]
})
export class OrderDetails {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private notification = inject(NotificationService);

  protected orderSignal = signal<OrderDTO | null>(null);
  protected orderIdToDelete = signal<number | null>(null);

  protected productImageBasePath = environmentDev.backendInternalBaseUrl + '/product_images/';
  protected defaultProductImagePath = environmentDev.backendInternalBaseUrl + '/default_images/default-product.png';

  currencySymbol = signal<string>('$');
  currencySymbolPosition = signal<string>('Before price');

  ngOnInit() {
    this.handleCurrencyFormating();

    this.route.paramMap.subscribe(params => {
      const orderId = Number(params.get('id'));

      if (!orderId || orderId < 1) {
        this.notification.notify('Invalid order ID.', 'danger');
        this.router.navigate(['ElectroInternal/orders']);
        return;
      }

      this.loadOrder(orderId);
    });
  }

  private loadOrder(id: number) {
    this.orderService.getOrderById(id).subscribe({
      next: (data) => {
        this.orderSignal.set(data);
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected getProductImagePath(productId: number, imageName?: string | null): string {
    if (!imageName) {
      return this.defaultProductImagePath;
    }
    return `${this.productImageBasePath}${productId}/${imageName}`;
  }

  confirmDelete(id: number): void {
    this.orderIdToDelete.set(id);
  }

  executeDelete(): void {
    const id = this.orderIdToDelete();
    if (!id) return;
    this.deleteOrder(id);
  }

  cancelDelete(): void {
    this.orderIdToDelete.set(null);
  }

  private deleteOrder(id: number) {
    this.orderService.deleteOrder(id).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.orderIdToDelete.set(null);
        this.router.navigate(['ElectroInternal/orders']);
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  private handleCurrencyFormating() {
    const settings = JSON.parse(sessionStorage.getItem('siteSettings')!) as SettingDTO[];
    const curSymbolSetting = settings
      .find(setting => setting.key === 'CURRENCY_SYMBOL');

    this.currencySymbol.set(curSymbolSetting ? curSymbolSetting.value : '$');

    const curSymbolPosition = settings
      .find(setting => setting.key === 'CURRENCY_SYMBOL_POSITION');

    this.currencySymbolPosition.set(curSymbolPosition ? curSymbolPosition.value : 'BEFORE_PRICE');

  }
}
