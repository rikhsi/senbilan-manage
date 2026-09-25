import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SkeletonShape = 'text' | 'rect' | 'circle';

/** Loading placeholder. Width/height accept any CSS length; `lines` repeats text rows. */
@Component({
  selector: 'app-skeleton',
  template: `
    @for (line of rows(); track $index) {
      <span
        class="app-skeleton__bar"
        [style.width]="$last && rows().length > 1 ? '65%' : width()"
        [style.height]="height()"
      ></span>
    }
  `,
  styleUrl: './app-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-skeleton',
    'aria-hidden': 'true',
    '[attr.data-shape]': 'shape()',
  },
})
export class AppSkeletonComponent {
  readonly shape = input<SkeletonShape>('text');
  readonly width = input<string>('100%');
  readonly height = input<string | null>(null);
  readonly lines = input(1);

  protected rows(): readonly number[] {
    return Array.from({ length: Math.max(1, this.lines()) }, (_, index) => index);
  }
}
