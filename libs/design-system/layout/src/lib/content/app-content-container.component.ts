import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ContentWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'app-content-container',
  template: `<ng-content />`,
  styleUrl: './app-content-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-content-container',
    '[attr.data-width]': 'width()',
    '[class.app-content-container--flush]': 'flush()',
  },
})
export class AppContentContainerComponent {
  readonly width = input<ContentWidth>('lg');
  /** Remove horizontal padding (tables, full-bleed charts). */
  readonly flush = input(false);
}
