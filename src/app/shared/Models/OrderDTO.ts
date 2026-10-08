export type PaymentMethod = string;
export type OrderStatus = string;

export interface OrderListDTO {
  id: number;
  customerName: string;
  total: number;
  orderTime: string;
  destination: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

export interface OrderDetailDTO {
  productId: number;
  productName: string;
  mainImage?: string;
  quantity: number;
  productCost: number;
  unitPrice: number;
  shippingCost: number;
  subtotal: number;
}

export interface OrderDTO {
  id: number;
  orderTime: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhoneNumber: string;
  recipientName: string;
  recipientPhoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  shippingCost: number;
  productCost: number;
  subtotal: number;
  total: number;
  tax:number;
  deliverDays:number;
  deliverDate:string;
  orderDetails: OrderDetailDTO[];
}
