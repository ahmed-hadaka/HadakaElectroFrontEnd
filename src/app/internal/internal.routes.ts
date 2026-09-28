import {Routes} from '@angular/router';
import {Login} from './components/login/login';
import {ListUsers} from './components/listUsers/list-users';
import {ListProducts} from './components/listProducts/list-products';
import {ProductDetails} from './components/productDetails/product-details';
import {ListCategories} from './components/listCategories/list-categories';
import {CategoryDetails} from './components/categoryDetails/category-details';
import {ListBrands} from './components/listBrands/list-brands';
import {BrandDetails} from './components/brandDetails/brand-details';
import {UserDetails} from './components/userDetails/user-details';
import {ListCustomers} from './components/listCustomers/list-customers';
import {CustomerDetails} from './components/customerDetails/customer-details';
import {Settings} from './components/settings/settings';

export const INTERNAL_ROUTES: Routes = [
  {
    path:'',
    component: Login
  },
  {
    path:'users',
    component: ListUsers
  },
  {
    path:'users/user-details/:id',
    component: UserDetails
  },
  {
    path:'products',
    component: ListProducts
  },
  {
    path:'products/new-product',
    component: ProductDetails
  },
  {
    path:'products/edit/:id',
    component: ProductDetails
  },
  {
    path:'categories',
    component: ListCategories
  },
  {
    path:'categories/new-category',
    component: CategoryDetails
  },
  {
    path:'categories/edit/:id',
    component: CategoryDetails
  },
  {
    path:'brands',
    component: ListBrands
  },
  {
    path:'brands/new-brand',
    component: BrandDetails
  },
  {
    path:'brands/edit/:id',
    component: BrandDetails
  },
  {
    path:'customers',
    component:ListCustomers
  },
  {
    path:'customers/customer-details/:id',
    component:CustomerDetails
  },
  {
    path:'settings',
    component:Settings
  }
]
