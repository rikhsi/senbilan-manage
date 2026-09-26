import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type ContentWidth } from './content.types';

export type { ContentWidth } from './content.types';

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
