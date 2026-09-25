import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  type ConnectedPosition,
} from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { APP_CONTROL, type AppControl, nextControlId } from '../form/app-control';
import { AppFormFieldComponent } from '../form/app-form-field.component';

export interface SelectOption<T = string> {
  readonly value: T;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
}

export interface SelectLabels {
  readonly placeholder: string;
  readonly searchPlaceholder: string;
  readonly noResults: string;
  readonly clear: string;
  /** "{{count}} selected" — already interpolated by the caller via a function. */
  readonly selectedCount: (count: number) => string;
}

const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

/**
 * Select / multi-select / autocomplete in one CVA component.
 * - `multiple` → value is `T[]`, otherwise `T | null`
 * - `searchable` → filter input inside the panel (autocomplete)
 * Keyboard: ArrowUp/Down, Home/End, Enter/Space, Escape, type-ahead via search.
 * Implements a listbox pattern; works with Reactive Forms and Signal Forms.
 */
@Component({
  selector: 'app-select',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, AppIconComponent],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppSelectComponent), multi: true },
    { provide: APP_CONTROL, useExisting: forwardRef(() => AppSelectComponent) },
  ],
  templateUrl: './app-select.component.html',
  styleUrl: './app-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-select',
    '[class.app-select--open]': 'open()',
    '[class.app-select--disabled]': 'disabled()',
    '[attr.data-size]': 'size()',
  },
})
export class AppSelectComponent<T = string> implements ControlValueAccessor, AppControl {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly options = input.required<readonly SelectOption<T>[]>();
  readonly labels = input.required<SelectLabels>();
  readonly multiple = input(false);
  readonly searchable = input(false);
  readonly clearable = input(false);
  readonly size = input<'md' | 'lg'>('md');
  /** Compare values (e.g. by id for object values). Defaults to `===`. */
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);

  private readonly field = inject(AppFormFieldComponent, { optional: true, host: false });

  readonly id = signal(nextControlId('app-select'));
  readonly listboxId = `${this.id()}-listbox`;
  readonly disabled = signal(false);
  protected readonly invalid = computed(() => this.field?.invalid() ?? false);
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(-1);
  protected readonly selected = signal<readonly T[]>([]);

  protected readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  protected readonly searchField = viewChild<ElementRef<HTMLInputElement>>('searchField');
  protected readonly optionElements = viewChildren<ElementRef<HTMLElement>>('optionEl');

  protected readonly positions = POSITIONS;

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase();
    const all = this.options();
    return q ? all.filter((option) => option.label.toLocaleLowerCase().includes(q)) : all;
  });

  protected readonly selectedOptions = computed(() =>
    this.options().filter((option) =>
      this.selected().some((value) => this.compareWith()(value, option.value)),
    ),
  );

  protected readonly displayText = computed(() => {
    const picked = this.selectedOptions();
    if (picked.length === 0) {
      return '';
    }
    if (!this.multiple()) {
      return picked[0]?.label ?? '';
    }
    return picked.length <= 2
      ? picked.map((option) => option.label).join(', ')
      : this.labels().selectedCount(picked.length);
  });

  protected readonly panelWidth = computed(
    () => this.host.nativeElement.getBoundingClientRect().width,
  );

  private onChange: (value: T | T[] | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  // ---- CVA -------------------------------------------------------------------
  writeValue(value: T | T[] | null | undefined): void {
    if (value === null || value === undefined) {
      this.selected.set([]);
    } else {
      this.selected.set(Array.isArray(value) ? [...value] : [value]);
    }
  }
  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // ---- interaction -----------------------------------------------------------
  protected isSelected(option: SelectOption<T>): boolean {
    return this.selected().some((value) => this.compareWith()(value, option.value));
  }

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.show();
    }
  }

  protected show(): void {
    this.open.set(true);
    const firstSelected = this.filtered().findIndex((option) => this.isSelected(option));
    this.activeIndex.set(firstSelected >= 0 ? firstSelected : this.firstEnabledIndex(0, 1));
    queueMicrotask(() => this.searchField()?.nativeElement.focus());
  }

  protected close(restoreFocus = true): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.query.set('');
    this.onTouched();
    if (restoreFocus) {
      this.trigger().nativeElement.focus();
    }
  }

  protected pick(option: SelectOption<T>): void {
    if (option.disabled) {
      return;
    }
    if (this.multiple()) {
      const next = this.isSelected(option)
        ? this.selected().filter((value) => !this.compareWith()(value, option.value))
        : [...this.selected(), option.value];
      this.selected.set(next);
      this.onChange([...next]);
    } else {
      this.selected.set([option.value]);
      this.onChange(option.value);
      this.close();
    }
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.selected.set([]);
    this.onChange(this.multiple() ? [] : null);
    this.onTouched();
  }

  protected onSearch(value: string): void {
    this.query.set(value);
    this.activeIndex.set(this.firstEnabledIndex(0, 1));
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.open()) {
          this.show();
        } else {
          this.onPanelKeydown(event);
        }
        break;
      case 'Escape':
        this.close();
        break;
      default:
        break;
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const count = this.filtered().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabledIndex(0, 1));
        this.scrollActiveIntoView();
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabledIndex(count - 1, -1));
        this.scrollActiveIntoView();
        break;
      case 'Enter':
        event.preventDefault();
        {
          const option = this.filtered()[this.activeIndex()];
          if (option) {
            this.pick(option);
          }
        }
        break;
      case ' ':
        if (!this.searchable()) {
          event.preventDefault();
          const option = this.filtered()[this.activeIndex()];
          if (option) {
            this.pick(option);
          }
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close(false);
        break;
      default:
        break;
    }
  }

  protected optionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  private move(delta: 1 | -1): void {
    const next = this.firstEnabledIndex(this.activeIndex() + delta, delta);
    if (next >= 0) {
      this.activeIndex.set(next);
      this.scrollActiveIntoView();
    }
  }

  private firstEnabledIndex(from: number, direction: 1 | -1): number {
    const list = this.filtered();
    for (let index = from; index >= 0 && index < list.length; index += direction) {
      if (!list[index]?.disabled) {
        return index;
      }
    }
    return -1;
  }

  private scrollActiveIntoView(): void {
    queueMicrotask(() => {
      this.optionElements()[this.activeIndex()]?.nativeElement.scrollIntoView({ block: 'nearest' });
    });
  }
}
