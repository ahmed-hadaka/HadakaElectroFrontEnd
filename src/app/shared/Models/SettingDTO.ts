export interface SettingDTO {
  key: string;
  value: string;
  category: string;
}

export interface CurrencyDTO {
  id: number;
  name: string;
  symbol: string;
  code: string;
}

export interface SettingCountryDTO {
  id: number | null;
  name: string;
  code: string;
}

export interface SettingStateDTO {
  id: number | null;
  name: string;
  countryId: number;
}

export interface GeneralAndCurrencySettingsResponse {
  generalSettings: SettingDTO[];
  currencyList: CurrencyDTO[];
}

