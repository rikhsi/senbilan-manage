import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { type Tone } from '../badge/badge.types';

/** Removable chip for filters and multi-select values. */
@Component({
  selector: 'app-tag',
  imports: [AppIconComponent],
  template: `
    <span class="app-tag__label"><ng-content /></span>
    @if (removable()) {
      <button
        type="button"
        class="app-tag__remove"
        [attr.aria-label]="removeLabel()"
        [disabled]="disabled()"
        (click)="remove.emit()"
      >
        <app-icon name="x" size="xs" />
      </button>
    }
  `,
  styleUrl: './app-tag.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-tag',
    '[attr.data-tone]': 'tone()',
    '[class.app-tag--disabled]': 'disabled()',
  },
})
export class AppTagComponent {
  readonly tone = input<Tone>('neutral');
  readonly removable = input(false);
  /** Accessible name for the remove button (localised by the caller). */
  readonly removeLabel = input('');
  readonly disabled = input(false);
  readonly remove = output<void>();
}
