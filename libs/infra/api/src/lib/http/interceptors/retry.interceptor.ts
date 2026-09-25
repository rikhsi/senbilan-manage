import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { timer, throwError } from 'rxjs';
import { retry } from 'rxjs/operators';
import { RETRY_POLICY } from '../http-context.tokens';

const IDEMPOTENT = new Set(['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']);

/** Retries idempotent requests per `RETRY_POLICY` (or skips when policy is `null`). */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const policy = req.context.get(RETRY_POLICY);
  if (policy === null || policy.maxRetries <= 0 || !IDEMPOTENT.has(req.method.toUpperCase())) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: policy.maxRetries,
      delay: (error, retryCount) => {
        if (!(error instanceof HttpErrorResponse)) {
          return throwError(() => error);
        }
        if (!policy.retryableStatuses.includes(error.status)) {
          return throwError(() => error);
        }
        const delayMs = policy.baseDelayMs * 2 ** (retryCount - 1);
        return timer(delayMs);
      },
    }),
  );
};
