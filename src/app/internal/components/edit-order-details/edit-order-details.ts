
import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { catchError, forkJoin, of } from 'rxjs';
import { environmentDev } from '../../../../environments/environment.dev';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { OrderService } from '../../services/OrderService/order-service';
import { ProductService } from '../../services/ProductService/product-service';
import { SettingService } from '../../services/SettingService/setting.service';
import { SettingDTO, SettingCountryDTO, SettingStateDTO } from '../../../shared/Models/SettingDTO';
import { ProductDTO } from '../../../shared/Models/ProductDTO';
import { ShippingRateDTO } from '../../../shared/Models/ShippingRateDTO';
import {
  OrderDetailDTO,
  OrderDTO,
  OrderStatus,
  OrderTrackDTO,
  PaymentMethod,
} from '../../../shared/Models/OrderDTO';
import {ShippingRateService} from '../../services/shippingRateService/shipping-rate-service';

@Component({
  selector: 'app-edit-order-details',
  standalone: true,
  templateUrl: './edit-order-details.html',
  styleUrl: './edit-order-details.css',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    RouterLink,
  ],
})
export class EditOrderDetails implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private shippingRateService = inject(ShippingRateService);
  private settingService = inject(SettingService);
  private notification = inject(NotificationService);

  orderForm!: FormGroup;
  productIdToDelete = signal<number | null>(null);
  activeTab = signal<'overview' | 'products' | 'shipping' | 'track'>('overview');
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  calculatedTax = signal<number>(0);

  // Product Iframe Modal State
  showAddProductModal = signal<boolean>(false);
  isAddingProduct = signal<boolean>(false);
  productsIframeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('/ElectroInternal/products');

  countries = signal<SettingCountryDTO[]>([]);
  states = signal<SettingStateDTO[]>([]);
  isLoadingStates = signal<boolean>(false);

  currencySymbol = signal<string>('$');
  currencySymbolPosition = signal<string>('Before price');

  protected productImageBasePath = environmentDev.backendInternalBaseUrl + '/product_images/';
  protected defaultProductImagePath = environmentDev.backendInternalBaseUrl + '/default_images/default-product.png';

  paymentMethods = Object.values(PaymentMethod);
  orderStatuses = Object.values(OrderStatus);

  // Listen for product selection message sent from the <iframe>
  @HostListener('window:message', ['$event'])
  onIframeMessage(event: MessageEvent): void {
    if (event.origin === window.location.origin && event.data?.type === 'SELECT_PRODUCT') {
      const selectedProductId = Number(event.data.productId);
      this.onProductSelected(selectedProductId);
    }
  }

  ngOnInit(): void {
    this.handleCurrencyFormating();

    this.route.paramMap.subscribe((params) => {
      const orderId = Number(params.get('id'));

      if (!orderId || orderId < 1) {
        this.notification.notify('Invalid order ID.', 'danger');
        this.router.navigate(['ElectroInternal/orders']);
        return;
      }

      this.loadOrderDetails(orderId);
    });
  }

  get orderDetailsArray(): FormArray {
    return this.orderForm.get('orderDetails') as FormArray;
  }

  get orderTracksArray(): FormArray {
    return this.orderForm.get('orderTracks') as FormArray;
  }

  setActiveTab(tab: 'overview' | 'products' | 'shipping' | 'track'): void {
    this.activeTab.set(tab);
  }

  private loadOrderDetails(id: number): void {
    this.isLoading.set(true);

    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.initForm(order);
        this.loadCountriesAndSync(order.country, order.state);
        this.isLoading.set(false);
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Failed to load order details.';
        this.notification.notify(message, 'danger');
        this.isLoading.set(false);
      },
    });
  }

  private initForm(order: OrderDTO): void {
    this.orderForm = this.fb.group({
      id: [order.id, Validators.required],
      orderTime: [order.orderTime, Validators.required],
      customerId: [order.customerId],
      customerName: [order.customerName],
      customerEmail: [order.customerEmail, [Validators.email]],
      customerPhoneNumber: [order.customerPhoneNumber],

      // Shipping & Recipient
      recipientName: [order.recipientName, [Validators.required, Validators.maxLength(45)]],
      recipientPhoneNumber: [order.recipientPhoneNumber, [Validators.required, Validators.maxLength(15)]],
      addressLine1: [order.addressLine1, [Validators.required, Validators.maxLength(64)]],
      addressLine2: [order.addressLine2 || '', [Validators.maxLength(64)]],
      city: [order.city, [Validators.required, Validators.maxLength(45)]],
      country: [order.country, [Validators.required, Validators.maxLength(45)]],
      state: [order.state, [Validators.required, Validators.maxLength(45)]],
      postalCode: [order.postalCode, [Validators.required, Validators.maxLength(10)]],

      // Status & Delivery
      paymentMethod: [order.paymentMethod, Validators.required],
      status: [order.status, Validators.required],
      deliverDays: [order.deliverDays, [Validators.required, Validators.min(0)]],
      expectedDeliverDate: [this.formatDateForInput(order.expectedDeliverDate)],

      // Financials
      productCost: [order.productCost, [Validators.required, Validators.min(0)]],
      shippingCost: [order.shippingCost, [Validators.required, Validators.min(0)]],
      subtotal: [order.subtotal, [Validators.required, Validators.min(0)]],
      total: [order.total, [Validators.required, Validators.min(0)]],
      tax: [order.tax ?? 0, [Validators.min(0)]],

      // Collections
      orderDetails: this.fb.array([]),
      orderTracks: this.fb.array([]),
    });

    if (order.orderDetails) {
      order.orderDetails.forEach((detail) => {
        this.orderDetailsArray.push(this.createOrderDetailGroup(detail));
      });
    }

    if (order.orderTracks) {
      this.orderTracksArray.clear();

      // sorted from Oldest to Newest
      const sortedTracks = [...order.orderTracks].sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();

        return dateA - dateB;
      });
      sortedTracks.forEach((track) => {
        this.orderTracksArray.push(this.createOrderTrackGroup(track));
      });
    }

    this.updateTaxSignal();
  }

  //  Add / Remove Product via Iframe Modal

  openAddProductModal(): void {
    this.showAddProductModal.set(true);
  }

  closeAddProductModal(): void {
    this.showAddProductModal.set(false);
  }

  private isProductAlreadyInOrder(productId: number): boolean {
    return this.orderDetailsArray.controls.some(
      (ctrl) => Number(ctrl.get('productId')?.value) === productId
    );
  }

  onProductSelected(productId: number): void {
    if (!productId) return;

    // 1. Prevent duplicate product in the same order
    if (this.isProductAlreadyInOrder(productId)) {
      this.notification.notify(
        `Could not add product. Product ID ${productId} is already in this order.`,
        'warning'
      );
      return;
    }

    this.closeAddProductModal();
    this.isAddingProduct.set(true);

    const country = this.orderForm.get('country')?.value || '';
    const state = this.orderForm.get('state')?.value || '';

    // 2. Fetch ProductDTO and ShippingRateDTO in parallel
    forkJoin({
      product: this.productService.getProductById(productId),
      shippingRate: this.shippingRateService.getShippingByCountryAndState(country, state).pipe(
        catchError(() => {
          this.notification.notify(
            `No shipping rate found for ${state}, ${country}. Defaulting shipping cost to 0.`,
            'warning'
          );
          return of(null);
        })
      ),
    }).subscribe({
      next: ({ product, shippingRate }) => {
        this.isAddingProduct.set(false);

        const productCost = Number(product.cost ?? 0);
        const unitPrice = this.calculateDiscountedPrice(product);
        const shippingCost = this.calculateProductShippingCost(product, shippingRate);

        const newDetail: OrderDetailDTO = {
          productId: product.id,
          productName: product.name,
          mainImage: product.mainImage || '',
          quantity: 1,
          productCost: Number(productCost.toFixed(2)),
          unitPrice: Number(unitPrice.toFixed(2)),
          shippingCost: Number(shippingCost.toFixed(2)),
          subtotal: Number(unitPrice.toFixed(2)),
        };

        this.orderDetailsArray.push(this.createOrderDetailGroup(newDetail));
        this.recalculateFromProducts();
        this.notification.notify(`Product "${product.name}" added to order.`, 'success');
      },
      error: (err) => {
        this.isAddingProduct.set(false);
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Failed to fetch product details.';
        this.notification.notify(message, 'danger');
      },
    });
  }

  private calculateDiscountedPrice(product: ProductDTO): number {
    const price = Number(product.price ?? 0);
    const discount = Number(product.discountPercent ?? 0);
    if (discount > 0) {
      return price * ((100 - discount) / 100);
    }
    return price;
  }

  private calculateProductShippingCost(product: ProductDTO, shippingRate: ShippingRateDTO | null): number {
    if (!shippingRate) return 0;

    const rate = Number(shippingRate.rate ?? 0);
    const length = Number(product.length ?? 0);
    const width = Number(product.width ?? 0);
    const height = Number(product.height ?? 0);
    const weight = Number(product.weight ?? 0);

    const dimWeight = (length * width * height) / 5000;
    const finalWeight = Math.max(dimWeight, weight);

    return Number((finalWeight * rate).toFixed(2));
  }

  confirmDelete(id: number): void {
    this.productIdToDelete.set(id);
  }

  executeDelete(): void {
    const id = this.productIdToDelete();
    if (id === null) return;
    this.removeProductRow(id!);
  }

  cancelDelete(): void {
    this.productIdToDelete.set(null);
  }

  removeProductRow(index: number): void {
    if (this.orderDetailsArray.length <= 1) {
      this.notification.notify('An order must contain at least one product.', 'warning');
      return;
    }
    this.productIdToDelete.set(null);
    this.orderDetailsArray.removeAt(index);
    this.recalculateFromProducts();
  }


  private loadCountriesAndSync(initialCountryName?: string, initialStateName?: string): void {
    this.settingService.getCountries().subscribe({
      next: (countryList) => {
        this.countries.set(countryList);

        if (!initialCountryName) return;

        const matchedCountry = countryList.find(
          (c) => c.name.trim().toLowerCase() === initialCountryName.trim().toLowerCase()
        );

        if (matchedCountry) {
          this.orderForm.patchValue({ country: matchedCountry.name }, { emitEvent: false });
          this.loadStatesForCountry(matchedCountry.id || 1, initialStateName);
        } else if (initialStateName) {
          this.orderForm.patchValue({ state: initialStateName }, { emitEvent: false });
        }
      },
      error: () => {
        this.notification.notify('Failed to load countries list.', 'danger');
      },
    });
  }

  onCountryChange(event: Event): void {
    const selectedCountryName = (event.target as HTMLSelectElement).value;
    const selectedCountry = this.countries().find((c) => c.name === selectedCountryName);

    if (selectedCountry) {
      this.orderForm.patchValue({
        country: selectedCountry.name,
        state: '',
      });
      this.loadStatesForCountry(selectedCountry.id || 1);
    } else {
      this.states.set([]);
      this.orderForm.patchValue({ state: '' });
    }
  }

  private loadStatesForCountry(countryId: number, stateNameToSelect?: string): void {
    this.isLoadingStates.set(true);

    this.settingService.getStates(countryId).subscribe({
      next: (stateList) => {
        this.states.set(stateList);
        this.isLoadingStates.set(false);

        if (stateNameToSelect) {
          const matchedState = stateList.find(
            (s) => s.name.trim().toLowerCase() === stateNameToSelect.trim().toLowerCase()
          );

          this.orderForm.patchValue(
            { state: matchedState ? matchedState.name : stateNameToSelect },
            { emitEvent: false }
          );
        }
      },
      error: () => {
        this.isLoadingStates.set(false);
        this.notification.notify('Failed to load states for the selected country.', 'danger');
      },
    });
  }


  private createOrderDetailGroup(detail: OrderDetailDTO): FormGroup {
    const qty = detail.quantity && detail.quantity > 0 ? detail.quantity : 1;
    const unitCost = detail.productCost / qty;
    const unitShipping = detail.shippingCost / qty;

    return this.fb.group({
      productId: [detail.productId, Validators.required],
      productName: [detail.productName],
      mainImage: [detail.mainImage],
      quantity: [qty, [Validators.required, Validators.min(1)]],
      productCost: [detail.productCost, [Validators.required, Validators.min(0)]],
      unitPrice: [detail.unitPrice, [Validators.required, Validators.min(0)]],
      shippingCost: [detail.shippingCost, [Validators.required, Validators.min(0)]],
      subtotal: [detail.subtotal, [Validators.required, Validators.min(0)]],
      // Internal helpers to scale productCost & shippingCost when quantity changes
      _unitCost: [unitCost],
      _unitShipping: [unitShipping],
    });
  }

  private createOrderTrackGroup(track?: Partial<OrderTrackDTO>): FormGroup {
    return this.fb.group({
      orderId: [track?.orderId ?? this.orderForm?.get('id')?.value, Validators.required],
      orderStatus: [track?.orderStatus ?? this.orderForm?.get('status')?.value ?? OrderStatus.NEW, Validators.required],
      updatedAt: [track?.updatedAt ? this.normalizeDateTime(track.updatedAt) : this.formatLocalDateTime()],
      notes: [track?.notes ?? ''],
    });
  }

  private normalizeDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr.replace('T', ' ').split('.')[0].replace('Z', '') : this.formatLocalDateTime(d);
  }

  private formatLocalDateTime(date: Date = new Date()): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  addTrackRow(): void {
    this.orderTracksArray.push(this.createOrderTrackGroup());
  }

  removeTrackRow(index: number): void {
    this.orderTracksArray.removeAt(index);
  }

  //  Dynamic Calculation Logic

  updateItemSubtotal(index: number): void {
    const group = this.orderDetailsArray.at(index);
    const qty = Number(group.get('quantity')?.value) || 1;
    const unitPrice = Number(group.get('unitPrice')?.value) || 0;
    const unitCost = Number(group.get('_unitCost')?.value) || 0;
    const unitShipping = Number(group.get('_unitShipping')?.value) || 0;

    const subtotal = Number((qty * unitPrice).toFixed(2));
    const productCost = Number((qty * unitCost).toFixed(2));
    const shippingCost = Number((qty * unitShipping).toFixed(2));

    group.patchValue({ subtotal, productCost, shippingCost }, { emitEvent: false });
    this.recalculateFromProducts();
  }

  onManualItemCostOrShippingChange(index: number): void {
    const group = this.orderDetailsArray.at(index);
    const qty = Number(group.get('quantity')?.value) || 1;
    const productCost = Number(group.get('productCost')?.value) || 0;
    const shippingCost = Number(group.get('shippingCost')?.value) || 0;

    group.patchValue(
      {
        _unitCost: productCost / qty, // will be used on updateItemSubtotal() fun
        _unitShipping: shippingCost / qty,
      },
      { emitEvent: false }
    );

    this.recalculateFromProducts();
  }

  recalculateFromProducts(): void {
    let totalProductCost = 0;
    let totalSubtotal = 0;
    let totalShippingCost = 0;

    this.orderDetailsArray.controls.forEach((control) => {
      totalProductCost += Number(control.get('productCost')?.value) || 0;
      totalSubtotal += Number(control.get('subtotal')?.value) || 0;
      totalShippingCost += Number(control.get('shippingCost')?.value) || 0;
    });

    const tax = this.calculatedTax();
    const newTotal = Number((totalSubtotal + totalShippingCost + tax).toFixed(2));

    this.orderForm.patchValue({
      productCost: Number(totalProductCost.toFixed(2)),
      subtotal: Number(totalSubtotal.toFixed(2)),
      shippingCost: Number(totalShippingCost.toFixed(2)),
      total: newTotal,
    });

    this.updateTaxSignal();
  }

  recalculateTotals(): void {
    const subtotal = Number(this.orderForm.get('subtotal')?.value) || 0;
    const shipping = Number(this.orderForm.get('shippingCost')?.value) || 0;
    const tax = this.calculatedTax();

    const total = Number((subtotal + shipping + tax).toFixed(2));
    this.orderForm.patchValue({ total }, { emitEvent: false });
    this.updateTaxSignal();
  }

  onManualTotalChange(): void {
    this.updateTaxSignal();
  }

  private updateTaxSignal(): void {
    if (!this.orderForm) return;
    const total = Number(this.orderForm.get('total')?.value) || 0;
    const subtotal = Number(this.orderForm.get('subtotal')?.value) || 0;
    const shipping = Number(this.orderForm.get('shippingCost')?.value) || 0;
    const tax = Math.max(0, Number((total - subtotal - shipping).toFixed(2)));
    this.calculatedTax.set(tax);

    this.orderForm.patchValue({ tax }, { emitEvent: false });
  }

  private formatDateForInput(dateStr?: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }

  protected getProductImagePath(productId?: number, imageName?: string | null): string {
    if (!productId || !imageName) {
      return this.defaultProductImagePath;
    }
    return `${this.productImageBasePath}${productId}/${imageName}`;
  }

  private handleCurrencyFormating(): void {
    const rawSettings = sessionStorage.getItem('siteSettings');
    if (!rawSettings) return;

    try {
      const settings = JSON.parse(rawSettings) as SettingDTO[];
      const curSymbolSetting = settings.find((setting) => setting.key === 'CURRENCY_SYMBOL');
      this.currencySymbol.set(curSymbolSetting ? curSymbolSetting.value : '$');

      const curSymbolPosition = settings.find((setting) => setting.key === 'CURRENCY_SYMBOL_POSITION');
      this.currencySymbolPosition.set(curSymbolPosition ? curSymbolPosition.value : 'BEFORE_PRICE');
    } catch {
      this.currencySymbol.set('$');
      this.currencySymbolPosition.set('BEFORE_PRICE');
    }
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      this.notification.notify('Please correct the validation errors in the form before saving.', 'danger');
      return;
    }

    this.isSaving.set(true);
    const rawValue = this.orderForm.value;

    // Strip internal helper properties (_unitCost, _unitShipping) before sending payload
    const cleanedDetails: OrderDetailDTO[] = (rawValue.orderDetails || []).map((d: any) => ({
      productId: d.productId,
      productName: d.productName,
      mainImage: d.mainImage,
      quantity: d.quantity,
      productCost: d.productCost,
      unitPrice: d.unitPrice,
      shippingCost: d.shippingCost,
      subtotal: d.subtotal,
    }));

    const payload: OrderDTO = {
      ...rawValue,
      orderDetails: cleanedDetails,
    };

    this.orderService.updateOrderDetails(payload).subscribe({
      next: (response: string) => {
        this.isSaving.set(false);
        this.notification.notify(response || `Order id: ${payload.id} updated successfully`, 'success');
        this.router.navigate(['ElectroInternal/orders']);
      },
      error: (err) => {
        this.isSaving.set(false);
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Failed to update order details.';
        this.notification.notify(message, 'danger');
      },
    });
  }
}
