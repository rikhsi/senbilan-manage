import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';

/**
 * Select-shaped control that opens a caller-owned drawer instead of a menu.
 */
@Component({
  selector: 'app-drawer-select',
  imports: [AppIconComponent],
  template: `
    <button type="button" class="app-drawer-select__trigger" (click)="open.emit()">
      <span
        class="app-drawer-select__value"
        [class.app-drawer-select__value--placeholder]="!value()"
      >
        {{ value() || placeholder() }}
      </span>
      @if (value()) {
        <span
          class="app-drawer-select__clear"
          role="button"
          tabindex="-1"
          [attr.aria-label]="clearLabel()"
          (click)="onClear($event)"
          (keydown.enter)="onClear($event)"
        >
          <app-icon name="x" size="xs" />
        </span>
      }
      <app-icon class="app-drawer-select__chevron" name="chevron-down" size="sm" />
    </button>
  `,
  styleUrl: './app-drawer-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-drawer-select' },
})
export class AppDrawerSelectComponent {
  readonly value = input('');
  readonly placeholder = input('');
  readonly clearLabel = input('');

  readonly open = output<void>();
  readonly cleared = output<void>();

  protected onClear(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cleared.emit();
  }
}
