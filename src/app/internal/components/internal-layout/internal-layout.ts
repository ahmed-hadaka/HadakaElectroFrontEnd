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


  ngOnInit() {
    this.csrfService.getCsrfToken('INTERNAL')?.subscribe();

    const pendingMessage = sessionStorage.getItem('logoutMessage');

    if (pendingMessage) {
      this.notification.notify(pendingMessage, 'success');
      sessionStorage.removeItem('logoutMessage');
    }
  }

}
