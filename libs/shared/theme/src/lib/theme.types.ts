import {
  CONTRASTS,
  DENSITIES,
  THEME_ATTRIBUTES,
  THEME_MODES,
  THEMES,
  type Contrast,
  type Density,
  type ThemeMode,
  type ThemeName,
} from '@senbilan/design-system/tokens';

/** Matches `data-motion` values consumed by design-system tokens SCSS. */
export const MOTIONS = ['full', 'reduced'] as const;
export type Motion = (typeof MOTIONS)[number];

export interface ThemePreferences {
  readonly mode: ThemeMode;
  readonly density: Density;
  readonly contrast: Contrast;
  readonly motion: Motion;
  /** Warm yellow screen tint — independent of light/dark theme. */
  readonly eyeComfort: boolean;
}

export const THEME_STORAGE_KEY = 'senbilan.theme';

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  mode: 'system',
  density: 'default',
  contrast: 'normal',
  motion: 'full',
  eyeComfort: false,
};

export const isThemeMode = (value: unknown): value is ThemeMode =>
  typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);

export const isDensity = (value: unknown): value is Density =>
  typeof value === 'string' && (DENSITIES as readonly string[]).includes(value);

export const isContrast = (value: unknown): value is Contrast =>
  typeof value === 'string' && (CONTRASTS as readonly string[]).includes(value);

export const isMotion = (value: unknown): value is Motion =>
  typeof value === 'string' && (MOTIONS as readonly string[]).includes(value);

export const isThemeName = (value: unknown): value is ThemeName =>
  typeof value === 'string' && (THEMES as readonly string[]).includes(value);

export const parseThemePreferences = (value: unknown): ThemePreferences | null => {
  if (value === null || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  let mode = record['mode'];
  let eyeComfort = record['eyeComfort'] === true;
  // Migrate the short-lived `comfort` theme mode into the eye-comfort flag.
  if (mode === 'comfort') {
    mode = 'light';
    eyeComfort = true;
  }
  const density = record['density'];
  const contrast = record['contrast'];
  const motion = record['motion'];
  if (!isThemeMode(mode) || !isDensity(density) || !isContrast(contrast) || !isMotion(motion)) {
    return null;
  }
  return { mode, density, contrast, motion, eyeComfort };
};

export { THEME_ATTRIBUTES, THEME_MODES, THEMES, CONTRASTS, DENSITIES };
export type { Contrast, Density, ThemeMode, ThemeName };
