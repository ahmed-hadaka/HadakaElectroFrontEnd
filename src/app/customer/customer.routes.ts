import {Routes} from '@angular/router';
import {Login} from './components/login/login';
import {Register} from './components/register/register';
import {Home} from './components/home/home';
import {Verify} from './components/verify/verify';
import {Products} from './components/products/products';
import {ProductDetails} from './components/productDetails/product-details';
import {ForgotPassword} from './components/forgotPassword/forgot-password';
import {ResetPassword} from './components/resetPassword/reset-password';
import {CustomerDetails} from './components/customerDetails/customer-details';
import {ShoppingCart} from './components/shopping-cart/shopping-cart';
import {AddressForm} from './components/address-form/address-form';
import {AddressBook} from './components/address-book/address-book';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'categories',
    component: Home
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'customer-details',
    component: CustomerDetails
  },
  {
    path: 'forgot-password',
    component: ForgotPassword
  },
  {
    path: 'reset-password',
    component: ResetPassword
  },
  {
    path: 'verify',
    component: Verify
  },
  {
    path: 'categories/:id/products',
    component: Products
  },
  {
    path: 'products/:keyword',
    component: Products
  },
  {
    path: 'products/p/:id',
    component: ProductDetails
  },
  {
    path: 'cart',
    component: ShoppingCart
  },
  {
    path: 'address-book',
    component: AddressBook
  },
  {
    path: 'address-book/form/:id',
    component: AddressForm
  }
]
