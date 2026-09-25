import { computed, Directive, ElementRef, inject, input, signal } from '@angular/core';
import { APP_CONTROL, type AppControl, nextControlId } from './app-control';
import { AppFormFieldComponent } from './app-form-field.component';

/**
 * Styles a native `<input>`, `<textarea>` or `<select>` as a design-system control and
 * wires a11y attributes from the surrounding AppFormField. Works with Signal Forms
 * (`[control]`), Reactive Forms (`[formControl]`) and template-driven forms alike,
 * because it never touches the value.
 */
@Directive({
  selector: 'input[appInput], textarea[appInput], select[appInput]',
  providers: [{ provide: APP_CONTROL, useExisting: AppInputDirective }],
  host: {
    class: 'app-input',
    '[id]': 'id()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
    '[attr.data-size]': 'size()',
    '[class.app-input--select]': 'isSelect',
    '[class.app-input--textarea]': 'isTextarea',
  },
})
export class AppInputDirective implements AppControl {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly field = inject(AppFormFieldComponent, { optional: true, host: false });

  /** Optional explicit id; otherwise generated. */
  readonly inputId = input<string | undefined>(undefined, { alias: 'id' });
  readonly size = input<'md' | 'lg'>('md');

  private readonly generated = signal(nextControlId('app-input'));
  readonly id = computed(() => this.inputId() ?? this.generated());

  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);
  protected readonly invalid = computed(() => this.field?.invalid() ?? false);

  protected readonly isSelect = this.host.nativeElement.tagName === 'SELECT';
  protected readonly isTextarea = this.host.nativeElement.tagName === 'TEXTAREA';
}
