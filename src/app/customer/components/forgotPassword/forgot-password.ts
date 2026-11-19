import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../services/CustomerService/customer-service';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  private cdr = inject(ChangeDetectorRef);
  public isLoading = false;
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private notification = inject(NotificationService);

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {
    if (!this.forgotPasswordForm.valid) {
      this.notification.notify('Please enter a valid email address.', 'danger');
      return;
    }

    const email = this.forgotPasswordForm.value.email || '';
    this.isLoading = true;
    this.cdr.detectChanges();
    this.customerService.requestPasswordReset(email).pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (message) => {
        this.notification.notify(message['message'], 'success');
        this.forgotPasswordForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while request reset password';
        this.notification.notify(message, 'danger');
      }
    });
  }
}