/**
 * Layout host bridges — provided by the app shell so `kind:ui` layout
 * components never import AuthStore / ThemeService / CommandPaletteService.
 */
import { InjectionToken, type Signal } from '@angular/core';

export interface LayoutUserSnapshot {
  readonly displayName: string;
  readonly avatarUrl: string | null;
}

export interface LayoutUserBridge {
  /** Current user; return `null` when anonymous. */
  user(): LayoutUserSnapshot | null;
}

export type LayoutThemeMode = 'light' | 'dark' | 'system';

export interface LayoutThemeBridge {
  mode(): LayoutThemeMode;
  cycleMode(): void;
}

export interface LayoutCommandItem {
  readonly id: string;
  readonly label: string;
  readonly labelKey?: string;
  readonly shortcut?: string;
  readonly icon?: string;
  readonly permission?: string;
  readonly keywords?: readonly string[];
}

export interface LayoutCommandPaletteBridge {
  readonly isOpen: Signal<boolean> | (() => boolean);
  open(): void;
  close(): void;
  toggle(): void;
  all(): readonly LayoutCommandItem[];
  run(id: string): Promise<void>;
}

export const LAYOUT_USER = new InjectionToken<LayoutUserBridge>('LAYOUT_USER');

/** Optional permission predicate; when absent, gated items stay visible. */
export const LAYOUT_CAN_ACCESS = new InjectionToken<(permission: string) => boolean>(
  'LAYOUT_CAN_ACCESS',
);

export const LAYOUT_THEME = new InjectionToken<LayoutThemeBridge>('LAYOUT_THEME');

export const LAYOUT_COMMAND_PALETTE = new InjectionToken<LayoutCommandPaletteBridge>(
  'LAYOUT_COMMAND_PALETTE',
);
