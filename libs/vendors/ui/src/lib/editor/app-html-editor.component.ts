import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { EditorComponent } from '@tinymce/tinymce-angular';
import type { RawEditorOptions } from 'tinymce';
import { APP_TINYMCE_BASE_CONFIG } from './tinymce-editor.config';

/**
 * TinyMCE rich-text control (CVA + `value` model). Assets must be served from `/assets/tinymce/`.
 */
@Component({
  selector: 'app-html-editor',
  imports: [FormsModule, EditorComponent],
  template: `
    <editor
      class="app-html-editor__field"
      [init]="init()"
      [ngModel]="value()"
      [disabled]="isDisabled()"
      (ngModelChange)="onValueChange($event)"
      (onBlur)="onBlur()"
    />
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .app-html-editor__field {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppHtmlEditorComponent),
      multi: true,
    },
  ],
  host: {
    class: 'app-html-editor',
    '[class.app-html-editor--disabled]': 'isDisabled()',
  },
})
export class AppHtmlEditorComponent implements ControlValueAccessor {
  readonly value = model('');
  readonly disabled = input(false);
  readonly height = input(320);
  /** Override TinyMCE UI language (`ru` by default). */
  readonly language = input('ru');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected readonly init = computed<RawEditorOptions>(() => {
    const dark =
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      ...APP_TINYMCE_BASE_CONFIG,
      height: this.height(),
      language: this.language(),
      skin: dark ? 'oxide-dark' : 'oxide',
      content_css: dark ? 'dark' : 'default',
    };
  });

  private onChangeFn: (value: string) => void = () => undefined;
  private onTouchedFn: () => void = () => undefined;

  protected onValueChange(next: string): void {
    this.value.set(next ?? '');
    this.onChangeFn(this.value());
  }

  protected onBlur(): void {
    this.onTouchedFn();
  }

  writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
