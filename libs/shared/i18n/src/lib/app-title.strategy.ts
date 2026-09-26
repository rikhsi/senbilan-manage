import { Injectable, inject } from '@angular/core';
import { type RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { PageTitleService } from './page-title.service';

/**
 * Reads `title` from the deepest primary route (i18n key) and forwards it to
 * `PageTitleService` so the tab shows `"Translated · AppName"`.
 */
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly pageTitle = inject(PageTitleService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    this.pageTitle.setRouteKey(key && key.length > 0 ? key : null);
  }
}
