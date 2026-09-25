import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

/**
 * Allows the route only when the user is authenticated.
 * Anonymous visitors are redirected to `/auth/login` (with `returnUrl`).
 */
export const authGuard: CanMatchFn = (_route, segments) => {
  const auth = inject(AuthStore);
  if (auth.isAuthenticated()) {
    return true;
  }
  if (auth.isLoading() || auth.status() === 'idle') {
    // Restore still in flight — deny match for now; APP_INITIALIZER should finish first.
    return false;
  }
  const router = inject(Router);
  const returnUrl = '/' + segments.map((segment) => segment.path).join('/');
  return returnUrl === '/'
    ? router.createUrlTree(['/auth', 'login'])
    : router.createUrlTree(['/auth', 'login'], { queryParams: { returnUrl } });
};
