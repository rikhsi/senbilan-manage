import { type HttpInterceptorFn } from '@angular/common/http';
import { TimeoutError as AppTimeoutError } from '@senbilan/core/application';
import { catchError, throwError, timeout, TimeoutError as RxTimeoutError } from 'rxjs';
import { TIMEOUT_MS } from '../http-context.tokens';

/** Aborts the request after `TIMEOUT_MS` (default 30s). `0` disables. */
export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  const ms = req.context.get(TIMEOUT_MS);
  if (ms <= 0) {
    return next(req);
  }
  return next(req).pipe(
    timeout(ms),
    catchError((error: unknown) => {
      if (error instanceof RxTimeoutError) {
        return throwError(() => new AppTimeoutError({ cause: error }));
      }
      return throwError(() => error);
    }),
  );
};
