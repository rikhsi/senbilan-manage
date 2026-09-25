/**
 * TypeScript mirror of the SCSS tokens that JavaScript needs at runtime.
 * Keep in sync with `styles/_breakpoints.scss` and `styles/_primitives.scss`.
 */
export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

export const DURATIONS = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

export const THEMES = ['light', 'dark'] as const;
export type ThemeName = (typeof THEMES)[number];

export const THEME_MODES = ['light', 'dark', 'system'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const DENSITIES = ['compact', 'default', 'comfortable'] as const;
export type Density = (typeof DENSITIES)[number];

export const CONTRASTS = ['normal', 'high'] as const;
export type Contrast = (typeof CONTRASTS)[number];

/** data-* attributes written on <html> by ThemeService. */
export const THEME_ATTRIBUTES = {
  theme: 'data-theme',
  density: 'data-density',
  contrast: 'data-contrast',
  motion: 'data-motion',
} as const;

/** Ordered chart palette (CSS variable names) for chart adapters. */
export const CHART_COLOR_VARS = [
  '--app-color-chart-1',
  '--app-color-chart-2',
  '--app-color-chart-3',
  '--app-color-chart-4',
  '--app-color-chart-5',
] as const;

/** Reads a CSS custom property from the document root at runtime (charts, canvas). */
export const readCssVar = (
  name: string,
  element: Element | null = globalThis.document?.documentElement ?? null,
): string => (element ? getComputedStyle(element).getPropertyValue(name).trim() : '');
