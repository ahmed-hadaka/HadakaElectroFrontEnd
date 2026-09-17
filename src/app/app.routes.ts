import { Routes } from '@angular/router';
import {Login} from './components/login/login';
import {ListUsers} from './components/listUsers/list-users';
import {UserDetails} from './components/userDetails/user-details';
import {ListProducts} from './components/listProducts/list-products';
import {ListCategories} from './components/listCategories/list-categories';
import {ListBrands} from './components/listBrands/list-brands';
import {ProductDetails} from './components/productDetails/product-details';
import {CategoryDetails} from './components/categoryDetails/category-details';
import {BrandDetails} from './components/brandDetails/brand-details';

export const routes: Routes = [
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
  }
];
