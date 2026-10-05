import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {ShippingRateService} from '../../services/shippingRateService/shipping-rate-service';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';
import {ShippingRateDTO} from '../../../shared/Models/ShippingRateDTO';
import {SettingCountryDTO, SettingStateDTO} from '../../../shared/Models/SettingDTO';
import {SettingService} from '../../services/SettingService/setting.service';


@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  selector: 'app-shipping-rate-details',
  styleUrl: './shipping-rate-details.css',
  templateUrl: './shipping-rate-details.html',
})
export class ShippingRateDetails {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private shippingRateService = inject(ShippingRateService);
  private sittingService = inject(SettingService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  rateDtoSignal = signal<ShippingRateDTO | null>(null);

  countriesSignal = signal<SettingCountryDTO[]>([]);
  statesSignal = signal<SettingStateDTO[]>([]);

  // Flags to control whether to show a <select> or <input>
  showCountrySelect = signal<boolean>(true);
  showStateSelect = signal<boolean>(true);

  protected rateForm = this.fb.group({
    id: [0],
    country: ['', Validators.required],
    state: ['', Validators.required],
    rate: [0, [Validators.required, Validators.min(0)]],
    days: [0, [Validators.required, Validators.min(0)]],
    codSupported: [false]
  });

  ngOnInit() {
    // Load countries first to evaluate whether existing records match known lists
    this.sittingService.getCountries().subscribe({
      next: (countries) => {
        this.countriesSignal.set(countries);
        this.checkRouteParams();
      },
      error: (err) => {
        this.notification.notify('Failed to load countries.', 'danger');
        this.checkRouteParams();
      }
    });
  }

  private checkRouteParams() {
    this.route.paramMap.subscribe(params => {
      const rateId = Number(params.get('id'));

      if (rateId !== null && rateId > 0) {
        this.loadRate(rateId);
      } else {
        this.rateForm.reset({ id: 0, codSupported: false });
        this.rateDtoSignal.set(null);
        this.showCountrySelect.set(true);
        this.showStateSelect.set(true);
      }
    });
  }

  private loadRate(id: number) {
    this.shippingRateService.getShippingRateById(id).subscribe({
      next: (data) => {
        this.rateDtoSignal.set(data);

        const knownCountry = this.countriesSignal().find(c => c.name === data.country);

        if (knownCountry) {
          this.showCountrySelect.set(true);

          // Load states for the known country
          this.sittingService.getStates(knownCountry.id!).subscribe({
            next: (states) => {
              this.statesSignal.set(states);
              const knownState = states.some(s => s.name === data.state);
              this.showStateSelect.set(knownState);
              this.patchFormValues(data);
            }
          });
        } else {
          // If country isn't in DB, display as inputs
          this.showCountrySelect.set(false);
          this.showStateSelect.set(false);
          this.patchFormValues(data);
        }
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || 'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  private patchFormValues(data: ShippingRateDTO) {
    this.rateForm.patchValue({
      id: data.id,
      country: data.country,
      state: data.state,
      rate: data.rate,
      days: data.days,
      codSupported: data.codSupported
    });
  }

  protected onCountryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const countryName = selectElement.value;

    this.rateForm.patchValue({ state: '' });
    this.statesSignal.set([]);
    this.showStateSelect.set(true);

    if (!countryName) return;

    const country = this.countriesSignal().find(c => c.name === countryName);
    if (country) {
      this.sittingService.getStates(country.id!).subscribe({
        next: (states) => {
          this.statesSignal.set(states);
          if (states.length === 0) {
            this.showStateSelect.set(false);
          }
        }
      });
    }
  }

  protected onSubmit() {
    if (this.rateForm.invalid) {
      this.rateForm.markAllAsTouched();
      this.notification.notify("Error in input fields. Please provide valid inputs.", 'danger');
      return;
    }

    const payload = { ...this.rateForm.value } as ShippingRateDTO;

    if (!payload.id) {
      payload.id = 0;
    }

    this.shippingRateService.saveShippingRate(payload).subscribe({
      next: (data: string | any) => {
        const msg = typeof data === 'string' ? data : data.message;
        this.notification.notify(msg, 'success');
        this.router.navigate(['ElectroInternal/shipping-rates']);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }
}
