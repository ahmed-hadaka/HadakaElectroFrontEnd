import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import {AddressService} from '../../services/addressBookService/address-book-service';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';
import {AddressDTO} from '../../../shared/Models/AddressDTO';

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './address-book.html',
  styleUrl: './address-book.css'
})
export class AddressBook implements OnInit {
  private addressService = inject(AddressService);
  protected notification = inject(NotificationService);

  addresses = signal<AddressDTO[]>([]);
  addressIdToDelete = signal<number | null>(null);

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    this.addressService.getAddresses().subscribe({
      next: (data) => {
        const sorted = data.addresses.sort((a, b) => (a.defaultForShipping === b.defaultForShipping) ? 0 : a.defaultForShipping ? -1 : 1);
        this.addresses.set(sorted);
      },
      error: (err) => this.handleError(err, 'Failed to load address book.')
    });
  }

  setDefault(id: number) {
    this.addressService.setDefaultAddress(id).subscribe({
      next: (msg) => {
        this.notification.notify(msg, 'success');
        this.loadAddresses();
      },
      error: (err) => this.handleError(err, 'Failed to set default address.')
    });
  }

  confirmDelete(id: number) {
    this.addressIdToDelete.set(id);
  }

  executeDelete() {
    const id = this.addressIdToDelete();
    if (!id) return;

    this.addressService.deleteAddress(id).subscribe({
      next: (msg) => {
        this.notification.notify(msg, 'success');
        this.addressIdToDelete.set(null);
        this.loadAddresses();
      },
      error: (err) => this.handleError(err, 'Failed to delete address.')
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
