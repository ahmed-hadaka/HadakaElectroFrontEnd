import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../services/CustomerService/customer-service';
import { LoginRequestDTO } from '../../../shared/Models/LoginRequestDTO';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { CustomerNavBar } from '../customerNavBar/customer-nav-bar';
import {AuthService} from '../../../shared/services/AuthService/auth-service';
import {environmentDev} from '../../../../environments/environment.dev';

// 1. Declare the google object loaded by the external script
declare var google: any;

@Component({
  imports: [ReactiveFormsModule, RouterLink, CustomerNavBar],
  selector: 'app-login',
  standalone: true,
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);


  loginReqForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: environmentDev.googleClientId, // Must match backend
      callback: this.handleGoogleCredential.bind(this)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn-container'),
      { theme: 'outline', size: 'large', width: 300 }
    );
  }

  private handleGoogleCredential(response: any) {
    const idToken = response.credential;

    this.authService.googleLogin(idToken).subscribe({
      next: (data) => {

        sessionStorage.setItem('customerEmail', data['Email']);
        sessionStorage.setItem('customerRole', data['Role']);

        this.loginReqForm.reset();

        this.router.navigate(['/ElectroCustomer']).then(()=>{
          // Full browser window refresh
          window.location.reload();
        })
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while Login with google';
        this.notification.notify(message,'danger')
      }
    })
  }

  onSubmit() {
    if (!this.loginReqForm.valid) {
      this.notification.notify('invalid input', 'danger');
      return;
    }

    const formValues = this.loginReqForm.value;
    const loginReqDTO: LoginRequestDTO = {
      email: formValues.email || '',
      password: formValues.password || '',
      rememberMe: formValues.rememberMe || false
    };

    const loginUrl = environmentDev.backendCustomerBaseUrl+'/auth/login';


    this.authService.login(loginReqDTO,loginUrl).subscribe({
      next: (data: Record<string, string>) => {

        sessionStorage.setItem('customerEmail', data['Email']);
        sessionStorage.setItem('customerRole', data['Role']);

        this.loginReqForm.reset();
        this.router.navigate(['/ElectroCustomer']).then(()=>{
          // Full browser window refresh
          window.location.reload();
        })
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while login';
        this.notification.notify(message, 'danger');
      }
    });
  }

}
