import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { CustomerDTO } from '../../../shared/Models/CustomerDTO';
import { CustomerService } from '../../services/CustomerService/customer-service';
import { SettingCountryDTO, SettingStateDTO } from '../../../shared/Models/SettingDTO';
import { SettingService } from '../../services/SettingService/setting.service';

@Component({
  selector: 'app-internal-customer-details',
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css',
  imports: [ReactiveFormsModule, RouterLink]
})
export class CustomerDetails {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private customerService = inject(CustomerService);
  private settingService = inject(SettingService);

  protected customerSignal = signal<CustomerDTO | null>(null);
  protected countriesSignal = signal<SettingCountryDTO[]>([]);
  protected statesSignal = signal<SettingStateDTO[]>([]);
  protected stateSignal = signal<string>('');

  protected customerForm = this.fb.group({
    id: [0],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    addressLine1: ['', [Validators.required]],
    enabled:[false,],
    addressLine2: [''],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    countryId: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit() {
    this.loadCountries();

    this.route.paramMap.subscribe(params => {
      const customerId = Number(params.get('id'));
      if (!customerId || customerId < 1) {
        this.notification.notify('Invalid customer ID.', 'danger');
        this.router.navigate(['ElectroInternal/customers']);
        return;
      }
      this.loadCustomer(customerId);
    });
  }

  private loadCountries() {
    this.settingService.getCountries().subscribe({
      next: (countries) => {
        this.countriesSignal.set(countries);
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Failed to load countries.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  private loadCustomer(customerId: number) {
    this.customerService.getCustomerById(customerId).subscribe({
      next: (customer) => {
        this.customerSignal.set(customer);
        this.customerForm.patchValue({
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber,
          addressLine1: customer.addressLine1,
          addressLine2: customer.addressLine2 || '',
          enabled: customer.enabled || false,
          city: customer.city,
          state: customer.state,
          postalCode: customer.postalCode,
          countryId: customer.countryId
        });
        this.onCountryChange(customer.countryId,customer.state, false);
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          `Failed to load customer : ${customerId}`;
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected onCountryChange(countryId: number | string,state = 'no states', resetSelectedState: boolean = true) {
    const parsedId = Number(countryId);
    if (!parsedId) {
      this.statesSignal.set([]);
      return;
    }

    this.settingService.getStates(parsedId).subscribe({
      next: (states) => {
        this.statesSignal.set(states);
        if (resetSelectedState) {
          if (resetSelectedState) {
            this.customerForm.patchValue({ state: '' });
          }
        }
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Failed to load country states.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected onSubmit() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      this.notification.notify('Please provide valid customer data.', 'danger');
      return;
    }

    const formValues = this.customerForm.value;
    const payload: CustomerDTO = {
      id: Number(formValues.id || 0),
      email: formValues.email || '',
      firstName: formValues.firstName || '',
      lastName: formValues.lastName || '',
      phoneNumber: formValues.phoneNumber || '',
      addressLine1: formValues.addressLine1 || '',
      addressLine2: formValues.addressLine2 || '',
      enabled:formValues.enabled || false,
      city: formValues.city || '',
      state: formValues.state || '',
      postalCode: formValues.postalCode || '',
      countryId: Number(formValues.countryId || 0)
    };

    const password = formValues.password?.trim() || '';
    if (password.length > 0) {
      payload.password = password;
    }

    this.customerService.updateCustomer(payload).subscribe({
      next: (message) => {
        this.notification.notify(message, 'success');
        this.router.navigate(['ElectroInternal/customers']);
      },
      error: (err) => {
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Failed to update customer.';
        this.notification.notify(message, 'danger');
      }
    });
  }
}

