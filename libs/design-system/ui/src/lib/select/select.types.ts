import { type ConnectedPosition } from '@angular/cdk/overlay';

export interface SelectOption<T = string> {
  readonly value: T;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
}

export interface SelectLabels {
  readonly placeholder: string;
  readonly searchPlaceholder: string;
  readonly noResults: string;
  readonly clear: string;
  /** Sheet close control; falls back to `clear` when omitted. */
  readonly close?: string;
  /** "{{count}} selected" — already interpolated by the caller via a function. */
  readonly selectedCount: (count: number) => string;
}

export const SELECT_OVERLAY_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];
