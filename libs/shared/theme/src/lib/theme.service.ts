import { computed, effect, inject, Injectable, signal, type WritableSignal } from '@angular/core';
import { SyncKeyValueStorage } from '@senbilan/core/application';
import {
  THEME_ATTRIBUTES,
  type Contrast,
  type Density,
  type ThemeMode,
  type ThemeName,
} from '@senbilan/design-system/tokens';
import {
  DEFAULT_THEME_PREFERENCES,
  MOTIONS,
  parseThemePreferences,
  THEME_STORAGE_KEY,
  type Motion,
  type ThemePreferences,
} from './theme.types';

/**
 * Inline bootstrap for `index.html` (run before first paint):
 *
 * ```html
 * <script>
 * (function () {
 *   try {
 *     var key = 'senbilan.theme';
 *     var raw = localStorage.getItem(key);
 *     var prefs = raw ? JSON.parse(raw) : null;
 *     var root = document.documentElement;
 *     var mode = prefs && prefs.mode ? prefs.mode : 'system';
 *     var theme =
 *       mode === 'system'
 *         ? window.matchMedia('(prefers-color-scheme: dark)').matches
 *           ? 'dark'
 *           : 'light'
 *         : mode;
 *     root.setAttribute('data-theme', theme);
 *     if (prefs) {
 *       if (prefs.density) root.setAttribute('data-density', prefs.density);
 *       if (prefs.contrast) root.setAttribute('data-contrast', prefs.contrast);
 *       if (prefs.motion) root.setAttribute('data-motion', prefs.motion);
 *     }
 *   } catch (_) {}
 * })();
 * </script>
 * ```
 *
 * Theme CSS variables (`--app-*`) already bridge to Taiga (`--tui-*`) via
 * `@senbilan/design-system/tokens` vendor SCSS — flipping `data-theme` is enough.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(SyncKeyValueStorage, { optional: true });
  private readonly media =
    typeof globalThis.matchMedia === 'function'
      ? globalThis.matchMedia('(prefers-color-scheme: dark)')
      : null;

  private readonly preferences = signal<ThemePreferences>(this.loadInitial());
  private readonly systemDark = signal(this.media?.matches ?? false);

  readonly mode = computed(() => this.preferences().mode);
  readonly density = computed(() => this.preferences().density);
  readonly contrast = computed(() => this.preferences().contrast);
  readonly motion = computed(() => this.preferences().motion);

  /** Resolved light|dark after applying `system`. */
  readonly resolvedTheme = computed<ThemeName>(() => {
    const mode = this.mode();
    if (mode === 'system') {
      return this.systemDark() ? 'dark' : 'light';
    }
    return mode;
  });

  readonly isDark = computed(() => this.resolvedTheme() === 'dark');

  constructor() {
    this.bindSystemPreference();
    effect(() => {
      this.applyToDom(this.preferences(), this.resolvedTheme());
      this.persist(this.preferences());
    });
  }

  setMode(mode: ThemeMode): void {
    this.patch({ mode });
  }

  setDensity(density: Density): void {
    this.patch({ density });
  }

  setContrast(contrast: Contrast): void {
    this.patch({ contrast });
  }

  setMotion(motion: Motion): void {
    this.patch({ motion });
  }

  cycleMode(): void {
    const order: readonly ThemeMode[] = ['light', 'dark', 'system'];
    const current = this.mode();
    const next = order[(order.indexOf(current) + 1) % order.length] ?? 'system';
    this.setMode(next);
  }

  toggleMotion(): void {
    this.setMotion(this.motion() === 'full' ? 'reduced' : 'full');
  }

  reset(): void {
    this.preferences.set({ ...DEFAULT_THEME_PREFERENCES });
  }

  private patch(partial: Partial<ThemePreferences>): void {
    this.preferences.update((current) => ({ ...current, ...partial }));
  }

  private loadInitial(): ThemePreferences {
    const stored = this.readStorage();
    return stored ?? { ...DEFAULT_THEME_PREFERENCES };
  }

  private readStorage(): ThemePreferences | null {
    try {
      if (this.storage) {
        return parseThemePreferences(this.storage.get<unknown>(THEME_STORAGE_KEY));
      }
      if (typeof localStorage === 'undefined') {
        return null;
      }
      const raw = localStorage.getItem(THEME_STORAGE_KEY);
      if (raw === null) {
        return null;
      }
      return parseThemePreferences(JSON.parse(raw) as unknown);
    } catch {
      return null;
    }
  }

  private persist(prefs: ThemePreferences): void {
    try {
      if (this.storage) {
        this.storage.set(THEME_STORAGE_KEY, prefs);
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(prefs));
      }
    } catch {
      // Quota / private mode — preferences still apply for this session.
    }
  }

  private applyToDom(prefs: ThemePreferences, theme: ThemeName): void {
    const root = globalThis.document?.documentElement;
    if (!root) {
      return;
    }
    root.setAttribute(THEME_ATTRIBUTES.theme, theme);
    root.setAttribute(THEME_ATTRIBUTES.density, prefs.density);
    root.setAttribute(THEME_ATTRIBUTES.contrast, prefs.contrast);
    root.setAttribute(THEME_ATTRIBUTES.motion, prefs.motion);
    root.style.colorScheme = theme;
  }

  private bindSystemPreference(): void {
    if (!this.media) {
      return;
    }
    const onChange = (event: MediaQueryListEvent): void => {
      this.systemDark.set(event.matches);
    };
    if (typeof this.media.addEventListener === 'function') {
      this.media.addEventListener('change', onChange);
    } else {
      // Safari < 14
      (this.media as MediaQueryList & { addListener(listener: typeof onChange): void }).addListener(
        onChange,
      );
    }
  }
}

/** @internal Exported for tests — list of valid motion values. */
export const themeMotionValues = MOTIONS;

/** Narrow helper when syncing an external dark-mode signal (e.g. Taiga `TUI_DARK_MODE`). */
export const syncDarkModeSignal = (
  target: WritableSignal<boolean>,
  isDark: () => boolean,
): void => {
  target.set(isDark());
};
