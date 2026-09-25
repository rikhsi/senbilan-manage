import { HttpErrorResponse, type HttpInterceptorFn, type HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthRepository, SessionStorage, UnauthorizedError } from '@senbilan/core/application';
import { APP_CONFIG } from '@senbilan/shared/config';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { SKIP_AUTH } from '../http-context.tokens';

let refreshInFlight: Promise<string> | null = null;

const withBearer = (req: HttpRequest<unknown>, token: string): HttpRequest<unknown> =>
  req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

/**
 * Attaches the access token and performs a single-flight refresh on 401.
 * Refresh itself must use `SKIP_AUTH` to avoid recursion.
 * When `auth.refreshViaCookie` is true, refresh relies on httpOnly cookie
 * (withCredentials) and does not send a body refresh token from storage.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const storage = inject(SessionStorage);
  const auth = inject(AuthRepository);
  const cookieMode = inject(APP_CONFIG).auth.refreshViaCookie;
  const access = storage.getAccessToken();
  const authedReq = access ? withBearer(req, access) : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      if (!refreshInFlight) {
        const storedRefresh = cookieMode ? undefined : (storage.getRefreshToken() ?? undefined);
        refreshInFlight = auth
          .refresh(storedRefresh)
          .then((tokens) => {
            storage.setAccessToken(tokens.accessToken);
            if (!cookieMode && tokens.refreshToken !== undefined) {
              storage.setRefreshToken(tokens.refreshToken);
            }
            return tokens.accessToken;
          })
          .catch((refreshError: unknown) => {
            storage.clear();
            throw refreshError instanceof Error
              ? refreshError
              : new UnauthorizedError({ cause: refreshError });
          })
          .finally(() => {
            refreshInFlight = null;
          });
      }

      return from(refreshInFlight).pipe(switchMap((token) => next(withBearer(req, token))));
    }),
  );
};
