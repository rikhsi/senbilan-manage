import { Dialog, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@jsverse/transloco';
import { APP_ICONS, AppIconComponent, type AppIconName } from '@senbilan/design-system/icons';
import { AppSearchInputComponent } from '@senbilan/design-system/ui';
import {
  LAYOUT_CAN_ACCESS,
  LAYOUT_COMMAND_PALETTE,
  type LayoutCommandItem,
} from '../layout-bridges';

const isAppIconName = (value: string): value is AppIconName =>
  Object.prototype.hasOwnProperty.call(APP_ICONS, value);

const readIsOpen = (bridge: { readonly isOpen: (() => boolean) | { (): boolean } }): boolean => {
  const value = bridge.isOpen;
  return typeof value === 'function' ? value() : false;
};

@Component({
  selector: 'app-command-palette-panel',
  imports: [TranslocoDirective, AppSearchInputComponent, AppIconComponent],
  template: `
    <ng-container *transloco="let t">
      <div class="app-command-palette" role="dialog" [attr.aria-label]="t('common.commandPalette')">
        <app-search-input
          [value]="query()"
          [placeholder]="t('common.commandPaletteHint')"
          [ariaLabel]="t('common.commandPalette')"
          [clearLabel]="t('common.close')"
          shortcutHint="Esc"
          (valueChange)="onQuery($event)"
        />

        <ul class="app-command-palette__list" role="listbox">
          @for (command of commands(); track command.id; let index = $index) {
            <li role="option" [attr.aria-selected]="index === activeIndex()">
              <button
                type="button"
                class="app-command-palette__item"
                [class.app-command-palette__item--active]="index === activeIndex()"
                (click)="run(command)"
                (mouseenter)="activeIndex.set(index)"
              >
                @if (iconName(command); as icon) {
                  <app-icon class="app-command-palette__icon" [name]="icon" size="sm" />
                }
                <span class="app-command-palette__label">
                  {{ command.labelKey ? t(command.labelKey) : command.label }}
                </span>
                @if (command.shortcut) {
                  <kbd class="app-command-palette__shortcut">{{ command.shortcut }}</kbd>
                }
              </button>
            </li>
          } @empty {
            <li class="app-command-palette__empty">{{ t('common.noCommands') }}</li>
          }
        </ul>
      </div>
    </ng-container>
  `,
  styleUrl: './app-command-palette.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-command-palette-host',
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class AppCommandPalettePanelComponent {
  private readonly palette = inject(LAYOUT_COMMAND_PALETTE);
  private readonly canAccessFn = inject(LAYOUT_CAN_ACCESS, { optional: true });
  private readonly dialogRef = inject(DialogRef<unknown, AppCommandPalettePanelComponent>, {
    optional: true,
  });

  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  protected readonly commands = computed(() => {
    const q = this.query().trim().toLowerCase();
    const can = this.canAccessFn;
    return this.palette.all().filter((command) => {
      if (command.permission !== undefined && can && !can(command.permission)) {
        return false;
      }
      if (!q) {
        return true;
      }
      const haystack = [command.label, command.labelKey, ...(command.keywords ?? [])]
        .filter((part): part is string => part !== undefined && part.length > 0)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  });

  protected iconName(command: LayoutCommandItem): AppIconName | null {
    return command.icon && isAppIconName(command.icon) ? command.icon : null;
  }

  protected onQuery(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  protected async run(command: LayoutCommandItem): Promise<void> {
    await this.palette.run(command.id);
    this.dialogRef?.close();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.commands();
    const count = Math.max(items.length, 1);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((index) => (index + 1) % count);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((index) => (index - 1 + count) % count);
    } else if (event.key === 'Enter') {
      const command = items[this.activeIndex()];
      if (command) {
        event.preventDefault();
        void this.run(command);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.palette.close();
      this.dialogRef?.close();
    }
  }
}

/**
 * Host that opens the command palette overlay on Ctrl/Cmd+K and when the
 * layout command-palette bridge requests it.
 */
@Component({
  selector: 'app-command-palette',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onGlobalKey($event)',
  },
})
export class AppCommandPaletteComponent {
  private readonly dialog = inject(Dialog);
  private readonly palette = inject(LAYOUT_COMMAND_PALETTE);
  private readonly destroyRef = inject(DestroyRef);
  private openRef: DialogRef<unknown, AppCommandPalettePanelComponent> | null = null;

  constructor() {
    effect(() => {
      const open = readIsOpen(this.palette);
      if (open) {
        this.openOverlay();
      } else if (this.openRef) {
        this.openRef.close();
        this.openRef = null;
      }
    });
  }

  protected onGlobalKey(event: KeyboardEvent): void {
    const isPalette = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    if (!isPalette) {
      return;
    }
    event.preventDefault();
    this.palette.toggle();
  }

  private openOverlay(): void {
    if (this.openRef) {
      return;
    }
    this.openRef = this.dialog.open(AppCommandPalettePanelComponent, {
      panelClass: ['app-overlay-panel', 'app-command-palette-panel'],
      backdropClass: 'app-overlay-backdrop',
      width: 'min(32rem, calc(100vw - 2rem))',
      maxHeight: 'min(28rem, calc(100dvh - 4rem))',
    });
    this.openRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.openRef = null;
      if (readIsOpen(this.palette)) {
        this.palette.close();
      }
    });
  }
}
