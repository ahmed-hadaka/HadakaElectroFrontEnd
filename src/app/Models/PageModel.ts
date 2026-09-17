
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  curPage: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export const APP_ROLES: Role[] = [
  {
    id: 1,
    name: 'Admin',
    description: 'manage everything'
  },
  {
    id: 2,
    name: 'Salesperson',
    description: 'manage product price, customers, shipping, orders and sales reports'
  },
  {
    id: 3,
    name: 'Editor',
    description: 'manage categories, brands, products, articles and menus'
  },
  {
    id: 4,
    name: 'Shipper',
    description: 'view products, view orders and update order status'
  },
  {
    id: 5,
    name: 'Assistant',
    description: 'manage questions and reviews'
  }
];

export interface UserDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  password?: string;
  photo?: string;
  roles: Role[];
}
