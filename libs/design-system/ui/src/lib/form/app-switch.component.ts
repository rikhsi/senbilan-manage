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
import { APP_CONTROL, nextControlId, type AppControl } from './app-control';

/** Toggle switch (role=switch). Use for immediate settings, not for form submission fields. */
@Component({
  selector: 'app-switch',
  template: `
    <button
      type="button"
      role="switch"
      class="app-switch__track"
      [id]="id()"
      [attr.aria-checked]="checked()"
      [attr.aria-labelledby]="labelId"
      [attr.aria-describedby]="describedBy() || null"
      [disabled]="isDisabled()"
      (click)="toggle()"
      (blur)="onTouched()"
    >
      <span class="app-switch__thumb"></span>
    </button>
    <span class="app-switch__label" [id]="labelId" (click)="toggle()"><ng-content /></span>
  `,
  styleUrl: './app-switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppSwitchComponent), multi: true },
    { provide: APP_CONTROL, useExisting: forwardRef(() => AppSwitchComponent) },
  ],
  host: {
    class: 'app-switch',
    '[class.app-switch--disabled]': 'isDisabled()',
    '[class.app-switch--on]': 'checked()',
    '[attr.data-size]': 'size()',
  },
})
export class AppSwitchComponent implements ControlValueAccessor, AppControl {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly size = input<'sm' | 'md'>('md');
  readonly describedBy = input<string>('');

  private readonly generated = signal(nextControlId('app-switch'));
  readonly id = computed(() => this.generated());
  readonly labelId = `${this.generated()}-label`;

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChangeFn: (value: boolean) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    const next = !this.checked();
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
