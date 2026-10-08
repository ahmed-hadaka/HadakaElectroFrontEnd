import {Component, inject, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {InternalNavBar} from '../internalNavBar/internal-nav-bar';
import {CsrfService} from '../../../shared/services/CsrfService/csrf-service';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';
import {GeneralSettingDTO} from '../../../shared/Models/CustomerDTO';
import {SettingService} from '../../services/SettingService/setting.service';
import {GeneralAndCurrencySettingsResponse, SettingDTO} from '../../../shared/Models/SettingDTO';

@Component({
  imports: [
    InternalNavBar
    ,RouterOutlet
  ],
  selector: 'app-internal-layout',
  styleUrl: './internal-layout.css',
  templateUrl: './internal-layout.html',
})
export class InternalLayout {
  notification = inject(NotificationService)
  private  csrfService:CsrfService = inject(CsrfService);
  private settingService = inject(SettingService);
  copyrights = signal('');

  ngOnInit() {

    if(!sessionStorage.getItem("siteSettings")) {
      this.loadSettings();
    }

    this.loadCopyrights();

    this.csrfService.getCsrfToken('INTERNAL')?.subscribe();

    const pendingMessage = sessionStorage.getItem('logoutMessage');

    if (pendingMessage) {
      this.notification.notify(pendingMessage, 'success');
      sessionStorage.removeItem('logoutMessage');
    }
  }

  private loadSettings() {
    this.settingService.getGeneralAndCurrencySettings().subscribe({
      next: (settings:GeneralAndCurrencySettingsResponse) => {
        sessionStorage.setItem('siteSettings', JSON.stringify(settings.generalSettings));
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
    const settings: SettingDTO[] = JSON.parse(sessionStorage.getItem('siteSettings')!);

    const copyrightSetting = settings?.find(setting => setting.key === 'COPYRIGHT');

    if (copyrightSetting) {
      this.copyrights.set(copyrightSetting.value);
    }
  }
}
