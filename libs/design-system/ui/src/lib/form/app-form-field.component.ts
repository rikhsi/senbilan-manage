import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { APP_CONTROL, type AppControl } from './app-control';

let nextId = 0;

/** Keep last message in DOM until the expand/collapse transition finishes. */
const MESSAGE_TRANSITION_MS = 250;

type FieldMessage = { readonly kind: 'error' | 'hint'; readonly text: string };

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
 *
 * Error/hint height animates open/close so sibling fields do not jump.
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
    <div class="app-form-field__body">
      <div class="app-form-field__control">
        <ng-content />
      </div>
      <div
        class="app-form-field__message-slot"
        [class.app-form-field__message-slot--open]="messageOpen()"
      >
        <div class="app-form-field__message-slot-inner">
          @if (shownMessage(); as msg) {
            <p
              class="app-form-field__message"
              [class.app-form-field__message--error]="msg.kind === 'error'"
              [id]="messageId"
              [attr.role]="msg.kind === 'error' ? 'alert' : null"
            >
              @if (msg.kind === 'error') {
                <app-icon name="circle-alert" size="xs" />
              }
              <span>{{ msg.text }}</span>
            </p>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './app-form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-form-field',
    '[class.app-form-field--invalid]': 'invalid()',
    '[class.app-form-field--disabled]': 'disabled()',
    '[attr.data-size]': 'size()',
  },
})
export class AppFormFieldComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  /**
   * Marks the control invalid (red border / aria-invalid) without showing a message.
   * Use when the error is announced elsewhere (e.g. toast).
   */
  readonly invalidOnly = input(false, { alias: 'invalid' });
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
  protected readonly shownMessage = signal<FieldMessage | null>(null);
  private clearMessageTimer: ReturnType<typeof setTimeout> | null = null;

  /** Id of the projected control (from AppControl) or a generated fallback. */
  readonly controlId = computed<string>(() => this.control()?.id() ?? this.fallbackId());

  /** Drives height animation; false starts collapse while text may still be painted. */
  readonly messageOpen = computed(() => !!this.error().trim() || !!this.hint().trim());

  /** Consumed by controls to wire aria-describedby / aria-invalid. */
  readonly describedBy = computed(() => (this.messageOpen() ? this.messageId : null));
  readonly invalid = computed(() => !!this.error().trim() || this.invalidOnly());

  constructor() {
    this.destroyRef.onDestroy(() => this.clearPendingTimer());

    effect(() => {
      const error = this.error().trim();
      const hint = this.hint().trim();

      this.clearPendingTimer();

      if (error) {
        this.shownMessage.set({ kind: 'error', text: error });
        return;
      }
      if (hint) {
        this.shownMessage.set({ kind: 'hint', text: hint });
        return;
      }

      if (this.shownMessage() !== null) {
        this.clearMessageTimer = setTimeout(() => {
          this.shownMessage.set(null);
          this.clearMessageTimer = null;
        }, MESSAGE_TRANSITION_MS);
      }
    });
  }

  private clearPendingTimer(): void {
    if (this.clearMessageTimer !== null) {
      clearTimeout(this.clearMessageTimer);
      this.clearMessageTimer = null;
    }
  }
}

export type { AppControl };
