import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { moveColumn, orderColumns } from '@senbilan/shared/util';
import { AppCheckboxComponent } from '../form/app-checkbox.component';

export interface ColumnSetting {
  readonly key: string;
  readonly header: string;
  /** When false the column stays visible and its checkbox is disabled. */
  readonly hideable?: boolean;
}

/**
 * Column visibility and order for a list drawer.
 * Drag the grip to move a column; the checkbox shows or hides it.
 */
@Component({
  selector: 'app-column-settings',
  imports: [AppCheckboxComponent, AppIconComponent],
  template: `
    <div
      class="app-column-settings"
      role="group"
      [class.app-column-settings--divided]="divided()"
      [attr.aria-label]="groupLabel()"
    >
      @if (showTitle()) {
        <p class="app-column-settings__title">{{ groupLabel() }}</p>
      }
      <ul class="app-column-settings__list">
        @for (column of displayColumns(); track column.key) {
          <li
            class="app-column-settings__row"
            [class.app-column-settings__row--drag]="dragKey() === column.key"
            [class.app-column-settings__row--over]="overKey() === column.key"
            [attr.data-column-key]="column.key"
          >
            <button
              type="button"
              class="app-column-settings__grip"
              draggable="false"
              [attr.aria-label]="dragLabel()"
              (pointerdown)="onGripDown($event, column.key)"
            >
              <app-icon name="grip-vertical" size="sm" />
              <span class="app-column-settings__grip-label">{{ dragLabel() }}</span>
            </button>
            <app-checkbox
              [checked]="isShown(column)"
              [disabled]="!canHide(column)"
              (checkedChange)="toggle(column, $event)"
            >
              {{ column.header }}
            </app-checkbox>
          </li>
        }
      </ul>
    </div>
  `,
  styleUrl: './app-column-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-column-settings-host' },
})
export class AppColumnSettingsComponent {
  private readonly destroyRef = inject(DestroyRef);
  private detachDrag: (() => void) | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.detachDrag?.());
  }

  readonly columns = input.required<readonly ColumnSetting[]>();
  readonly hidden = input<readonly string[]>([]);
  readonly order = input<readonly string[]>([]);
  readonly groupLabel = input.required<string>();
  readonly dragLabel = input.required<string>();
  /** Draws a divider above the list when it sits under other drawer fields. */
  readonly divided = input(true);
  readonly showTitle = input(true);

  readonly hiddenChange = output<readonly string[]>();
  readonly orderChange = output<readonly string[]>();

  protected readonly dragKey = signal<string | null>(null);
  protected readonly overKey = signal<string | null>(null);

  protected readonly displayColumns = computed(() => orderColumns(this.columns(), this.order()));

  protected isShown(column: ColumnSetting): boolean {
    return column.hideable === false || !this.hidden().includes(column.key);
  }

  protected canHide(column: ColumnSetting): boolean {
    if (column.hideable === false) {
      return false;
    }
    if (this.hidden().includes(column.key)) {
      return true;
    }
    const visible = this.columns().filter(
      (item) => item.hideable === false || !this.hidden().includes(item.key),
    );
    return visible.length > 1;
  }

  protected toggle(column: ColumnSetting, visible: boolean): void {
    if (!this.canHide(column) && !visible) {
      return;
    }
    const hidden = this.hidden();
    this.hiddenChange.emit(
      visible ? hidden.filter((key) => key !== column.key) : [...hidden, column.key],
    );
  }

  protected onGripDown(event: PointerEvent, key: string): void {
    if (event.button !== 0 || this.dragKey()) {
      return;
    }
    event.preventDefault();
    this.dragKey.set(key);
    this.overKey.set(null);
    const move = (next: PointerEvent): void => this.track(next);
    const up = (next: PointerEvent): void => {
      this.track(next);
      this.finishDrag();
    };
    this.detachDrag = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  private finishDrag(): void {
    this.detachDrag?.();
    this.detachDrag = null;
    this.commit();
  }

  private track(event: PointerEvent): void {
    const hit = document.elementFromPoint(event.clientX, event.clientY);
    const key = hit?.closest('[data-column-key]')?.getAttribute('data-column-key') ?? null;
    this.overKey.set(key && key !== this.dragKey() ? key : null);
  }

  private commit(): void {
    const from = this.dragKey();
    const to = this.overKey();
    if (from && to) {
      this.orderChange.emit(moveColumn(this.currentOrder(), from, to));
    }
    this.dragKey.set(null);
    this.overKey.set(null);
  }

  private currentOrder(): readonly string[] {
    return this.displayColumns().map((column) => column.key);
  }
}
