import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  type InputSignal,
  signal,
  viewChild,
} from '@angular/core';
import type { Chart, ChartData, ChartOptions } from 'chart.js';
import { AppSkeletonComponent } from '../skeleton/app-skeleton.component';
import { type AppChartType, readChartPalette } from './chart.types';

export type { AppChartType, ChartPalette } from './chart.types';
export { readChartPalette } from './chart.types';

/**
 * Chart.js wrapper. Loads chart.js lazily (it is ~60 kB) on first render,
 * applies theme palette from CSS variables and re-applies it on theme change.
 * Datasets without explicit colors receive series colors in order.
 *
 * ```html
 * <app-chart type="line" [data]="signups()" [height]="240" [ariaLabel]="t('dashboard.signups')" />
 * ```
 */
@Component({
  selector: 'app-chart',
  imports: [AppSkeletonComponent],
  template: `
    <div class="app-chart__frame" [style.height.px]="height()">
      @if (!ready()) {
        <app-skeleton shape="rect" width="100%" height="100%" />
      }
      <canvas
        #canvas
        class="app-chart__canvas"
        role="img"
        [attr.aria-label]="ariaLabel()"
        [hidden]="!ready()"
      ></canvas>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .app-chart__frame {
      position: relative;
      width: 100%;
    }
    .app-chart__canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-chart' },
})
export class AppChartComponent {
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly type = input.required<AppChartType>();
  readonly data = input.required<ChartData>();
  readonly options: InputSignal<ChartOptions> = input<ChartOptions>({});
  readonly height = input(240);
  readonly ariaLabel = input.required<string>();
  /** Bump to re-read CSS variables (e.g. pass current theme name). */
  readonly themeKey = input<string>('');

  protected readonly ready = signal(false);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: Chart | null = null;

  constructor() {
    afterNextRender(() => void this.init());
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }

  private async init(): Promise<void> {
    const { Chart: ChartCtor, registerables } = await import('chart.js');
    ChartCtor.register(...registerables);

    this.chart = new ChartCtor(this.canvas().nativeElement, {
      type: this.type(),
      data: this.themed(this.data()),
      options: this.merged(),
    });
    this.ready.set(true);

    effect(
      () => {
        const data = this.themed(this.data());
        const options = this.merged();
        this.themeKey();
        if (this.chart) {
          this.chart.data = data;
          this.chart.options = options;
          this.chart.update('none');
        }
      },
      { injector: this.injector },
    );
  }

  private themed(data: ChartData): ChartData {
    const palette = readChartPalette(this.host.nativeElement);
    const isCircular = this.type() === 'doughnut' || this.type() === 'pie';
    return {
      ...data,
      datasets: data.datasets.map((dataset, index) => {
        const color = palette.series[index % palette.series.length] ?? palette.series[0] ?? '';
        const explicit = dataset.backgroundColor !== undefined || dataset.borderColor !== undefined;
        if (explicit) {
          return dataset;
        }
        if (isCircular) {
          return {
            ...dataset,
            backgroundColor: dataset.data.map(
              (_, i) => palette.series[i % palette.series.length] ?? color,
            ),
            borderColor: palette.surface,
            borderWidth: 2,
          };
        }
        return {
          ...dataset,
          borderColor: color,
          backgroundColor: this.type() === 'line' ? `${color}33` : color,
          borderWidth: 2,
          borderRadius: this.type() === 'bar' ? 6 : undefined,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: this.type() === 'line',
        } as typeof dataset;
      }),
    };
  }

  private merged(): ChartOptions {
    const palette = readChartPalette(this.host.nativeElement);
    const base: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      color: palette.text,
      font: { family: palette.fontFamily },
      plugins: {
        legend: {
          labels: {
            color: palette.text,
            usePointStyle: true,
            boxWidth: 8,
            font: { family: palette.fontFamily },
          },
        },
        tooltip: {
          backgroundColor: palette.surface,
          titleColor: palette.text,
          bodyColor: palette.text,
          borderColor: palette.grid,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          displayColors: true,
          boxPadding: 4,
        },
      },
      scales:
        this.type() === 'doughnut' || this.type() === 'pie'
          ? {}
          : {
              x: {
                grid: { display: false },
                ticks: { color: palette.text },
                border: { color: palette.grid },
              },
              y: {
                grid: { color: palette.grid },
                ticks: { color: palette.text },
                border: { display: false },
              },
            },
    };
    return deepMerge(
      base as Record<string, unknown>,
      this.options() as Record<string, unknown>,
    ) as ChartOptions;
  }
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const deepMerge = (
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = result[key];
    result[key] =
      isPlainObject(current) && isPlainObject(value) ? deepMerge(current, value) : value;
  }
  return result;
};
