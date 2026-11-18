import { Routes } from '@angular/router';
import {InternalLayout} from './internal/components/internal-layout/internal-layout';
import {CustomerLayout} from './customer/components/customer-layout/customer-layout';
import {WelcomePage} from './shared/welcome-page/welcome-page';

export const routes: Routes = [
  {
    path:'',
    component:WelcomePage
  }
  ,{
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
