import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import {AddressService} from '../../services/addressBookService/address-book-service';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';
import {AddressDTO} from '../../../shared/Models/AddressDTO';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './address-book.html',
  styleUrl: './address-book.css'
})
export class AddressBook implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  public isLoading = false;
  private addressService = inject(AddressService);
  protected notification = inject(NotificationService);

  addresses = signal<AddressDTO[]>([]);
  addressIdToDelete = signal<number | null>(null);

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.addressService.getAddresses().pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (data) => {
        const sorted = data.addresses.sort((a, b) => (a.defaultForShipping === b.defaultForShipping) ? 0 : a.defaultForShipping ? -1 : 1);
        this.addresses.set(sorted);
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.handleError(err, 'Failed to load address book.')
      }
    });
  }

  setDefault(id: number) {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.addressService.setDefaultAddress(id).pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (msg) => {
        this.notification.notify(msg, 'success');
        this.loadAddresses();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.handleError(err, 'Failed to set default address.')
      }
    });
  }

  confirmDelete(id: number) {
    this.addressIdToDelete.set(id);
  }

  executeDelete() {
    const id = this.addressIdToDelete();
    if (!id) return;

    this.isLoading = true;
    this.cdr.detectChanges();
    this.addressService.deleteAddress(id).pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (msg) => {
        this.notification.notify(msg, 'success');
        this.addressIdToDelete.set(null);
        this.loadAddresses();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.handleError(err, 'Failed to delete address.')
      }
    });
  }

  cancelDelete() {
    this.addressIdToDelete.set(null);
  }

  private handleError(err: any, fallback: string) {
    const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || fallback;
    this.notification.notify(message, 'danger');
  }
}