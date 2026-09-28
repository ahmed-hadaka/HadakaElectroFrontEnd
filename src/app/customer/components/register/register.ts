import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../services/CustomerService/customer-service';
import { CountryDTO, CustomerDTO } from '../../../shared/Models/CustomerDTO';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { CustomerNavBar } from '../customerNavBar/customer-nav-bar';
import {form} from '@angular/forms/signals';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CustomerNavBar],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  countries = signal<CountryDTO[]>([]);
  states = signal<string[]>([]);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    addressLine1: ['', [Validators.required]],
    addressLine2: [''],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    countryId: [0, [Validators.required]]
  });

  ngOnInit() {
   this.loadCountries();
  }

  loadCountries(){
    this.customerService.getCountries().subscribe({
      next: (countries) => {
        this.countries.set(countries);
        if (countries.length > 0) {
          this.states.set(countries[0].states.map((state) => state.name));
          this.registerForm.patchValue({ countryId: countries[0].id, state: this.states()[0]});
        }
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while loading countries';
        this.notification.notify(message, 'danger');
      }
    });
  }

  onCountryChange(countryId: string | number) {
    const selectedCountry = this.countries().find((country) => country.id === Number(countryId));
    this.states.set(selectedCountry ? selectedCountry.states.map((state) => state.name) : []);
    this.registerForm.patchValue({ state: this.states()[0]});
  }

  onSubmit() {
    if (!this.registerForm.valid) {
      this.notification.notify('invalid input', 'danger');
      return;
    }

    const formValues = this.registerForm.value;
    const payload: CustomerDTO = {
      id:0,
      email: formValues.email || '',
      password: formValues.password || '',
      firstName: formValues.firstName || '',
      lastName: formValues.lastName || '',
      phoneNumber: formValues.phoneNumber || '',
      addressLine1: formValues.addressLine1 || '',
      addressLine2: formValues.addressLine2 || '',
      city: formValues.city || '',
      state: formValues.state || '',
      postalCode: formValues.postalCode || '',
      countryId: Number(formValues.countryId || 0)
    };

    this.customerService.saveCustomer(payload).subscribe({
      next: (message) => {
        this.notification.notify(message['message'], 'success');
        this.router.navigate(['/ElectroCustomer/login']);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while saving customer';
        this.notification.notify(message, 'danger');
      }
    });
  }
}
