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
import {ListShippingRates} from './components/listShippingRate/list-shipping-rate';
import {ShippingRateDetails} from './components/shippingRateDetails/shipping-rate-details';
import {ListOrders} from './components/listOrders/list-orders';
import {ViewOrderDetails} from './components/viewOrderDetails/view-order-details';
import {EditOrderDetails} from './components/edit-order-details/edit-order-details';
import {internalRoleGuard} from './internal-role-guard';
import {Welcome} from './components/dashboard/welcome';
import {SalesReportComponent} from './components/sales-report/sales-report';

export const INTERNAL_ROUTES: Routes = [
  {
    path:'',
    component: Login
  },
  {
    path:'dashboard',
    component: Welcome,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Editor','Salesperson','Shipper','Assistant'] }
  },
  {
    path:'users',
    component: ListUsers,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path:'users/user-details/:id',
    component: UserDetails,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Editor','Salesperson','Shipper','Assistant'] }
  },
  {
    path:'products',
    component: ListProducts,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Editor','Salesperson','Shipper'] }
  },
  {
    path:'products/new-product',
    component: ProductDetails,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Editor','Salesperson']}
  },
  {
    path:'products/edit/:id',
    component: ProductDetails,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Editor','Salesperson','Shipper'] }
  },
  {
    path:'categories',
    component: ListCategories,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Editor'] }

  },
  {
    path:'categories/new-category',
    component: CategoryDetails,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Editor'] }

  },
  {
    path:'categories/edit/:id',
    component: CategoryDetails,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Editor'] }

  },
  {
    path:'brands',
    component: ListBrands,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Editor'] }
  },
  {
    path:'brands/new-brand',
    component: BrandDetails,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Editor'] }
  },
  {
    path:'brands/edit/:id',
    component: BrandDetails,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Editor'] }
  },
  {
    path:'customers',
    component:ListCustomers,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Salesperson'] }
  },
  {
    path:'customers/customer-details/:id',
    component:CustomerDetails,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Salesperson'] }
  },
  {
    path:'settings',
    component:Settings,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path:'settings/general',
    component:Settings,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin', 'Shipper'] }
  },
  {
    path:'settings/countries',
    component:Settings,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin', 'Shipper'] }
  },
  {
    path:'shipping-rates',
    component:ListShippingRates,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Salesperson'] }
  },
  {
    path:'shipping-rates/rate-details/:id',
    component:ShippingRateDetails,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Salesperson'] }
  },
  {
    path:'orders',
    component:ListOrders,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Salesperson','Shipper'] }
  },
  {
    path:'orders/view-order-details/:id',
    component:ViewOrderDetails,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Salesperson','Shipper'] }
  },
  {
    path:'orders/edit-order-details/:id',
    component:EditOrderDetails,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Salesperson'] }
  },
  {
    path:'reports',
    component:SalesReportComponent,
    canActivate: [internalRoleGuard],
    data: { roles: ['Admin','Salesperson'] }
  }
]
