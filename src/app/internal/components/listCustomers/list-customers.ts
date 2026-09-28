import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { CustomerDTO } from '../../../shared/Models/CustomerDTO';
import { CustomerService } from '../../services/CustomerService/customer-service';

@Component({
  selector: 'app-list-customers',
  templateUrl: './list-customers.html',
  styleUrl: './list-customers.css',
  imports: [ReactiveFormsModule, RouterLink]
})
export class ListCustomers {
  private customerService = inject(CustomerService);
  protected notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  customersPageContent = signal<CustomerDTO[] | null>(null);
  currentPage = signal(0);
  pageSize = signal(20);
  totalPages = signal(0);

  searchForm!: FormGroup;
  customerIdToDelete = signal<number | null>(null);

  ngOnInit() {
    this.initializeForm();
    this.loadCustomers();
  }

  private initializeForm() {
    this.searchForm = this.fb.group({
      keyword: ['']
    });
  }

  loadCustomers(page: number = 0) {
    const keyword = this.searchForm.get('keyword')?.value || '';

    this.customerService.listCustomers(keyword, page, this.pageSize()).subscribe({
      next: (data) => {
        this.customersPageContent.set(data.content);
        this.totalPages.set(data.totalPages);
        this.currentPage.set(page);
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while fetching customers';
        this.notification.notify(message, 'danger');
      }
    });
  }

  onSearch() {
    this.loadCustomers(0);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.loadCustomers(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.loadCustomers(this.currentPage() - 1);
    }
  }

  confirmDelete(id: number): void {
    this.customerIdToDelete.set(id);
  }

  executeDelete(): void {
    const id = this.customerIdToDelete();
    if (!id) return;
    this.deleteCustomer(id);
  }

  cancelDelete(): void {
    this.customerIdToDelete.set(null);
  }

  private deleteCustomer(id: number): void {
    this.customerService.deleteCustomer(id).subscribe({
      next: (data: string) => {
        this.notification.notify(data, 'success');
        this.customerIdToDelete.set(null);
        this.loadCustomers(this.currentPage());
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while deleting customer';
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected updateEnableStatus(id: number) {
    this.customerService.toggleEnableStatus(id).subscribe({
      next: (data: string) => {
        this.notification.notify(data, 'success');
        this.loadCustomers(this.currentPage());
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while updating enable status';
        this.notification.notify(message, 'danger');
      }
    });
  }
}

