import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/OrderService/order-service';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import {OrderListDTO, OrderStatus} from '../../../shared/Models/OrderDTO';
import {SettingDTO} from '../../../shared/Models/SettingDTO';
import {RoleService} from '../../services/role-service';

@Component({
  selector: 'app-list-orders',
  templateUrl: './list-orders.html',
  styleUrl: './list-orders.css',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe
  ]
})
export class ListOrders {
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  protected notification = inject(NotificationService);
  public roleService = inject(RoleService);

  ordersPageContent = signal<OrderListDTO[] | null>(null);

  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);

  searchForm!: FormGroup;
  orderIdToDelete = signal<number | null>(null);
  currencySymbol = signal<string>('$');
  currencySymbolPosition = signal<string>('Before price');


  ngOnInit() {
    this.handleCurrencyFormating();
    this.initializeForm();
    this.loadOrders();
  }

  private initializeForm() {
    this.searchForm = this.fb.group({
      keyword: ['']
    });
  }

  loadOrders(page: number = 0) {
    const keyword: string = this.searchForm.get('keyword')?.value || '';

    this.orderService.listOrders(keyword, page, this.pageSize()).subscribe({
      next: (data) => {
        this.ordersPageContent.set(data.content);
        this.totalPages.set(data.totalPages);
        this.currentPage.set(page);
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

  onSearch() {
    this.loadOrders(0);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.loadOrders(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.loadOrders(this.currentPage() - 1);
    }
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
        this.loadOrders(this.currentPage());
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

    this.currencySymbolPosition.set(curSymbolPosition ? curSymbolPosition.value : 'Before price');

  }

  // -------------- shipper section ------
  pendingStatusUpdate = signal<{ orderId: number; status: OrderStatus;note:string } | null>(null);
  private readonly shipperStatusHierarchy = ['PICKED', 'SHIPPING', 'DELIVERED'];

  hasReachedStatus(currentStatus: string, targetStatus: string): boolean {
    if (currentStatus === targetStatus) return true;
    const currentIndex = this.shipperStatusHierarchy.indexOf(currentStatus);
    const targetIndex = this.shipperStatusHierarchy.indexOf(targetStatus);

    return currentIndex !== -1 && targetIndex !== -1 && currentIndex >= targetIndex;
  }

  confirmStatusUpdate(orderId: number, status: OrderStatus, note:string): void {
    this.pendingStatusUpdate.set({ orderId, status, note });
  }

  cancelStatusUpdate(): void {
    this.pendingStatusUpdate.set(null);
  }

  executeStatusUpdate(): void {
    const update = this.pendingStatusUpdate();
    if (!update) return;

    this.orderService.updateOrderStatus(update.orderId, update.status,update.note).subscribe({
      next: () => {
        this.notification.notify(
          `Order #${update.orderId} status updated to ${update.status.toString()}.`,
          'success'
        );
        this.pendingStatusUpdate.set(null);
        this.loadOrders(this.currentPage());
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Failed to update order status.';
        this.notification.notify(message, 'danger');
        this.pendingStatusUpdate.set(null);
      },
    });
  }

  protected readonly OrderStatus = OrderStatus;
}
