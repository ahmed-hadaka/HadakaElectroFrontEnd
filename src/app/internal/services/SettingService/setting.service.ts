import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentDev } from '../../../../environments/environment.dev';
import {
  GeneralAndCurrencySettingsResponse,
  SettingCountryDTO,
  SettingDTO,
  SettingStateDTO
} from '../../../shared/Models/SettingDTO';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private settingApiBaseUrl = environmentDev.backendInternalBaseUrl + '/settings';

  constructor(private http: HttpClient) {}

  getGeneralAndCurrencySettings(): Observable<GeneralAndCurrencySettingsResponse> {
    return this.http.get<GeneralAndCurrencySettingsResponse>(`${this.settingApiBaseUrl}/general`);
  }

  updateGeneralSettings(updatedSettings: SettingDTO[], siteLogoFile?: File | null): Observable<string> {
    const formData = new FormData();
    const settingsJson = new Blob([JSON.stringify(updatedSettings)], { type: 'application/json' });
    formData.append('updated-settings', settingsJson);

    if (siteLogoFile) {
      formData.append('site-logo', siteLogoFile, siteLogoFile.name);
    }

    return this.http.post(`${this.settingApiBaseUrl}/update-general`, formData, { responseType: 'text' });
  }

  getCountries(): Observable<SettingCountryDTO[]> {
    return this.http.get<SettingCountryDTO[]>(`${this.settingApiBaseUrl}/countries`);
  }

  saveCountry(countryDto: SettingCountryDTO): Observable<string> {
    return this.http.post(`${this.settingApiBaseUrl}/save-country`, countryDto, { responseType: 'text' });
  }

  deleteCountry(countryId: number): Observable<string> {
    return this.http.delete(`${this.settingApiBaseUrl}/delete-country/${countryId}`, { responseType: 'text' });
  }

  getStates(countryId: number): Observable<SettingStateDTO[]> {
    return this.http.get<SettingStateDTO[]>(`${this.settingApiBaseUrl}/states/${countryId}`);
  }

  saveState(stateDto: SettingStateDTO): Observable<string> {
    return this.http.post(`${this.settingApiBaseUrl}/save-state`, stateDto, { responseType: 'text' });
  }

  deleteState(stateId: number): Observable<string> {
    return this.http.delete(`${this.settingApiBaseUrl}/delete-state/${stateId}`, { responseType: 'text' });
  }

  getMailServerSettings(): Observable<SettingDTO[]> {
    return this.http.get<SettingDTO[]>(`${this.settingApiBaseUrl}/mail-server`);
  }

  getMailTemplateSettings(): Observable<SettingDTO[]> {
    return this.http.get<SettingDTO[]>(`${this.settingApiBaseUrl}/mail-templates`);
  }
}
