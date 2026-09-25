import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { type MonoTypeOperatorFunction } from 'rxjs';

/**
 * Mixin-style base for classes that need teardown. Prefer composing
 * `inject(DestroyRef)` + `takeUntilDestroyed()` in modern services;
 * this exists for imperative RxJS subscriptions in adapters.
 */
export abstract class Destroyable {
  protected readonly destroyRef = inject(DestroyRef);

  protected untilDestroyed<T>(): MonoTypeOperatorFunction<T> {
    return takeUntilDestroyed(this.destroyRef);
  }

  protected onDestroy(callback: () => void): void {
    this.destroyRef.onDestroy(callback);
  }
}

/** Registers a teardown callback with the current injector's `DestroyRef`. */
export const onDestroy = (callback: () => void): void => {
  inject(DestroyRef).onDestroy(callback);
};
