import { ENVIRONMENT_INITIALIZER, inject, type Provider } from '@angular/core';
import { provideTranslocoScope, TranslocoService, type InlineLoader } from '@jsverse/transloco';
import { switchMap, take } from 'rxjs';

/**
 * Registers a feature scope and starts loading its colocated JSON as soon as
 * the route injector is created.
 *
 * Detail screens read titles before any `transloco` pipe is in the template
 * (the skeleton has no pipe). `TranslocoService.load(scope)` cannot see this
 * inline loader and would request a missing `assets/i18n/{scope}.json`.
 */
export const provideInlineTranslocoScope = (scope: string, loader: InlineLoader): Provider[] => [
  ...provideTranslocoScope({ scope, loader }),
  {
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useValue: (): void => {
      preloadInlineTranslocoScope(scope, loader);
    },
  },
];

const preloadInlineTranslocoScope = (scope: string, loader: InlineLoader): void => {
  const i18n = inject(TranslocoService);
  const inlineLoader: InlineLoader = {};
  for (const [lang, load] of Object.entries(loader)) {
    inlineLoader[`${scope}/${lang}`] = load;
  }
  const active = i18n.getActiveLang();
  const path =
    inlineLoader[`${scope}/${active}`] !== undefined ? `${scope}/${active}` : `${scope}/ru`;
  // A scoped load merges into the active language. If that happens before
  // `ru.json` arrives, Transloco treats the root language as already loaded
  // and never fetches navigation and common keys.
  i18n
    .load(active)
    .pipe(
      switchMap(() => i18n.load(path, { inlineLoader })),
      take(1),
    )
    .subscribe({
      error: () => undefined,
    });
};
