import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerNavBar } from '../customerNavBar/customer-nav-bar';
import { CustomerService } from '../../services/CustomerService/customer-service';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import {CountryDTO, CustomerDTO} from '../../../shared/Models/CustomerDTO';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CustomerNavBar],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css'
})
export class CustomerDetails {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private notification = inject(NotificationService);

    loading = signal(true);
  customer = signal<CustomerDTO | null>(null);
  countries = signal<CountryDTO[]>([]);
  states = signal<string[]>([]);

  customerDetailsForm = this.fb.group({
    id:[0],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
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
    const customerEmail = sessionStorage.getItem('customerEmail') || '';
    this.customerDetailsForm.patchValue({ email: customerEmail });

    const emailControl = this.customerDetailsForm.get('email');
    emailControl?.markAsTouched();

    if (!customerEmail || emailControl?.invalid) {
      this.loading.set(false);
      this.notification.notify('Please use a valid logged-in customer email.', 'danger');
      return;
    }

    this.loadCustomer(customerEmail);
    this.loadCountries();
  }

  loadCountries(){
    this.customerService.getCountries().subscribe({
      next: (countries) => {
        this.countries.set(countries);
        if (countries.length > 0) {
          const country = countries.find(c => c.id === this.customer()?.countryId)
          const states = country?.states || [];
          this.states.set(states.map((state) => state.name));
          this.customerDetailsForm.patchValue({ countryId: this.customer()?.countryId, state: this.customer()?.state});
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

    private loadCustomer(customerEmail: string) {
    this.customerService.getCustomerDetails(customerEmail).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.customerDetailsForm.patchValue({
          id:customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber,
          addressLine1: customer.addressLine1,
          addressLine2: customer.addressLine2 || '',
          city: customer.city,
          state: customer.state,
          postalCode: customer.postalCode,
          countryId: customer.countryId
        });
        this.loading.set(false);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while fetching customer';
        this.notification.notify(message, 'danger');
        this.loading.set(false);
      }
    });
  }

  onCountryChange(countryId: string | number) {
    const selectedCountry = this.countries().find((country) => country.id === Number(countryId));
    this.states.set(selectedCountry ? selectedCountry.states.map((state) => state.name) : []);
    this.customerDetailsForm.patchValue({ state: this.states()[0]});
  }

  onSubmit() {
    if (!this.customerDetailsForm.valid) {
      this.notification.notify('invalid input', 'danger');
      return;
    }

    const formValues = this.customerDetailsForm.value;
    const payload: CustomerDTO = {
      id:formValues.id||0,
      email: this.customer()?.email || '',// can't be changed here
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

    this.customerService.updateCustomer(payload).subscribe({
      next: (message) => {
        this.notification.notify(message['message'], 'success');
        this.router.navigate(['/ElectroCustomer/']);
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
