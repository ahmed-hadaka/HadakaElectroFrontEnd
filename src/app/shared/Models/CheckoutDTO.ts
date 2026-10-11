export interface CheckoutAddressDTO {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  countryName: string;
}

export interface CheckoutCartItemDTO {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  shippingCost: number;
}

export interface OrderSummaryInfoDTO {
  checkoutCartItemDTOS: CheckoutCartItemDTO[];
  orderTotalPrice: number;
  shippingTotalPrice: number;
  tax: number;
  paymentTotal: number;
  CODSupported: boolean;
  deliverDays:number;
  expectedDeliverDate:string;
}

export interface CheckoutDataDTO {
  defaultShippingAddress: CheckoutAddressDTO;
  orderSummaryInfo: OrderSummaryInfoDTO;
}
