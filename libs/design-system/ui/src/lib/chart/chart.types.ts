import type { ChartType } from 'chart.js';
import { CHART_COLOR_VARS, readCssVar } from '@senbilan/design-system/tokens';

export type AppChartType = Extract<ChartType, 'line' | 'bar' | 'doughnut' | 'pie'>;

/** Palette resolved from CSS custom properties at render time (theme-aware). */
export interface ChartPalette {
  readonly series: readonly string[];
  readonly text: string;
  readonly grid: string;
  readonly surface: string;
  readonly fontFamily: string;
}

export const readChartPalette = (element: Element): ChartPalette => ({
  series: CHART_COLOR_VARS.map((name) => readCssVar(name, element)),
  text: readCssVar('--app-color-text-secondary', element),
  grid: readCssVar('--app-color-divider', element),
  surface: readCssVar('--app-color-surface-elevated', element),
  fontFamily: readCssVar('--app-font-family-sans', element),
});
