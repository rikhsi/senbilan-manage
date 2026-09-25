import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { APP_CONTROL, nextControlId, type AppControl } from './app-control';

/**
 * Checkbox with label. Two-way `checked` model + ControlValueAccessor so it works
 * with `[(checked)]`, Reactive Forms and Signal Forms.
 */
@Component({
  selector: 'app-checkbox',
  imports: [AppIconComponent],
  template: `
    <input
      class="app-checkbox__input"
      type="checkbox"
      [id]="id()"
      [checked]="checked()"
      [indeterminate]="indeterminate()"
      [disabled]="isDisabled()"
      [attr.aria-describedby]="describedBy() || null"
      (change)="onToggle($event)"
      (blur)="onTouched()"
    />
    <span class="app-checkbox__box" aria-hidden="true">
      @if (indeterminate()) {
        <app-icon name="minus" size="xs" />
      } @else if (checked()) {
        <app-icon name="check" size="xs" />
      }
    </span>
    <label class="app-checkbox__label" [attr.for]="id()"><ng-content /></label>
  `,
  styleUrl: './app-checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppCheckboxComponent),
      multi: true,
    },
    { provide: APP_CONTROL, useExisting: forwardRef(() => AppCheckboxComponent) },
  ],
  host: {
    class: 'app-checkbox',
    '[class.app-checkbox--disabled]': 'isDisabled()',
    '[class.app-checkbox--checked]': 'checked()',
    '[class.app-checkbox--no-label]': 'noLabel()',
  },
})
export class AppCheckboxComponent implements ControlValueAccessor, AppControl {
  readonly checked = model(false);
  readonly indeterminate = input(false);
  readonly disabled = input(false);
  /** Set when used standalone in a table cell (no visible label). */
  readonly noLabel = input(false);
  readonly describedBy = input<string>('');

  private readonly generated = signal(nextControlId('app-checkbox'));
  readonly id = computed(() => this.generated());

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChangeFn: (value: boolean) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  protected onToggle(event: Event): void {
    const next = (event.target as HTMLInputElement).checked;
    this.checked.set(next);
    this.onChangeFn(next);
  }

  writeValue(value: unknown): void {
    this.checked.set(value === true);
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
