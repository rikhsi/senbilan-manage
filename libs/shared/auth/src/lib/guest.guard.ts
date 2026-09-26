import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

/**
 * Allows auth screens (login) only for anonymous users.
 * Authenticated visitors are redirected to `redirectTo` (default `/dashboard`).
 */
export const guestGuard = (redirectTo: readonly string[] = ['dashboard']): CanMatchFn => {
  return () => {
    const auth = inject(AuthStore);
    if (!auth.isAuthenticated()) {
      return true;
    }
    return inject(Router).createUrlTree([...redirectTo]);
  };
};
