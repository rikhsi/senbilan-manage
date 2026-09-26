import { HttpErrorResponse, type HttpInterceptorFn, type HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthSessionPort, SessionStorage, UnauthorizedError } from '@senbilan/core/application';
import { catchError, throwError } from 'rxjs';
import { SKIP_AUTH } from '../http-context.tokens';

const withBearer = (req: HttpRequest<unknown>, token: string): HttpRequest<unknown> =>
  req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

/**
 * 401 is normalized to {@link UnauthorizedError} by the inner error interceptor
 * before this catch runs, so both shapes count as an expired session.
 */
const isUnauthorized = (error: unknown): boolean =>
  error instanceof UnauthorizedError ||
  (error instanceof HttpErrorResponse && error.status === 401);

/**
 * Attaches the access token. Any 401 on an authenticated request clears the
 * session and sends the user to login. Login and refresh set `SKIP_AUTH`.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const storage = inject(SessionStorage);
  const session = inject(AuthSessionPort, { optional: true });
  const access = storage.getAccessToken();
  const authedReq = access ? withBearer(req, access) : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      if (!isUnauthorized(error)) {
        return throwError(() => error);
      }

      storage.clear();
      session?.invalidateLocalSession();
      return throwError(() =>
        error instanceof UnauthorizedError ? error : new UnauthorizedError({ cause: error }),
      );
    }),
  );
};
