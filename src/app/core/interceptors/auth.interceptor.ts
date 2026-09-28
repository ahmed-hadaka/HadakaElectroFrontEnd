import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {NotificationService} from '../../shared/services/NotificationService/notification-service';



export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router)
  const notification = inject(NotificationService);

  if (req.url.includes('/ElectroCustomer')) {
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // If session expired or unauthorized, redirect to login
        if (error.status === 401 || error.status === 403) {
          notification.notify('Session expired or unauthorized. Redirecting to login...', 'danger')
          router.navigate(['/ElectroCustomer/login']);
        }
        return throwError(() => error);
      })
    )
  } else {
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // If session expired or unauthorized, redirect to login
        if (error.status === 401 || error.status === 403) {
          notification.notify('Session expired or unauthorized. Redirecting to login...', 'danger')
          router.navigate(['ElectroInternal/']);
        }
        return throwError(() => error);
      })
    )
  }

}

