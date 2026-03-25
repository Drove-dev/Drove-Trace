import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../errorhandler/error-handler.service';

/** URLs bajo /auth/ para las que no se debe usar el manejador global (ej. login con credenciales incorrectas). */
const AUTH_PATH = '/auth/';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);
  const isAuthRequest = req.url.includes(AUTH_PATH);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (!isAuthRequest) {
        errorHandler.handleError(err);
      }
      return throwError(() => err);
    })
  );
};
