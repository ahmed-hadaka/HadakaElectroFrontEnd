import {Component, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {CustomerService} from '../../services/CustomerService/customer-service';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';
import {environmentDev} from '../../../../environments/environment.dev';
import {AuthService} from '../../../shared/services/AuthService/auth-service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-customer-nav-bar',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './customer-nav-bar.html',
  styleUrl: './customer-nav-bar.css'
})
export class CustomerNavBar {
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private authService = inject(AuthService)

  userEmail = signal(sessionStorage.getItem('customerEmail') || '');

  ngOnInit() {
    this.userEmail.set(sessionStorage.getItem('customerEmail') || '');
  }


  //if session returns string so,first ! => !(string) = !(true) => false
  // second ! => !(false) => true;
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('customerEmail');
  }


  private navigate(data: Record<string, string>) {
    sessionStorage.clear();
    this.userEmail.set('');
    sessionStorage.setItem('logoutMessage', data['message']);

    this.router.navigate(['/ElectroCustomer/login']).then(() => {
      window.location.reload();
    });
  }

  logout() {
    const logoutUrl = environmentDev.backendCustomerBaseUrl + '/auth/logout';

    this.authService.logout(logoutUrl).subscribe({
      next: (data) => {
        this.navigate(data)
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while logging out';

        this.notification.notify(message, 'danger')
      }
    })
  }


  protected onSearch(keyword: string) {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      this.router.navigate([`/ElectroCustomer/products/${keyword}`])
    }
  }
}
