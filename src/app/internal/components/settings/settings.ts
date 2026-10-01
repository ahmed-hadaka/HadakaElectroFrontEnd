import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import {
  CurrencyDTO,
  GeneralAndCurrencySettingsResponse,
  SettingCountryDTO,
  SettingDTO,
  SettingStateDTO
} from '../../../shared/Models/SettingDTO';
import { SettingService } from '../../services/SettingService/setting.service';
import { environmentDev } from '../../../../environments/environment.dev';

type TabType = 'general' | 'countries' | 'states' | 'mail-server' | 'mail-templates' | 'payment';
type MailTemplateTabType = 'customer-verification' | 'order-confirmation' | 'customer-reset-password';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  imports: [ReactiveFormsModule]
})
export class Settings {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private settingService = inject(SettingService);

  protected activeTab = signal<TabType>('general');
  protected activeMailTemplateTab = signal<MailTemplateTabType>('customer-verification');

  protected generalSettingsSignal = signal<SettingDTO[]>([]);
  protected mailServerSettingsSignal = signal<SettingDTO[]>([]);
  protected mailTemplatesSettingsSignal = signal<SettingDTO[]>([]);
  protected currenciesSignal = signal<CurrencyDTO[]>([]);

  protected countriesSignal = signal<SettingCountryDTO[]>([]);
  protected selectedCountryIdSignal = signal<number | null>(null);

  protected statesSignal = signal<SettingStateDTO[]>([]);
  protected selectedCountryForStatesSignal = signal<number | null>(null);
  protected selectedStateIdSignal = signal<number | null>(null);

  protected siteLogoFile: File | null = null;
  protected siteLogoPreviewUrl = signal<string>('/siteLogo.png');
  private siteLogoBasePath = environmentDev.backendInternalBaseUrl + '/default_images/siteLogos/';

  protected generalForm = this.fb.group({
    siteName: ['', Validators.required],
    copyright: ['', Validators.required],
    currencySymbol: ['', Validators.required],
    currencySymbolPosition: ['BEFORE_PRICE', Validators.required],
    decimalPointType: ['POINT', Validators.required],
    decimalDigits: ['2', Validators.required],
    thousandsPointType: ['COMMA', Validators.required]
  });

  protected countryForm = this.fb.group({
    id: [null as number | null],
    name: ['', Validators.required],
    code: ['', [Validators.required, Validators.maxLength(3)]]
  });

  protected stateForm = this.fb.group({
    id: [null as number | null],
    name: ['', Validators.required]
  });

  protected mailServerForm = this.fb.group({
    mailHost: ['', Validators.required],
    mailPort: ['', Validators.required],
    mailUsername: ['', Validators.required],
    mailPassword: ['', Validators.required],
    smtpAuth: ['true', Validators.required],
    smtpSecured: ['true', Validators.required],
    mailFrom: ['', Validators.required],
    mailSenderName: ['', Validators.required]
  });

  protected mailTemplatesForm = this.fb.group({
    customerVerifySubject: ['', Validators.required],
    customerVerifyContent: ['', Validators.required],
    orderConfirmSubject: [''],
    orderConfirmContent: [''],
    // orderConfirmSubject: ['', Validators.required],
    // orderConfirmContent: ['', Validators.required],
    customerResetPasswordSubject: ['', Validators.required],
    customerResetPasswordContent: ['', Validators.required]
  });

  ngOnInit() {
    this.loadGeneralAndCurrencies();
    this.loadCountries();
    this.loadMailServerSettings();
    this.loadMailTemplateSettings();
  }

  protected setTab(tab: TabType) {
    this.activeTab.set(tab);
  }

  protected setMailTemplateTab(tab: MailTemplateTabType) {
    this.activeMailTemplateTab.set(tab);
  }

