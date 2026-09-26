import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { type ThemeMode } from '@senbilan/design-system/tokens';
import { AppIconButtonComponent } from '../button/app-icon-button.component';
import { type ButtonSize, type IconButtonVariant } from '../button/button.types';
import {
  AppMenuComponent,
  AppMenuItemComponent,
  AppMenuTriggerDirective,
} from '../menu/app-menu.component';
import { APP_THEME_MODE } from './theme-mode.bridge';
import { THEME_MODE_ICONS, THEME_MODE_OPTIONS } from './theme-toggle.types';

/**
 * Theme picker (light / dark / system) via dropdown menu.
 * Requires `APP_THEME_MODE` from the app composition root.
 */
@Component({
  selector: 'app-theme-toggle',
  imports: [
    AppIconButtonComponent,
    AppMenuComponent,
    AppMenuItemComponent,
    AppMenuTriggerDirective,
    TranslocoPipe,
  ],
  template: `
    <button
      app-icon-button
      type="button"
      [icon]="icon()"
      [label]="labelKey() | transloco"
      [variant]="variant()"
      [size]="size()"
      [appMenuTriggerFor]="themeMenu"
    >
      <span class="app-visually-hidden">{{ labelKey() | transloco }}</span>
    </button>

    <ng-template #themeMenu>
      <app-menu [ariaLabel]="labelKey() | transloco">
        @for (option of options; track option.mode) {
          <button
            appMenuItem
            type="button"
            [icon]="isSelected(option.mode) ? 'check' : option.icon"
            [attr.data-active]="isSelected(option.mode) || null"
            (click)="select(option.mode)"
          >
            {{ option.labelKey | transloco }}
          </button>
        }
      </app-menu>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-theme-toggle' },
})
export class AppThemeToggleComponent {
  private readonly theme = inject(APP_THEME_MODE, { optional: true });

  readonly variant = input<IconButtonVariant>('ghost');
  readonly size = input<ButtonSize>('md');
  /** Accessible name i18n key. */
  readonly labelKey = input('common.theme');

  protected readonly options = THEME_MODE_OPTIONS;

  protected readonly icon = computed(() => {
    const mode = this.theme?.mode() ?? 'system';
    return THEME_MODE_ICONS[mode];
  });

  protected isSelected(mode: ThemeMode): boolean {
    return (this.theme?.mode() ?? 'system') === mode;
  }

  protected select(mode: ThemeMode): void {
    this.theme?.setMode(mode);
  }
}
