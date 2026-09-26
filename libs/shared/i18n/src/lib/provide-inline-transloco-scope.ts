import { ENVIRONMENT_INITIALIZER, inject, type Provider } from '@angular/core';
import { provideTranslocoScope, TranslocoService, type InlineLoader } from '@jsverse/transloco';
import { firstValueFrom, take } from 'rxjs';

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
      void loadInlineTranslocoScope(inject(TranslocoService), scope, loader);
    },
  },
];

/** Merges a feature scope into the active language. Safe to call from outside a route. */
export const loadInlineTranslocoScope = async (
  i18n: TranslocoService,
  scope: string,
  loader: InlineLoader,
): Promise<void> => {
  const inlineLoader: InlineLoader = {};
  for (const [lang, load] of Object.entries(loader)) {
    inlineLoader[`${scope}/${lang}`] = load;
  }
  const active = i18n.getActiveLang();
  const path =
    inlineLoader[`${scope}/${active}`] !== undefined ? `${scope}/${active}` : `${scope}/ru`;
  try {
    // A scoped load merges into the active language. If that happens before
    // the root file arrives, Transloco treats the language as already loaded.
    await firstValueFrom(i18n.load(active).pipe(take(1)));
    await firstValueFrom(i18n.load(path, { inlineLoader }).pipe(take(1)));
  } catch {
    // A missing scope must not block the screen that asked for it.
  }
};
