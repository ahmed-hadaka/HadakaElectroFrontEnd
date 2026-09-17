import {HttpInterceptorFn, HttpRequest} from '@angular/common/http';


export const csrfInterceptor: HttpInterceptorFn = (req, next)=>{


  if (req.method.toUpperCase() !== 'GET') {

    const token = sessionStorage.getItem('csrfToken');
    const headerName = sessionStorage.getItem('csrfHeader');

    if(token && headerName){
      const clonedReq = req.clone({
        headers: req.headers.set(headerName, token),
        withCredentials: true
      }) as HttpRequest<unknown>;

      return next(clonedReq);
    }

  }else{
    const clonedReq = req.clone({
      withCredentials: true
    });

    return next(clonedReq);
  }
  return next(req);
}
