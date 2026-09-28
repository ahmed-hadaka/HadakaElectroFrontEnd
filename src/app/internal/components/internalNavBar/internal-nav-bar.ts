import {Component, inject, signal} from '@angular/core';
import {AuthService} from '../../../shared/services/AuthService/auth-service';
import {HttpErrorResponse} from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';
import {CsrfService} from '../../../shared/services/CsrfService/csrf-service';
import {UserService} from '../../services/UserService/user-service';
import {environmentDev} from '../../../../environments/environment.dev';

@Component({
  imports: [
    RouterLink,
  ],
  selector:'app-internal-nav-bar',
  styleUrl: './internal-nav-bar.css',
  templateUrl: './internal-nav-bar.html',
})
export class InternalNavBar {
  protected authService = inject(AuthService)
  private router = inject(Router);
  userEmailSignal = signal(sessionStorage.getItem('userEmail') || 'No Users');
  private notification = inject(NotificationService);
  private userService = inject(UserService);

  private navigate(data:Record<string, string>){
    sessionStorage.clear();

    sessionStorage.setItem('logoutMessage', data['message']);

    this.router.navigate(['ElectroInternal/']).then(() => {
      window.location.reload();
    });
  }

  logout() {
    const logoutUrl = environmentDev.backendInternalBaseUrl+'/auth/logout';

    this.authService.logout(logoutUrl).subscribe({
      next: (data) => {
        this.navigate(data)
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';

        this.notification.notify(message, 'danger')
      }
    })
  }

  protected exportUsersToPdf() {
    this.userService.exportUsersToPdf().subscribe({
      next: (blobData) => {
        const fileURL = URL.createObjectURL(blobData);
        window.open(fileURL, '_blank'); // Opens PDF in a new tab
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';

        this.notification.notify(message, 'danger')
      }
    })
  }

  protected getLoggedUser() {
    this.userService.getCurUser().subscribe({
      next: (userId) => {
        this.router.navigate(['ElectroInternal/users/user-details/', userId])
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';

        this.notification.notify(message, 'danger')
      }
    })
  }
}
