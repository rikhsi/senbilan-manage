import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { APP_CONFIG } from '@senbilan/shared/config';
import { filter } from 'rxjs';
import { readLoadedTranslation } from './transloco-ready';

/**
 * Browser tab title: `"Page · AppName"`.
 * Route strategy sets an i18n key; detail screens may override with a dynamic label.
 */
@Injectable()
export class PageTitleService {
  private readonly title = inject(Title);
  private readonly i18n = inject(TranslocoService);
  private readonly config = inject(APP_CONFIG, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  private readonly routeKey = signal<string | null>(null);
  private readonly dynamicLabel = signal<string | null>(null);

  constructor() {
    this.i18n.langChanges$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.apply();
    });
    // Lazy feature scopes may resolve after the first TitleStrategy pass.
    this.i18n.events$
      .pipe(
        filter((event) => event.type === 'translationLoadSuccess'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.apply();
      });
  }

  /** Called by `AppTitleStrategy` when the deepest route title (i18n key) changes. */
  setRouteKey(key: string | null): void {
    this.routeKey.set(key);
    this.dynamicLabel.set(null);
    this.apply();
  }

  /**
   * Override with a resolved entity name (e.g. user display name).
   * Pass `null` to fall back to the route key.
   */
  setDynamic(label: string | null): void {
    const trimmed = label?.trim() ?? '';
    this.dynamicLabel.set(trimmed.length > 0 ? trimmed : null);
    this.apply();
  }

  private apply(): void {
    const brand = this.config?.appName?.trim() || 'Senbilan Manage';
    const dynamic = this.dynamicLabel();
    if (dynamic) {
      this.title.setTitle(`${dynamic} · ${brand}`);
      return;
    }
    const key = this.routeKey();
    if (!key) {
      this.title.setTitle(brand);
      return;
    }
    const page = this.translateRouteKey(key);
    if (!page) {
      this.title.setTitle(brand);
      return;
    }
    this.title.setTitle(`${page} · ${brand}`);
  }

  /**
   * Route titles are stored as `scope.key` (e.g. `media.detailTitle`).
   * Read the loaded map only. `translate()` logs a missing key, and
   * `load(scope)` cannot see the feature's inline loader.
   */
  private translateRouteKey(key: string): string | null {
    const page = readLoadedTranslation(this.i18n, key);
    return page.length > 0 ? page : null;
  }
}
