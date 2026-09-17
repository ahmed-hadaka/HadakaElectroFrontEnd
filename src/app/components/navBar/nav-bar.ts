import {Component, inject, signal} from '@angular/core';
import {AuthService} from '../../services/AuthService/auth-service';
import {HttpErrorResponse} from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import {NotificationService} from '../../services/NotificationService/notification-service';
import {CsrfService} from '../../services/CsrfService/csrf-service';
import {UserService} from '../../services/UserService/user-service';

@Component({
  imports: [
    RouterLink
  ],
  selector: 'app-nav-bar',
  styleUrl: './nav-bar.css',
  templateUrl: './nav-bar.html',
})
export class NavBar {
  protected authService = inject(AuthService)
  private router = inject(Router);
  userEmailSignal = signal(sessionStorage.getItem('userEmail') || 'No Users');
  private notification = inject(NotificationService);
  private csrfService = inject(CsrfService)
  private userService = inject(UserService);

  private navigate(data:Record<string, string>){
    this.router.navigate(['/']).then(()=>{
      // alert(data['msg']);
      this.notification.notify(data['message'], 'success')
      sessionStorage.clear();
      // Full browser window refresh
      window.location.reload();

    })
  }

  logout() {
    this.authService.logout().subscribe({
      next: (data) => {

        this.csrfService.getCsrfToken().subscribe({
          next: () => this.navigate(data),
          error: () => this.navigate(data) // navigate regardless; don't strand the user on a CSRF fetch failure
        });
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
        this.router.navigate(['users/user-details/', userId])
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
