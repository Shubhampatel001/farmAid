import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, EMPTY, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SKIP_SESSION_REDIRECT } from './http-context';
import { ApiError } from './models';
import { AuthService } from './services/auth.service';

/** Adds the Bearer token to API requests. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token;
  if (token && req.url.startsWith(environment.apiUrl)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};

/**
 * A 401 on a request that carried a token means the session is no longer valid: end it (one message,
 * redirect to /login) and complete the request without an error, so the page does not show a second message.
 * Other errors are left to the calling component, which knows how to present them.
 */
export const sessionExpiryInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        req.headers.has('Authorization') &&
        !req.context.get(SKIP_SESSION_REDIRECT)
      ) {
        auth.endStaleSession(true);
        return EMPTY;
      }
      return throwError(() => err);
    }),
  );
};

/** Human-readable message for any HTTP error. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server. Please check your connection.';
    const body = err.error as Partial<ApiError> | string | null;
    if (body && typeof body === 'object') {
      const fieldErrors = body.fieldErrors ? Object.values(body.fieldErrors) : [];
      if (fieldErrors.length) return fieldErrors.join(' ');
      if (body.message) return body.message;
    }
    if (typeof body === 'string' && body.trim()) return body;
  }
  return fallback;
}
