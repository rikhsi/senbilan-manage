import { type HttpInterceptorFn } from '@angular/common/http';

const REQUEST_ID_HEADER = 'X-Request-Id';

const createRequestId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

/** Attaches a correlation id to every outbound request. */
export const correlationIdInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has(REQUEST_ID_HEADER)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { [REQUEST_ID_HEADER]: createRequestId() } }));
};
