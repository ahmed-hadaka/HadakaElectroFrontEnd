import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CustomerOrderDTO,
  CustomerOrderListDTO,
  CustomerOrderReturnReqDTO, OrderStatus, OrderTrackDTO,
} from '../../../shared/Models/OrderDTO';
import { OrderService } from '../../services/orderService/OrderService';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';

export type OrderDetailTab = 'overview' | 'products' | 'shipping' | 'track';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private notification = inject(NotificationService);

  readonly OrderStatus = OrderStatus;

  readonly currencySymbol = signal<string>('$');
  readonly currencySymbolPosition = signal<'BEFORE_PRICE' | 'AFTER_PRICE'>('BEFORE_PRICE');

  readonly ordersPageContent = signal<CustomerOrderListDTO[]>([]);
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(5);
  readonly totalPages = signal<number>(0);
  readonly totalElements = signal<number>(0);
  readonly sortField = signal<string>('orderTime');
  readonly sortDir = signal<'asc' | 'desc'>('desc');
  readonly isLoadingList = signal<boolean>(false);

  readonly startCount = computed(() =>
    this.totalElements() === 0 ? 0 : this.currentPage() * this.pageSize() + 1
  );
  readonly endCount = computed(() =>
    Math.min((this.currentPage() + 1) * this.pageSize(), this.totalElements())
  );
  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index)
  );

  readonly searchForm: FormGroup = this.fb.group({
    keyword: [''],
  });

  readonly selectedOrder = signal<CustomerOrderDTO | null>(null);
  readonly isLoadingDetails = signal<boolean>(false);
  readonly activeTab = signal<OrderDetailTab>('overview');

  readonly sortedOrderTracks = computed<OrderTrackDTO[]>(() => {
    const order = this.selectedOrder();
    if (!order || !order.orderTracks) {
      return [];
    }
    return [...order.orderTracks].sort(
      (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
  });

  readonly recipientFirstName = computed<string>(() => {
    const fullName = this.selectedOrder()?.recipientName?.trim() ?? '';
    if (!fullName) return '';
    const parts = fullName.split(/\s+/);
    return parts[0];
  });

  readonly recipientLastName = computed<string>(() => {
    const fullName = this.selectedOrder()?.recipientName?.trim() ?? '';
    if (!fullName) return '';
    const parts = fullName.split(/\s+/);
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  });

  readonly returnOrderTarget = signal<CustomerOrderListDTO | null>(null);
  readonly isSubmittingReturn = signal<boolean>(false);
  readonly returnRequestSent = signal<boolean>(false);
  readonly returnErrorMessage = signal<string | null>(null);

  readonly returnReasons: string[] = [
    'I bought the wrong items',
    'I received the wrong items',
    'The product was damaged/defective',
    'The product arrived too late',
  ];

  readonly returnForm: FormGroup = this.fb.group({
    reason: ['', Validators.required],
    note: ['', [Validators.maxLength(255)]],
  });

  ngOnInit(): void {
    this.loadOrders();
  }


  loadOrders(): void {
    this.isLoadingList.set(true);
    const keyword = this.searchForm.get('keyword')?.value ?? '';

    this.orderService
      .getCustomerOrders(
        this.currentPage(),
        this.pageSize(),
        keyword,
        this.sortField(),
        this.sortDir()
      )
      .subscribe({
        next: (pageData) => {
          this.ordersPageContent.set(pageData.content ?? []);
          this.totalPages.set(pageData.totalPages ?? 0);
          this.totalElements.set(pageData.totalElements ?? 0);
          this.currentPage.set(pageData.curPage ?? 0);
          this.isLoadingList.set(false);
        },
        error: (err) => {
          this.ordersPageContent.set([]);
          this.isLoadingList.set(false);
            const message = err.error?.message || err.error?.msg ||
              (typeof err.error === 'string' ? err.error : null) ||
              `An unexpected error occurred while fetching orders`;
            this.notification.notify(message, 'danger');
        },
      });
  }


  onSearch(): void {
    this.currentPage.set(0);
    this.loadOrders();
  }

  onClear(): void {
    this.searchForm.reset({ keyword: '' });
    this.currentPage.set(0);
    this.loadOrders();
  }

  toggleSort(field: string): void {
    if (this.sortField() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('desc');
    }
    this.currentPage.set(0);
    this.loadOrders();
  }


  goToPage(pageIndex: number): void {
    if (pageIndex < 0 || pageIndex >= this.totalPages() || pageIndex === this.currentPage()) {
      return;
    }
    this.currentPage.set(pageIndex);
    this.loadOrders();
  }

  firstPage(): void {
    this.goToPage(0);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  lastPage(): void {
    this.goToPage(this.totalPages() - 1);
  }

  canReturnOrder(order: CustomerOrderListDTO): boolean {
    return (
      order.status !== OrderStatus.RETURNED &&
      order.status !== OrderStatus.CANCELED &&
      order.status !== OrderStatus.RETURNED_REQUESTED);
  }


  openOrderDetailsModal(orderId: number): void {
    this.activeTab.set('overview');
    this.isLoadingDetails.set(true);

    this.orderService.getOrderById(orderId).subscribe({
      next: (CustomerOrderDTO) => {
        this.selectedOrder.set(CustomerOrderDTO);
        this.isLoadingDetails.set(false);
      },
      error: (err) => {
          const message = err.error?.message || err.error?.msg ||
            (typeof err.error === 'string' ? err.error : null) ||
            `An unexpected error occurred while fetching order id ${orderId}`;
          this.notification.notify(message, 'danger');
      },
    });
  }

  closeOrderDetailsModal(): void {
    this.selectedOrder.set(null);
  }

  setTab(tab: OrderDetailTab): void {
    this.activeTab.set(tab);
  }

  hasTrackStatus(targetStatus: OrderStatus): boolean {
    const order = this.selectedOrder();
    if (!order) {
      return false;
    }
    if (order.status === targetStatus) {
      return true;
    }
    if (order.orderTracks && order.orderTracks.some((track) => track.orderStatus === targetStatus)) {
      return true;
    }

    const progression: OrderStatus[] = [
      OrderStatus.NEW,
      OrderStatus.PAID,
      OrderStatus.PROCESSING,
      OrderStatus.PACKAGED,
      OrderStatus.PICKED,
      OrderStatus.SHIPPING,
      OrderStatus.DELIVERED,
    ];
    const currentIdx = progression.indexOf(order.status);
    const targetIdx = progression.indexOf(targetStatus);

    return currentIdx !== -1 && targetIdx !== -1 && currentIdx >= targetIdx;
  }


  openReturnModal(order: CustomerOrderListDTO): void {
    this.returnOrderTarget.set(order);
    this.returnRequestSent.set(false);
    this.returnErrorMessage.set(null);
    this.returnForm.reset({
      reason: this.returnReasons[0],
      note: '',
    });
  }

  closeReturnModal(): void {
    this.returnOrderTarget.set(null);
    this.returnRequestSent.set(false);
    this.returnErrorMessage.set(null);
  }

  submitReturnRequest(): void {
    const targetOrder = this.returnOrderTarget();
    if (!targetOrder || this.returnForm.invalid) {
      this.returnForm.markAllAsTouched();
      return;
    }

    const payload: CustomerOrderReturnReqDTO = {
      orderId: targetOrder.id,
      reason: this.returnForm.get('reason')?.value,
      note: this.returnForm.get('note')?.value?.trim() || '',
    };

    this.isSubmittingReturn.set(true);
    this.returnErrorMessage.set(null);

    this.orderService.requestOrderReturn(payload).subscribe({
      next: () => {
        this.isSubmittingReturn.set(false);
        this.returnRequestSent.set(true);

        this.ordersPageContent.update((orders) =>
          orders.map((item) =>
            item.id === targetOrder.id ? { ...item, status: OrderStatus.RETURNED } : item
          )
        );
      },
      error: () => {
        this.isSubmittingReturn.set(false);
        this.returnErrorMessage.set('Failed to send return request. Please try again.');
      },
    });
  }
}
