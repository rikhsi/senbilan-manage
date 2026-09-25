import { effect, inject, untracked } from '@angular/core';
import { SyncKeyValueStorage } from '@senbilan/core/application';
import {
  getState,
  patchState,
  signalStoreFeature,
  type,
  withHooks,
  type EmptyFeatureResult,
  type SignalStoreFeature,
} from '@ngrx/signals';

/**
 * Persists a picked slice of SignalStore state via {@link SyncKeyValueStorage}.
 *
 * ```ts
 * signalStore(
 *   withState({ sidebarCollapsed: false, density: 'default' }),
 *   withPersistence('senbilan.shell', (s) => ({
 *     sidebarCollapsed: s.sidebarCollapsed,
 *     density: s.density,
 *   })),
 * );
 * ```
 */
export function withPersistence<State extends object, Persisted extends object>(
  key: string,
  pick: (state: State) => Persisted,
): SignalStoreFeature<{ state: State } & EmptyFeatureResult, EmptyFeatureResult> {
  return signalStoreFeature(
    type<{ state: State }>(),
    withHooks({
      onInit(store) {
        const storage = inject(SyncKeyValueStorage, { optional: true });
        if (storage) {
          try {
            const saved = storage.get<Persisted>(key);
            if (saved !== null && typeof saved === 'object') {
              patchState(store, saved as Partial<State>);
            }
          } catch {
            // Corrupt / quota — keep defaults for this session.
          }
        }

        effect(() => {
          const snapshot = pick(getState(store) as State);
          untracked(() => {
            try {
              storage?.set(key, snapshot);
            } catch {
              // Quota / private mode — in-memory state still applies.
            }
          });
        });
      },
    }),
  );
}
