import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Injeta o access token (memória) e, em 401 de endpoint protegido, tenta uma
 * renovação silenciosa via cookie de refresh antes de derrubar a sessão
 * (docs/07 seções 6 e 7).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isAuthEndpoint = req.url.includes('/api/auth/');

  return next(withToken(req, authService.getToken())).pipe(
    catchError((err: HttpErrorResponse) => {
      const shouldTryRefresh = err.status === 401 && !isAuthEndpoint && req.url.includes('/api/');
      if (!shouldTryRefresh) {
        return throwError(() => err);
      }
      return authService.refreshSession$().pipe(
        switchMap(() => next(withToken(req, authService.getToken()))),
        catchError(() => {
          authService.clearSession();
          return throwError(() => err);
        }),
      );
    }),
  );
};

function withToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (token && req.url.includes('/api/')) {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return req;
}
