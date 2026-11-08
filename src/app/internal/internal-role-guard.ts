import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {NotificationService} from '../shared/services/NotificationService/notification-service';

export const internalRoleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const notification = inject(NotificationService);

  let rawRoles: unknown = [];
  try {
    rawRoles = JSON.parse(sessionStorage.getItem('userRoles') || '[]');
  } catch {
    rawRoles = [];
  }
  const userRoles: string[] = Array.isArray(rawRoles)
    ? rawRoles
      .map((role: unknown) => typeof role === 'object' && role !== null && 'authority' in role
        ? role.authority
        : role)
      .filter((role): role is string => typeof role === 'string')
    : [];

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
