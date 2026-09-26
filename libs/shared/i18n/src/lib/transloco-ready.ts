import { inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { filter, map, merge, startWith } from 'rxjs';

/**
 * Signal that bumps when the active language changes or a translation
 * scope finishes loading. Read it inside `computed()` before calling
 * `TranslocoService.translate()` so headers/labels re-resolve after
 * lazy feature scopes arrive (otherwise keys stick as raw strings).
 */
export const injectTranslocoReady = (): Signal<number> => {
  const i18n = inject(TranslocoService);
  return toSignal(
    merge(
      i18n.langChanges$,
      i18n.events$.pipe(filter((event) => event.type === 'translationLoadSuccess')),
    ).pipe(
      map(() => Date.now()),
      startWith(0),
    ),
    { initialValue: 0 },
  );
};
