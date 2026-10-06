import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {AddressService} from '../../services/addressBookService/address-book-service';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';
import {SettingService} from '../../../internal/services/SettingService/setting.service';
import {SettingCountryDTO, SettingStateDTO} from '../../../shared/Models/SettingDTO';
import {AddressDTO} from '../../../shared/Models/AddressDTO';
import {CustomerService} from '../../services/CustomerService/customer-service';
import {CountryDTO, StateDTO} from '../../../shared/Models/CustomerDTO';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './address-form.html',
  styleUrl: './address-form.css'
})
export class AddressForm implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private addressService = inject(AddressService);
  private customerService = inject(CustomerService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  countriesSignal = signal<CountryDTO[]>([]);
  statesSignal = signal<StateDTO[]>([]);
  showStateSelect = signal<boolean>(true);
  isEditMode = signal<boolean>(false);

  protected form = this.fb.group({
    id: [0],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    city: ['', Validators.required],
    countryId: [0, Validators.required],
    state: ['', Validators.required],
    postalCode: ['', Validators.required],
    defaultForShipping: [{ value: false, disabled: true }]  });

  ngOnInit() {
    this.customerService.getCountries().subscribe({
      next: (countries) => {
        this.countriesSignal.set(countries);
        this.checkRoute();
      }
    });
  }

  private checkRoute() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id > 0) {
        this.isEditMode.set(true);
        this.loadAddress(id);
      } else {
        this.isEditMode.set(false);
        this.form.patchValue({ id: 0 });
      }
    });
  }

  private loadAddress(id: number) {
    this.addressService.getAddress(id).subscribe({
      next: (addr) => {
        this.form.patchValue({
          id: addr.id,
          firstName: addr.firstName,
          lastName: addr.lastName,
          phoneNumber: addr.phoneNumber,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          city: addr.city,
          countryId: addr.countryId,
          state: addr.state,
          postalCode: addr.postalCode,
          defaultForShipping:addr.defaultForShipping
        });
        this.loadStatesForCountry(addr.countryId, addr.state);
      },
      error: (err) => this.notification.notify('Failed to load address', 'danger')
    });
  }

  onCountryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const countryId = Number(selectElement.value);
    this.form.patchValue({ state: '' });
    this.loadStatesForCountry(countryId, '');
  }

  private loadStatesForCountry(countryId: number, existingState: string) {
    if (!countryId) {
      this.statesSignal.set([]);
      this.showStateSelect.set(true);
      return;
    }
    const country = this.countriesSignal().find(c => c.id === countryId);

    if(country){
      const states = country.states;
      this.statesSignal.set(states)
      this.showStateSelect.set(states.length > 0);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.notify("Please fill all required fields.", 'danger');
      return;
    }

    const formValues = this.form.getRawValue();

    const payload: AddressDTO = {
      id: formValues.id || 0,
      firstName: formValues.firstName!,
      lastName: formValues.lastName!,
      phoneNumber: formValues.phoneNumber!,
      addressLine1: formValues.addressLine1!,
      addressLine2: formValues.addressLine2!,
      city: formValues.city!,
      state: formValues.state!,
      postalCode: formValues.postalCode!,
      defaultForShipping: formValues.defaultForShipping || false,
      countryId: Number(formValues.countryId!)
    };

    this.addressService.saveAddress(payload).subscribe({
      next: (msg) => {
        this.notification.notify(msg, 'success');
        this.router.navigate(['/ElectroCustomer/address-book']);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || 'An error occurred';
        this.notification.notify(message, 'danger');
      }
    });
  }
}
