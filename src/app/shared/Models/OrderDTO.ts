// customer dtos
export interface CustomerOrderListDTO {
  id: number;
  productsNames: string[];
  total: number;
  orderTime: string;
  status: OrderStatus;
}


export interface CustomerOrderDTO {
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
  subtotal: number;
  total: number;
  tax:number;
  orderDetails: OrderDetailDTO[];
  orderTracks: OrderTrackDTO[];
}

export interface CustomerOrderDetailDTO {
  productId: number;
  productName: string;
  mainImage: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CustomerOrderReturnReqDTO {
  orderId: number;
  reason: string;
  note?: string;
}

// shipper dtos
export interface ShipperOrderListDTO {
  id: number;
  customerName: string;
  total: number;
  orderTime: string;
  destination: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

// general dtos
export interface OrderListDTO {
  id: number;
  customerName: string;
  total: number;
  orderTime: string;
  destination: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

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
  RETURNED_REQUESTED = 'RETURNED_REQUESTED',
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

