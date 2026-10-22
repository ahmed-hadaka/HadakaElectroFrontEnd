import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {NotificationService} from '../shared/services/NotificationService/notification-service';

export const internalRoleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const notification = inject(NotificationService);

  const rawRoles = JSON.parse(sessionStorage.getItem('userRoles') || '[]');
  const userRoles: string[] = rawRoles.map((r: any) => (r.authority ? r.authority : r));

  if (userRoles.length === 0) {
    notification.notify('Please log in to access this page.', 'warning');
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = route.data?.['roles'] as string[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const isAuthorized = allowedRoles.some((role) => userRoles.includes(role));

  if (!isAuthorized) {
    notification.notify('You do not have permission to access this page.', 'danger');
    return router.createUrlTree(['/ElectroInternal/dashboard']);
  }

  return true;
};