  // --- GENERAL SETTINGS ---
  private loadGeneralAndCurrencies() {
    this.settingService.getGeneralAndCurrencySettings().subscribe({
      next: (data: GeneralAndCurrencySettingsResponse) => {
        this.generalSettingsSignal.set(data.generalSettings || []);
        this.currenciesSignal.set(data.currencyList || []);
        this.patchGeneralForm();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to load general settings.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  private patchGeneralForm() {
    const getValue = (key: string): string => this.getSettingValue(this.generalSettingsSignal(), key, '');

    const logoName = getValue('SITE_LOGO');
    if (logoName) {
      this.siteLogoPreviewUrl.set(`${this.siteLogoBasePath}${logoName}`);
    }

    this.generalForm.patchValue({
      siteName: getValue('SITE_NAME'),
      copyright: getValue('COPYRIGHT'),
      currencySymbol: getValue('CURRENCY_SYMBOL'),
      currencySymbolPosition: getValue('CURRENCY_SYMBOL_POSITION') || 'BEFORE_PRICE',
      decimalPointType: getValue('DECIMAL_POINT_TYPE') || 'POINT',
      decimalDigits: getValue('DECIMAL_DIGITS') || '2',
      thousandsPointType: getValue('THOUSANDS_POINT_TYPE') || 'COMMA'
    });
  }

  protected onSiteLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.siteLogoFile = input.files[0];
      this.siteLogoPreviewUrl.set(URL.createObjectURL(this.siteLogoFile));
    }
  }

  protected saveGeneralSettings() {
    if (this.generalForm.invalid) {
      this.generalForm.markAllAsTouched();
      this.notification.notify('Please provide valid general settings.', 'danger');
      return;
    }

    const formValues = this.generalForm.value;
    const updated: Record<string, string> = {
      SITE_NAME: formValues.siteName || '',
      COPYRIGHT: formValues.copyright || '',
      CURRENCY_SYMBOL: formValues.currencySymbol || '',
      CURRENCY_SYMBOL_POSITION: formValues.currencySymbolPosition || 'BEFORE_PRICE',
      DECIMAL_POINT_TYPE: formValues.decimalPointType || 'POINT',
      DECIMAL_DIGITS: formValues.decimalDigits || '2',
      THOUSANDS_POINT_TYPE: formValues.thousandsPointType || 'COMMA'
    };

    if (this.siteLogoFile) {
      updated['SITE_LOGO'] = this.siteLogoFile.name;
    }

    const payload = this.buildSettingsPayload(this.generalSettingsSignal(), updated, 'GENERAL');

    this.settingService.updateGeneralSettings(payload, this.siteLogoFile).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.loadGeneralAndCurrencies();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to update general settings.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  // --- COUNTRIES ---
  private loadCountries() {
    this.settingService.getCountries().subscribe({
      next: (countries) => {
        this.countriesSignal.set(countries || []);
        if (this.selectedCountryForStatesSignal()) {
          this.loadStatesOfSelectedCountry();
        }
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to load countries.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected refreshCountryList() {
    this.loadCountries();
  }

  protected selectCountry(country: SettingCountryDTO) {
    this.selectedCountryIdSignal.set(country.id);
    this.countryForm.patchValue({
      id: country.id,
      name: country.name,
      code: country.code
    });
  }

  protected addCountry() {
    if (this.countryForm.invalid) {
      this.countryForm.markAllAsTouched();
      this.notification.notify('Country name and code are required.', 'danger');
      return;
    }

    const formValues = this.countryForm.value;
    const payload: SettingCountryDTO = {
      id: 0,
      name: (formValues.name || '').trim(),
      code: (formValues.code || '').trim().toUpperCase()
    };

    this.settingService.saveCountry(payload).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.countryForm.reset({ id: null, name: '', code: '' });
        this.selectedCountryIdSignal.set(null);
        this.loadCountries();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to save country.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected updateCountry() {
    if (this.countryForm.invalid || !this.selectedCountryIdSignal()) {
      this.notification.notify('Select a country and provide valid values first.', 'danger');
      return;
    }

    const formValues = this.countryForm.value;
    const payload: SettingCountryDTO = {
      id: this.selectedCountryIdSignal(),
      name: (formValues.name || '').trim(),
      code: (formValues.code || '').trim().toUpperCase()
    };

    this.settingService.saveCountry(payload).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.loadCountries();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to update country.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected deleteCountry() {
    const countryId = this.selectedCountryIdSignal();
    if (!countryId) {
      this.notification.notify('Select a country first.', 'danger');
      return;
    }

    this.settingService.deleteCountry(countryId).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.countryForm.reset({ id: null, name: '', code: '' });
        this.selectedCountryIdSignal.set(null);
        this.loadCountries();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to delete country.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  // --- STATES ---
  protected onSelectedCountryForStatesChange(countryId: number | string) {
    const parsedId = Number(countryId);
    this.selectedCountryForStatesSignal.set(parsedId || null);
    this.selectedStateIdSignal.set(null);
    this.stateForm.reset({ id: null, name: '' });
    this.loadStatesOfSelectedCountry();
  }

  private loadStatesOfSelectedCountry() {
    const countryId = this.selectedCountryForStatesSignal();
    if (!countryId) {
      this.statesSignal.set([]);
      return;
    }

    this.settingService.getStates(countryId).subscribe({
      next: (states) => {
        this.statesSignal.set(states || []);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to load states.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected selectState(state: SettingStateDTO) {
    this.selectedStateIdSignal.set(state.id);
    this.stateForm.patchValue({
      id: state.id,
      name: state.name
    });
  }

  protected newState() {
    this.selectedStateIdSignal.set(null);
    this.stateForm.reset({ id: null, name: '' });
  }

  protected saveState() {
    const countryId = this.selectedCountryForStatesSignal();
    if (!countryId) {
      this.notification.notify('Select country first.', 'danger');
      return;
    }

    if (this.stateForm.invalid) {
      this.stateForm.markAllAsTouched();
      this.notification.notify('State name is required.', 'danger');
      return;
    }

    const formValues = this.stateForm.value;
    const payload: SettingStateDTO = {
      id: this.selectedStateIdSignal() || 0,
      name: (formValues.name || '').trim(),
      countryId
    };

    this.settingService.saveState(payload).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.newState();
        this.loadStatesOfSelectedCountry();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to save state.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected deleteState() {
    const stateId = this.selectedStateIdSignal();
    if (!stateId) {
      this.notification.notify('Select a state first.', 'danger');
      return;
    }

    this.settingService.deleteState(stateId).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.newState();
        this.loadStatesOfSelectedCountry();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to delete state.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  // --- MAIL SERVER ---
  private loadMailServerSettings() {
    this.settingService.getMailServerSettings().subscribe({
      next: (settings) => {
        this.mailServerSettingsSignal.set(settings || []);
        this.patchMailServerForm();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to load mail server settings.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  private patchMailServerForm() {
    const getValue = (key: string): string => this.getSettingValue(this.mailServerSettingsSignal(), key, '');

    this.mailServerForm.patchValue({
      mailHost: getValue('MAIL_HOST'),
      mailPort: getValue('MAIL_PORT'),
      mailUsername: getValue('MAIL_USERNAME'),
      mailPassword: getValue('MAIL_PASSWORD'),
      smtpAuth: getValue('SMTP_AUTH') || 'true',
      smtpSecured: getValue('SMTP_SECURED') || 'true',
      mailFrom: getValue('MAIL_FROM'),
      mailSenderName: getValue('MAIL_SENDER_NAME')
    });
  }

  protected saveMailServerSettings() {
    if (this.mailServerForm.invalid) {
      this.mailServerForm.markAllAsTouched();
      this.notification.notify('Please provide valid mail server settings.', 'danger');
      return;
    }

    const formValues = this.mailServerForm.value;
    const updated: Record<string, string> = {
      MAIL_HOST: formValues.mailHost || '',
      MAIL_PORT: formValues.mailPort || '',
      MAIL_USERNAME: formValues.mailUsername || '',
      MAIL_PASSWORD: formValues.mailPassword || '',
      SMTP_AUTH: formValues.smtpAuth || 'true',
      SMTP_SECURED: formValues.smtpSecured || 'true',
      MAIL_FROM: formValues.mailFrom || '',
      MAIL_SENDER_NAME: formValues.mailSenderName || ''
    };

    const payload = this.buildSettingsPayload(this.mailServerSettingsSignal(), updated, 'MAIL_SERVER');

    this.settingService.updateGeneralSettings(payload).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.loadMailServerSettings();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to update mail server settings.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  // --- MAIL TEMPLATES ---
  private loadMailTemplateSettings() {
    this.settingService.getMailTemplateSettings().subscribe({
      next: (settings) => {
        this.mailTemplatesSettingsSignal.set(settings || []);
        this.patchMailTemplateForm();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to load mail templates.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  private patchMailTemplateForm() {
    const getValue = (key: string): string => this.getSettingValue(this.mailTemplatesSettingsSignal(), key, '');

    this.mailTemplatesForm.patchValue({
      customerVerifySubject: getValue('CUSTOMER_VERIFY_SUBJECT'),
      customerVerifyContent: getValue('CUSTOMER_VERIFY_CONTENT'),
      orderConfirmSubject: getValue('ORDER_CONFIRM_SUBJECT'),
      orderConfirmContent: getValue('ORDER_CONFIRM_CONTENT'),
      customerResetPasswordSubject: getValue('CUSTOMER_RESET_PASSWORD_SUBJECT'),
      customerResetPasswordContent: getValue('CUSTOMER_RESET_PASSWORD_CONTENT')
    });
  }

  protected saveMailTemplateSettings() {
    if (this.mailTemplatesForm.invalid) {
      this.mailTemplatesForm.markAllAsTouched();
      this.notification.notify('Please provide valid mail template content.', 'danger');
      return;
    }

    const formValues = this.mailTemplatesForm.value;
    const updated: Record<string, string> = {
      CUSTOMER_VERIFY_SUBJECT: formValues.customerVerifySubject || '',
      CUSTOMER_VERIFY_CONTENT: formValues.customerVerifyContent || '',
      ORDER_CONFIRM_SUBJECT: formValues.orderConfirmSubject || '',
      ORDER_CONFIRM_CONTENT: formValues.orderConfirmContent || '',
      CUSTOMER_RESET_PASSWORD_SUBJECT: formValues.customerResetPasswordSubject || '',
      CUSTOMER_RESET_PASSWORD_CONTENT: formValues.customerResetPasswordContent || ''
    };

    const payload = this.buildSettingsPayload(this.mailTemplatesSettingsSignal(), updated, 'MAIL_TEMPLATES');

    this.settingService.updateGeneralSettings(payload).subscribe({
      next: (data) => {
        this.notification.notify('Mail templates updated successfully', 'success');
        this.loadMailTemplateSettings();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg || (typeof err.error === 'string' ? err.error : null) || 'Failed to update mail templates.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  // --- UTILS ---
  private buildSettingsPayload(existing: SettingDTO[], updates: Record<string, string>, defaultCategory: string): SettingDTO[] {
    const byKey = new Map(existing.map(setting => [setting.key, setting]));

    const payload: SettingDTO[] = [];
    for (const key of Object.keys(updates)) {
      const existingSetting = byKey.get(key);
      payload.push({
        key,
        value: updates[key],
        category: existingSetting?.category || defaultCategory
      });
    }

    return payload;
  }

  private getSettingValue(settings: SettingDTO[], key: string, fallback: string): string {
    return settings.find(setting => setting.key === key)?.value || fallback;
  }
}
