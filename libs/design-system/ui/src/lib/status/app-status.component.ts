import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type Tone } from '../badge/app-badge.component';

/** Dot + text status indicator (table cells, list items). */
@Component({
  selector: 'app-status',
  template: `
    <span
      class="app-status__dot"
      [class.app-status__dot--pulse]="pulse()"
      aria-hidden="true"
    ></span>
    <span class="app-status__label"><ng-content /></span>
  `,
  styleUrl: './app-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-status',
    '[attr.data-tone]': 'tone()',
  },
})
export class AppStatusComponent {
  readonly tone = input<Tone>('neutral');
  readonly pulse = input(false);
}
