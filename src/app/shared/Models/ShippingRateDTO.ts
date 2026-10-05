export interface ShippingRateDTO {
  id: number;
  country: string;
  state: string;
  rate: number;
  days: number;
  codSupported: boolean;
}

export interface ShippingRatePageResponse {
  shippingRates: {
    content: ShippingRateDTO[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  };
}
