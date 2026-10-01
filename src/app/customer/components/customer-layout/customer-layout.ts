import {Component, inject, signal} from '@angular/core';
import {CustomerNavBar} from '../customerNavBar/customer-nav-bar';
import {RouterOutlet} from '@angular/router';
import {CsrfService} from '../../../shared/services/CsrfService/csrf-service';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';
import {GeneralSettingDTO} from '../../../shared/Models/CustomerDTO';
import {CustomerService} from '../../services/CustomerService/customer-service';

@Component({
  imports: [
    CustomerNavBar,
    RouterOutlet
  ],
  selector: 'app-customer-layout',
  styleUrl: './customer-layout.css',
  templateUrl: './customer-layout.html',
})
export class CustomerLayout {
  notification = inject(NotificationService)
  private  csrfService:CsrfService = inject(CsrfService);
  private customerService:CustomerService = inject(CustomerService);
  copyrights = signal('');

  ngOnInit() {
    if(!sessionStorage.getItem("siteSettings")) {
      this.loadSettings();
    }

    this.loadCopyrights();

    this.csrfService.getCsrfToken('CUSTOMER')?.subscribe();

    const pendingMessage = sessionStorage.getItem('logoutMessage');
    if (pendingMessage) {
      this.notification.notify(pendingMessage, 'success');
      sessionStorage.removeItem('logoutMessage');
    }
  }

  private loadSettings() {
    this.customerService.getGeneralSettings().subscribe({
      next: (settings: GeneralSettingDTO[]) => {
        sessionStorage.setItem('siteSettings', JSON.stringify(settings));
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while loading settings.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  private loadCopyrights() {
    const settings: GeneralSettingDTO[] = JSON.parse(sessionStorage.getItem('siteSettings')!);

    const copyrightSetting = settings?.find(setting => setting.key === 'COPYRIGHT');

    if (copyrightSetting) {
      this.copyrights.set(copyrightSetting.value);
    }
  }
}
