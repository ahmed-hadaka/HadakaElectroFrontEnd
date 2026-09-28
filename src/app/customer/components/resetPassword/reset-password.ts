import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { CustomerService } from '../../services/CustomerService/customer-service';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { CustomerNavBar } from '../customerNavBar/customer-nav-bar';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CustomerNavBar],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private notification = inject(NotificationService);
  private router = inject(Router)
  resetToken = '';

  resetPasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    this.resetToken = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.resetToken) {
      this.notification.notify('Reset Email link is corrupted!.', 'danger');
    }
  }

  onSubmit() {
    if (!this.resetToken) {
      this.notification.notify('Reset Email link is corrupted!.', 'danger');
      return;
    }

    if (!this.resetPasswordForm.valid) {
      this.notification.notify('Please enter a valid password.', 'danger');
      return;
    }

    const password = this.resetPasswordForm.value.password || '';
    const confirmPassword = this.resetPasswordForm.value.confirmPassword || '';

    if (password !== confirmPassword) {
      this.notification.notify('Passwords do not match.', 'danger');
      return;
    }

    this.customerService.resetPassword({
      resetPasswordToken: this.resetToken,
      password
    }).subscribe({
      next: (message) => {
        this.notification.notify(message['message'], 'success');
        this.resetPasswordForm.reset();
        this.router.navigate(['/ElectroCustomer/login']);
        },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while reset password';
        this.notification.notify(message, 'danger');
      }
    });
  }
}
