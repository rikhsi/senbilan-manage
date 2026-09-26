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
import { type RadioOption } from './radio-group.types';

export type { RadioOption } from './radio-group.types';

/**
 * Radio group rendered as a list or as segmented cards (`variant="cards"`) —
 * the latter is used for theme/density pickers in Settings.
 */
@Component({
  selector: 'app-radio-group',
  imports: [AppIconComponent],
  template: `
    <div
      class="app-radio-group__list"
      role="radiogroup"
      [attr.aria-labelledby]="labelledBy() || null"
      [id]="id()"
    >
      @for (option of options(); track option.value) {
        <label
          class="app-radio"
          [class.app-radio--checked]="option.value === value()"
          [class.app-radio--disabled]="isDisabled() || option.disabled"
        >
          <input
            class="app-radio__input"
            type="radio"
            [name]="id()"
            [value]="option.value"
            [checked]="option.value === value()"
            [disabled]="isDisabled() || (option.disabled ?? false)"
            (change)="select(option.value)"
            (blur)="onTouched()"
          />
          <span class="app-radio__control" aria-hidden="true"></span>
          @if (option.icon) {
            <app-icon class="app-radio__icon" [name]="option.icon" size="md" />
          }
          <span class="app-radio__text">
            <span class="app-radio__label">{{ option.label }}</span>
            @if (option.description) {
              <span class="app-radio__description">{{ option.description }}</span>
            }
          </span>
        </label>
      }
    </div>
  `,
  styleUrl: './app-radio-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppRadioGroupComponent),
      multi: true,
    },
    { provide: APP_CONTROL, useExisting: forwardRef(() => AppRadioGroupComponent) },
  ],
  host: { class: 'app-radio-group', '[attr.data-variant]': 'variant()' },
})
export class AppRadioGroupComponent<T extends string = string>
  implements ControlValueAccessor, AppControl
{
  readonly options = input.required<readonly RadioOption<T>[]>();
  readonly value = model<T | null>(null);
  readonly disabled = input(false);
  readonly variant = input<'list' | 'cards'>('list');
  readonly labelledBy = input<string>('');

  private readonly generated = signal(nextControlId('app-radio'));
  readonly id = computed(() => this.generated());

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChangeFn: (value: T | null) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  protected select(value: T): void {
    this.value.set(value);
    this.onChangeFn(value);
  }

  writeValue(value: unknown): void {
    this.value.set((value as T | null) ?? null);
  }
  registerOnChange(fn: (value: T | null) => void): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
