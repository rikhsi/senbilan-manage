import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  type ConnectedPosition,
} from '@angular/cdk/overlay';
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

const HELP_OVERLAY_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
];

/**
 * Wraps any control (native input/select/textarea with `appInput`, or a DS control
 * component) and renders label, optional help popover, error and required marker.
 *
 * ```html
 * <app-form-field
 *   [label]="t('users.form.email')"
 *   [help]="t('users.form.emailHelp')"
 *   [helpLabel]="t('common.fieldHelp')"
 *   [error]="errorFor('email')"
 *   required
 * >
 *   <input appInput type="email" [formControl]="form.controls.email" />
 * </app-form-field>
 * ```
 *
 * Explanatory copy goes in `[help]` (click `?`). `[hint]` stays for short under-field
 * notes when needed. The caller decides *when* to show `error`.
 */
@Component({
  selector: 'app-form-field',
  imports: [AppIconComponent, CdkOverlayOrigin, CdkConnectedOverlay],
  template: `
    @if (label()) {
      <div class="app-form-field__label-row">
        <label class="app-form-field__label" [attr.for]="controlId()">
          {{ label() }}
          @if (required()) {
            <span class="app-form-field__required" aria-hidden="true">*</span>
          }
          @if (optionalLabel() && !required()) {
            <span class="app-form-field__optional">{{ optionalLabel() }}</span>
          }
        </label>
        @if (help()) {
          <button
            type="button"
            class="app-form-field__help"
            cdkOverlayOrigin
            #helpOrigin="cdkOverlayOrigin"
            [attr.aria-label]="helpLabel() || help()"
            [attr.aria-expanded]="helpOpen()"
            [attr.aria-controls]="helpPanelId"
            (click)="toggleHelp($event)"
          >
            <app-icon name="circle-help" size="xs" />
          </button>
          <ng-template
            cdkConnectedOverlay
            [cdkConnectedOverlayOrigin]="helpOrigin"
            [cdkConnectedOverlayOpen]="helpOpen()"
            [cdkConnectedOverlayPositions]="helpPositions"
            [cdkConnectedOverlayPush]="true"
            [cdkConnectedOverlayViewportMargin]="8"
            (overlayOutsideClick)="closeHelp()"
            (detach)="closeHelp()"
          >
            <div class="app-form-field__help-panel" role="tooltip" [id]="helpPanelId" tabindex="-1">
              {{ help() }}
            </div>
          </ng-template>
        }
      </div>
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
  /** Short under-field note (prefer `[help]` for longer explanations). */
  readonly hint = input<string>('');
  /** Popover copy shown after clicking the `?` control next to the label. */
  readonly help = input<string>('');
  /** Accessible name for the help button (localised by the caller). */
  readonly helpLabel = input<string>('');
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
  readonly helpPanelId = `${this.id}-help`;

  private readonly control = contentChild(APP_CONTROL);
  private readonly fallbackId = signal(this.id + '-control');
  protected readonly shownMessage = signal<FieldMessage | null>(null);
  protected readonly helpOpen = signal(false);
  protected readonly helpPositions = HELP_OVERLAY_POSITIONS;
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

  protected toggleHelp(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.helpOpen.update((open) => !open);
  }

  protected closeHelp(): void {
    this.helpOpen.set(false);
  }

  private clearPendingTimer(): void {
    if (this.clearMessageTimer !== null) {
      clearTimeout(this.clearMessageTimer);
      this.clearMessageTimer = null;
    }
  }
}

export type { AppControl };
