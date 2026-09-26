import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '@senbilan/shared/config';

/**
 * Prefixes absolute-path URLs (e.g. Orval `/admin/v1/...`) with `APP_CONFIG.apiBaseUrl`.
 * Leaves already-absolute `http(s):` URLs untouched (ApiClient builds those itself).
 */
export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (/^https?:\/\//i.test(req.url)) {
    return next(req);
  }
  const base = inject(APP_CONFIG).apiBaseUrl.replace(/\/$/, '');
  const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
  return next(req.clone({ url: `${base}${path}` }));
};
