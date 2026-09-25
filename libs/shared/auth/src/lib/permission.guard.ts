import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';
import { type PermissionKey } from '@senbilan/core/domain';
import { AuthStore } from './auth.store';

/**
 * Factory guard that requires a specific permission (and authentication).
 *
 * ```ts
 * { path: 'users', canMatch: [permissionGuard('users:read')], ... }
 * ```
 */
export const permissionGuard =
  (permission: PermissionKey): CanMatchFn =>
  (_route, segments) => {
    const auth = inject(AuthStore);
    if (!auth.isAuthenticated()) {
      const router = inject(Router);
      const returnUrl = '/' + segments.map((segment) => segment.path).join('/');
      return returnUrl === '/'
        ? router.createUrlTree(['/auth', 'login'])
        : router.createUrlTree(['/auth', 'login'], { queryParams: { returnUrl } });
    }
    if (auth.can(permission)) {
      return true;
    }
    return inject(Router).createUrlTree(['/forbidden']);
  };
