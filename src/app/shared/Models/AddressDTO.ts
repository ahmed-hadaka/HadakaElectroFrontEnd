export interface AddressDTO {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  defaultForShipping: boolean;
  countryId: number;
  countryName?: string;
}
