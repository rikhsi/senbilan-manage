import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Logger, isAppError } from '@senbilan/core/application';
import { APP_CONFIG } from '@senbilan/shared/config';
import { catchError, tap, throwError } from 'rxjs';
import { SILENT_ERRORS } from '../http-context.tokens';

/** Dev-oriented request logging. Production stays quiet unless errors occur. */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(Logger);
  const config = inject(APP_CONFIG);
  const started = performance.now();
  const silent = req.context.get(SILENT_ERRORS);

  return next(req).pipe(
    tap({
      next: () => {
        if (!config.production) {
          logger.debug('HTTP ok', {
            method: req.method,
            url: req.urlWithParams,
            ms: Math.round(performance.now() - started),
          });
        }
      },
    }),
    catchError((error: unknown) => {
      if (!silent) {
        let status: string | number = 'unknown';
        if (error instanceof HttpErrorResponse) {
          status = error.status;
        } else if (isAppError(error)) {
          status = error.code;
        }
        logger.error('HTTP failed', error, {
          method: req.method,
          url: req.urlWithParams,
          status: String(status),
          ms: Math.round(performance.now() - started),
        });
      }
      return throwError(() => error);
    }),
  );
};
