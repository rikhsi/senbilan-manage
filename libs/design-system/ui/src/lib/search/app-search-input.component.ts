import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';

/**
 * Search field with icon, clear button and debounced `search` output.
 * `value` is the immediate model; `search` emits after `debounce` ms of silence.
 */
@Component({
  selector: 'app-search-input',
  imports: [AppIconComponent],
  template: `
    <app-icon class="app-search-input__icon" name="search" size="sm" />
    <input
      #field
      class="app-search-input__field"
      type="search"
      autocomplete="off"
      [attr.placeholder]="placeholder()"
      [attr.aria-label]="ariaLabel() || placeholder()"
      [value]="value()"
      [disabled]="disabled()"
      (input)="onInput(field.value)"
      (keydown.escape)="clear(field)"
    />
    @if (value()) {
      <button
        type="button"
        class="app-search-input__clear"
        [attr.aria-label]="clearLabel()"
        (click)="clear(field)"
      >
        <app-icon name="x" size="xs" />
      </button>
    } @else if (shortcutHint()) {
      <kbd class="app-search-input__kbd">{{ shortcutHint() }}</kbd>
    }
  `,
  styleUrl: './app-search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-search-input',
    '[class.app-search-input--focused]': 'focused()',
    '[attr.data-size]': 'size()',
    '(focusin)': 'focused.set(true)',
    '(focusout)': 'focused.set(false)',
  },
})
export class AppSearchInputComponent {
  readonly value = model('');
  readonly placeholder = input('');
  readonly ariaLabel = input('');
  readonly clearLabel = input('');
  readonly shortcutHint = input('');
  readonly debounce = input(300);
  readonly disabled = input(false);
  readonly size = input<'md' | 'lg'>('md');
  readonly search = output<string>();

  protected readonly focused = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancel());
  }

  protected onInput(next: string): void {
    this.value.set(next);
    this.cancel();
    this.timer = setTimeout(() => this.search.emit(next.trim()), this.debounce());
  }

  protected clear(field: HTMLInputElement): void {
    this.cancel();
    this.value.set('');
    this.search.emit('');
    field.focus();
  }

  private cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
