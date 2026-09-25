import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { type PermissionKey } from '@senbilan/core/domain';
import { AuthStore } from './auth.store';

/**
 * Structural directive that renders the template when the current session
 * has the required permission (or any/all of a list).
 *
 * ```html
 * <button *appCan="'users:write'">…</button>
 * <a *appCan="perms; mode: 'any'">…</a>
 * ```
 */
@Directive({
  selector: '[appCan]',
})
export class AppCanDirective {
  private readonly auth = inject(AuthStore);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private embedded = false;

  readonly appCan = input.required<PermissionKey | readonly PermissionKey[]>();
  readonly appCanMode = input<'all' | 'any'>('all');

  constructor() {
    effect(() => {
      const required = this.appCan();
      const mode = this.appCanMode();
      let allowed = false;
      if (typeof required === 'string') {
        allowed = this.auth.can(required);
      } else if (mode === 'any') {
        allowed = this.auth.canAny(required);
      } else {
        allowed = this.auth.canAll(required);
      }

      if (allowed && !this.embedded) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.embedded = true;
      } else if (!allowed && this.embedded) {
        this.viewContainer.clear();
        this.embedded = false;
      }
    });
  }
}
