import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ShippingRateDTO } from '../../../shared/Models/ShippingRateDTO';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import {ShippingRateService} from '../../services/shippingRateService/shipping-rate-service';
import {DecimalPipe} from '@angular/common';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DecimalPipe
  ],
  selector: 'app-list-shipping-rates',
  styleUrl: './list-shipping-rate.css',
  templateUrl: './list-shipping-rate.html',
})
export class ListShippingRates {
  private shippingRateService = inject(ShippingRateService);
  private fb = inject(FormBuilder);
  protected notification = inject(NotificationService);

  shippingRatesPageContent = signal<ShippingRateDTO[] | null>(null);

  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);

  searchForm!: FormGroup;
  rateIdToDelete = signal<number | null>(null);

  ngOnInit() {
    this.initializeForm();
    this.loadRates();
  }

  private initializeForm() {
    this.searchForm = this.fb.group({
      keyword: ['']
    });
  }

  loadRates(page: number = 0) {
    const keyword: string = this.searchForm.get('keyword')?.value || '';

    this.shippingRateService.listAllShippingRates(keyword, page, this.pageSize()).subscribe({
      next: (data) => {
        this.shippingRatesPageContent.set(data.shippingRates.content || data.shippingRates);
        this.totalPages.set(data.shippingRates.totalPages || 1);
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
    this.loadRates(0);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.loadRates(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.loadRates(this.currentPage() - 1);
    }
  }

  confirmDelete(id: number): void {
    this.rateIdToDelete.set(id);
  }

  executeDelete(): void {
    const id = this.rateIdToDelete();
    if (!id) return;
    this.deleteRate(id);
  }

  cancelDelete(): void {
    this.rateIdToDelete.set(null);
  }

  private deleteRate(id: number = 0) {
    this.shippingRateService.deleteShippingRate(id).subscribe({
      next: (data: string | any) => {
        const msg = typeof data === 'string' ? data : data.message;
        this.notification.notify(msg, 'success');
        this.rateIdToDelete.set(null);
        this.loadRates();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected updateCODStatus(id: number) {
    this.shippingRateService.updateCODStatus(id).subscribe({
      next: (data: string) => {
        this.notification.notify(data, 'success');
        this.loadRates();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }
}
