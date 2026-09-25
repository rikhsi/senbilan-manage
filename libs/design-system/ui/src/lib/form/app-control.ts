import { InjectionToken, type Signal } from '@angular/core';

/**
 * Contract between AppFormField and the control it wraps. Controls provide
 * themselves under APP_CONTROL so the field can link `<label for>` to them.
 */
export interface AppControl {
  readonly id: Signal<string>;
}

export const APP_CONTROL = new InjectionToken<AppControl>('APP_CONTROL');

let counter = 0;
export const nextControlId = (prefix: string): string => `${prefix}-${counter++}`;
