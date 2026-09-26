import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  type ConnectedPosition,
} from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';

const MENU_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
];

/** Compact list menu for pagination values. Replaces a native select. */
@Component({
  selector: 'app-pagination-menu',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, AppIconComponent],
  template: `
    <button
      #trigger
      type="button"
      class="app-pagination-menu__trigger"
      cdkOverlayOrigin
      #origin="cdkOverlayOrigin"
      role="combobox"
      aria-haspopup="listbox"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="listId"
      [attr.aria-label]="label() + ' ' + value()"
      [disabled]="disabled()"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      <span class="app-pagination-menu__value">{{ value() }}</span>
      <app-icon class="app-pagination-menu__chevron" name="chevron-down" size="sm" />
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayMinWidth]="trigger.offsetWidth"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      cdkConnectedOverlayPanelClass="app-menu-panel"
      (backdropClick)="close(false)"
      (detach)="close(false)"
    >
      <ul
        #list
        class="app-pagination-menu__list"
        role="listbox"
        tabindex="0"
        [id]="listId"
        [attr.aria-label]="label()"
        [attr.aria-activedescendant]="activeIndex() >= 0 ? optionId(activeIndex()) : null"
        (keydown)="onListKeydown($event)"
      >
        @for (option of options(); track option; let index = $index) {
          <li
            #optionEl
            class="app-pagination-menu__option"
            role="option"
            [id]="optionId(index)"
            [attr.aria-selected]="option === value()"
            [class.app-pagination-menu__option--active]="index === activeIndex()"
            [class.app-pagination-menu__option--selected]="option === value()"
            tabindex="-1"
            (click)="pick(option)"
            (keydown.enter)="pick(option)"
            (keydown.space)="pick(option); $event.preventDefault()"
            (mousemove)="activeIndex.set(index)"
          >
            <span>{{ option }}</span>
            @if (option === value()) {
              <app-icon name="check" size="sm" />
            }
          </li>
        }
      </ul>
    </ng-template>
  `,
  styleUrl: './app-pagination-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-pagination-menu',
    '[class.app-pagination-menu--open]': 'open()',
  },
})
export class AppPaginationMenuComponent {
  private static counter = 0;

  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly options = input.required<readonly number[]>();
  readonly disabled = input(false);
  readonly valueChange = output<number>();

  protected readonly listId = `app-pagination-menu-${AppPaginationMenuComponent.counter++}`;
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly positions = MENU_POSITIONS;

  private readonly list = viewChild<ElementRef<HTMLElement>>('list');
  private readonly optionElements = viewChildren<ElementRef<HTMLElement>>('optionEl');

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

  protected pick(option: number): void {
    this.close();
    if (option !== this.value()) {
      this.valueChange.emit(option);
    }
  }

  protected close(restoreFocus = true): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    if (restoreFocus) {
      this.trigger()?.nativeElement.focus();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      if (!this.open()) {
        this.show();
      }
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  protected onListKeydown(event: KeyboardEvent): void {
    const count = this.options().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.move(1, count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1, count);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(0);
        this.scrollActive();
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(Math.max(0, count - 1));
        this.scrollActive();
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const option = this.options()[this.activeIndex()];
        if (option !== undefined) {
          this.pick(option);
        }
        break;
      }
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
    return `${this.listId}-option-${index}`;
  }

  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');

  private show(): void {
    const index = this.options().indexOf(this.value());
    this.activeIndex.set(index >= 0 ? index : 0);
    this.open.set(true);
    queueMicrotask(() => {
      this.list()?.nativeElement.focus();
      this.scrollActive();
    });
  }

  private move(delta: 1 | -1, count: number): void {
    if (count === 0) {
      return;
    }
    const current = this.activeIndex();
    const next = current < 0 ? 0 : (current + delta + count) % count;
    this.activeIndex.set(next);
    this.scrollActive();
  }

  private scrollActive(): void {
    queueMicrotask(() => {
      this.optionElements()[this.activeIndex()]?.nativeElement.scrollIntoView({ block: 'nearest' });
    });
  }
}
