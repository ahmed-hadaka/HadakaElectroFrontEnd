import { Page } from './PageModel';
import { CategoryListDTO } from './CategoryDTO';
import { ProductDTO } from './ProductDTO';

export interface StateDTO {
  id: number;
  name: string;
}

export interface CountryDTO {
  id: number;
  name: string;
  code: string;
  states: StateDTO[];
}


export interface CustomerDTO {
  id: number;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  enabled?:boolean,
  city: string;
  state: string;
  postalCode: string;
  countryId: number;
}

export interface GeneralSettingDTO {
  key: string;
  value: string;
  category: string;
}

export interface CustomerProductListDTO {
  id: number;
  name: string;
  alias: string;
  price: number;
  priceAfterDiscount: number;
  mainImage?: string;
}

export interface CustomerCategoryProductsResponse {
  parentCategories: CategoryListDTO[];
  products: Page<CustomerProductListDTO>;
}

export interface CustomerProductDetailResponse {
  parentCategories: CategoryListDTO[];
  productDTO: ProductDTO;
}

export interface PasswordResetRequestDTO {
  customerEmail: string;
}

export interface ResetPasswordDTO {
  resetPasswordToken: string;
  password: string;
}
