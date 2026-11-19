import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { DecimalPipe } from '@angular/common';
import {SettingService} from '../../../internal/services/SettingService/setting.service';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';
import {CheckoutDataDTO} from '../../../shared/Models/CheckoutDTO';
import {CheckoutService} from '../../services/checkoutService/CheckoutService';
import {GeneralSettingDTO} from '../../../shared/Models/CustomerDTO';
import {FormsModule} from '@angular/forms';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  public isLoading = false;
  private checkoutService = inject(CheckoutService);
  private settingService = inject(SettingService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  checkoutData = signal<CheckoutDataDTO | null>(null);
  currencySymbol = signal<string>('$');
  currencySymbolPosition = signal<string>('BEFORE_PRICE');
  paymentMethod = signal<string>('');

  ngOnInit() {
    this.handleCurrencyFormating();
    this.loadCheckoutData();
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

  loadCheckoutData() {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.checkoutService.getCheckoutInfo().pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (data) => this.checkoutData.set(data),
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const msg = err.error?.message || err.error?.msg || 'Failed to load checkout information.';
        this.notification.notify(msg, 'danger');
      }
    });
  }

  placeOrderCOD() {
   this.isLoading = true;
   this.cdr.detectChanges();
   this.checkoutService.placeOrder().pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
     next:(data)=>{
       // this.notification.notify(data['message'],"success")
       this.router.navigate(['/ElectroCustomer/place-order'])
     },
     error: (err) => {
       this.isLoading = false;
       this.cdr.detectChanges();
      const msg = err.error?.message || err.error?.msg || 'Failed to place the order.';
      this.notification.notify(msg, 'danger');
    }
   })
  }
}