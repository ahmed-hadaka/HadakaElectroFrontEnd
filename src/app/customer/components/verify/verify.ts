import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CustomerService } from '../../services/CustomerService/customer-service';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { CustomerNavBar } from '../customerNavBar/customer-nav-bar';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verify.html',
  styleUrl: './verify.css'
})
export class Verify {
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private notification = inject(NotificationService);

  message = signal('Verifying your account...');
  success = signal(false);

  ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) {
      this.message.set('Verification code is missing.');
      return;
    }

    this.customerService.verifyCustomer(code).subscribe({
      next: (response) => {
        this.success.set(true);
        this.message.set(response['message']);
        this.notification.notify(response['message'], 'success');
      },
      error: (err) => {
        const response = err.error?.message||err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while verifying';
        this.success.set(false);
        this.message.set(response);
        this.notification.notify(response, 'danger');
      }
    });
  }
}
