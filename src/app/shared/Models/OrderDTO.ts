// export type PaymentMethod = string;
// export type OrderStatus = string;
// //
export interface OrderListDTO {
  id: number;
  customerName: string;
  total: number;
  orderTime: string;
  destination: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}
//
// export interface OrderDetailDTO {
//   productId: number;
//   productName: string;
//   mainImage?: string;
//   quantity: number;
//   productCost: number;
//   unitPrice: number;
//   shippingCost: number;
//   subtotal: number;
// }
//
// export interface OrderDTO {
//   id: number;
//   orderTime: string;
//   customerId: number;
//   customerName: string;
//   customerEmail: string;
//   customerPhoneNumber: string;
//   recipientName: string;
//   recipientPhoneNumber: string;
//   addressLine1: string;
//   addressLine2?: string;
//   city: string;
//   state: string;
//   postalCode: string;
//   country: string;
//   paymentMethod: PaymentMethod;
//   status: OrderStatus;
//   shippingCost: number;
//   productCost: number;
//   subtotal: number;
//   total: number;
//   tax:number;
//   deliverDays:number;
//   expectedDeliverDate:string;
//   orderDetails: OrderDetailDTO[];
// }


export enum PaymentMethod {
  COD = 'COD',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum OrderStatus {
  NEW = 'NEW',
  CANCELED = 'CANCELED',
  PROCESSING = 'PROCESSING',
  PACKAGED = 'PACKAGED',
  PICKED = 'PICKED',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export interface OrderDetailDTO {
  productId: number;
  productName: string;
  mainImage: string;
  quantity: number;
  productCost: number;
  unitPrice: number;
  shippingCost: number;
  subtotal: number;
}

export interface OrderTrackDTO {
  orderId: number;
  orderStatus: OrderStatus;
  updatedAt:string;
  notes: string;
}

export interface OrderDTO {
  id: number;
  orderTime: string;
  customerId?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhoneNumber?: string | null;
  recipientName: string;
  recipientPhoneNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  deliverDays: number;
  expectedDeliverDate?: string | null;
  shippingCost: number;
  productCost: number;
  subtotal: number;
  total: number;
  tax:number;
  orderDetails: OrderDetailDTO[];
  orderTracks: OrderTrackDTO[];
}

