import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { type TabItem } from './tabs.types';

export type { TabItem } from './tabs.types';

/**
 * Accessible tab list (WAI-ARIA tabs pattern, roving tabindex). Content is
 * rendered by the parent with `@switch (tabs.selected())` so tabs stay dumb.
 */
@Component({
  selector: 'app-tabs',
  imports: [AppIconComponent],
  template: `
    <div class="app-tabs__list" role="tablist" [attr.aria-label]="label() || null">
      @for (tab of items(); track tab.id) {
        <button
          type="button"
          role="tab"
          class="app-tabs__tab"
          [id]="idFor(tab.id)"
          [attr.aria-selected]="tab.id === selected()"
          [attr.aria-controls]="panelIdFor(tab.id)"
          [attr.tabindex]="tab.id === selected() ? 0 : -1"
          [disabled]="tab.disabled ?? false"
          (click)="select(tab.id)"
          (keydown)="onKeydown($event, tab.id)"
        >
          @if (tab.icon) {
            <app-icon [name]="tab.icon" size="sm" />
          }
          <span>{{ tab.label }}</span>
          @if (tab.badge !== undefined) {
            <span class="app-tabs__badge">{{ tab.badge }}</span>
          }
        </button>
      }
    </div>
  `,
  styleUrl: './app-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-tabs', '[attr.data-variant]': 'variant()' },
})
export class AppTabsComponent<TId extends string = string> {
  readonly items = input.required<readonly TabItem<TId>[]>();
  readonly selected = model<TId>();
  readonly label = input<string>('');
  readonly variant = input<'underline' | 'pill'>('underline');
  readonly idPrefix = input<string>('tab');

  protected readonly enabledIds = computed(() =>
    this.items()
      .filter((t) => !t.disabled)
      .map((t) => t.id),
  );

  protected idFor(id: TId): string {
    return `${this.idPrefix()}-${id}`;
  }
  protected panelIdFor(id: TId): string {
    return `${this.idPrefix()}-panel-${id}`;
  }

  protected select(id: TId): void {
    this.selected.set(id);
  }

  protected onKeydown(event: KeyboardEvent, current: TId): void {
    const ids = this.enabledIds();
    const index = ids.indexOf(current);
    let next: TId | undefined;
    switch (event.key) {
      case 'ArrowRight':
        next = ids[(index + 1) % ids.length];
        break;
      case 'ArrowLeft':
        next = ids[(index - 1 + ids.length) % ids.length];
        break;
      case 'Home':
        next = ids[0];
        break;
      case 'End':
        next = ids[ids.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next !== undefined) {
      this.select(next);
      (event.currentTarget as HTMLElement).parentElement
        ?.querySelector<HTMLElement>(`#${this.idFor(next)}`)
        ?.focus();
    }
  }
}
