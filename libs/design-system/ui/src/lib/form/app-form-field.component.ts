import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  signal,
} from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { APP_CONTROL, type AppControl } from './app-control';

let nextId = 0;

/**
 * Wraps any control (native input/select/textarea with `appInput`, or a DS control
 * component) and renders label, hint, error and required marker. Links ids for a11y.
 *
 * ```html
 * <app-form-field [label]="t('users.form.email')" [error]="errorFor('email')" required>
 *   <input appInput type="email" [formControl]="form.controls.email" />
 * </app-form-field>
 * ```
 * The caller decides *when* to show `error` (touched/dirty/submitted) — the field
 * just renders whatever it is given. This keeps validation timing in one place (forms layer).
 */
@Component({
  selector: 'app-form-field',
  imports: [AppIconComponent],
  template: `
    @if (label()) {
      <label class="app-form-field__label" [attr.for]="controlId()">
        {{ label() }}
        @if (required()) {
          <span class="app-form-field__required" aria-hidden="true">*</span>
        }
        @if (optionalLabel() && !required()) {
          <span class="app-form-field__optional">{{ optionalLabel() }}</span>
        }
      </label>
    }
    <div class="app-form-field__control">
      <ng-content />
    </div>
    @if (error()) {
      <p
        class="app-form-field__message app-form-field__message--error"
        [id]="messageId"
        role="alert"
      >
        <app-icon name="circle-alert" size="xs" />
        <span>{{ error() }}</span>
      </p>
    } @else if (hint()) {
      <p class="app-form-field__message" [id]="messageId">{{ hint() }}</p>
    }
  `,
  styleUrl: './app-form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-form-field',
    '[class.app-form-field--invalid]': '!!error()',
    '[class.app-form-field--disabled]': 'disabled()',
    '[attr.data-size]': 'size()',
  },
})
export class AppFormFieldComponent {
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly required = input(false, {
    transform: (v: unknown) => v !== false && v !== null && v !== undefined,
  });
  readonly optionalLabel = input<string>('');
  readonly disabled = input(false);
  readonly size = input<'md' | 'lg'>('md');

  readonly id = `app-field-${nextId++}`;
  readonly messageId = `${this.id}-message`;

  private readonly control = contentChild(APP_CONTROL);
  private readonly fallbackId = signal(this.id + '-control');

  /** Id of the projected control (from AppControl) or a generated fallback. */
  readonly controlId = computed<string>(() => this.control()?.id() ?? this.fallbackId());

  /** Consumed by controls to wire aria-describedby / aria-invalid. */
  readonly describedBy = computed(() => (this.error() || this.hint() ? this.messageId : null));
  readonly invalid = computed(() => !!this.error());
}

export type { AppControl };
