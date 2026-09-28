import { Routes } from '@angular/router';
import {Login} from './internal/components/login/login';
import {ListUsers} from './internal/components/listUsers/list-users';
import {UserDetails} from './internal/components/userDetails/user-details';
import {ListProducts} from './internal/components/listProducts/list-products';
import {ListCategories} from './internal/components/listCategories/list-categories';
import {ListBrands} from './internal/components/listBrands/list-brands';
import {ProductDetails} from './internal/components/productDetails/product-details';
import {CategoryDetails} from './internal/components/categoryDetails/category-details';
import {BrandDetails} from './internal/components/brandDetails/brand-details';
import {InternalLayout} from './internal/components/internal-layout/internal-layout';
import {CustomerLayout} from './customer/components/customer-layout/customer-layout';

export const routes: Routes = [
  {
    path: 'ElectroInternal',
    component:InternalLayout,
    loadChildren: () => import('./internal/internal.routes').then(m => m.INTERNAL_ROUTES)
  },
  {
    path: 'ElectroCustomer',
    component:CustomerLayout,
    loadChildren: () => import('./customer/customer.routes').then(m => m.CUSTOMER_ROUTES)
  }

];
