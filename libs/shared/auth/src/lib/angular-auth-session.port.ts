import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionPort } from '@senbilan/core/application';
import { AuthStore } from './auth.store';

/**
 * Clears {@link AuthStore} and routes to login after any authenticated 401.
 * Remote logout is intentionally skipped — tokens are already invalid.
 */
@Injectable()
export class AngularAuthSessionPort extends AuthSessionPort {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  invalidateLocalSession(): void {
    this.auth.clearLocalSession();
    if (this.router.url.startsWith('/auth')) {
      return;
    }
    void this.router.navigateByUrl('/auth/login');
  }
}
