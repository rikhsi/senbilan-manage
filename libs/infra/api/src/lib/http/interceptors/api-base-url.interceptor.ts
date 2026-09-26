import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '@senbilan/shared/config';

const isAbsoluteHttpUrl = (url: string): boolean => /^https?:\/\//i.test(url);

/** SPA-local paths that must not be rewritten to `apiBaseUrl`. */
const isAppLocalUrl = (url: string): boolean => {
  const path = url.startsWith('/') ? url.slice(1) : url;
  return (
    path.startsWith('assets/') ||
    path.startsWith('ngsw') ||
    path.startsWith('manifest') ||
    path.startsWith('favicon') ||
    path.startsWith('icon-')
  );
};

/**
 * Prefixes API-relative URLs (e.g. Orval `/admin/v1/...`) with `APP_CONFIG.apiBaseUrl`.
 * Leaves absolute `http(s):` URLs and SPA asset paths untouched.
 */
export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (isAbsoluteHttpUrl(req.url) || isAppLocalUrl(req.url)) {
    return next(req);
  }
  const base = inject(APP_CONFIG).apiBaseUrl.replace(/\/$/, '');
  const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
  return next(req.clone({ url: `${base}${path}` }));
};
