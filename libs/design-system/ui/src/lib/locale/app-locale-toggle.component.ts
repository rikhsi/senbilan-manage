import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { type ButtonSize } from '../button/button.types';
import {
  AppMenuComponent,
  AppMenuItemComponent,
  AppMenuTriggerDirective,
} from '../menu/app-menu.component';
import { AppLocaleFlagComponent } from './app-locale-flag.component';
import { isLocaleFlagId, LOCALE_NATIVE_LABELS, type LocaleFlagId } from './locale-toggle.types';

/**
 * Language picker via dropdown menu (Transloco `availableLangs`).
 */
@Component({
  selector: 'app-locale-toggle',
  imports: [
    AppIconComponent,
    AppLocaleFlagComponent,
    AppMenuComponent,
    AppMenuItemComponent,
    AppMenuTriggerDirective,
    TranslocoPipe,
  ],
  template: `
    <button
      type="button"
      class="app-locale-toggle"
      [attr.data-size]="size()"
      [attr.aria-label]="labelKey() | transloco"
      [attr.title]="labelKey() | transloco"
      [appMenuTriggerFor]="localeMenu"
    >
      <app-icon name="globe" [size]="size() === 'sm' ? 'sm' : 'md'" />
    </button>

    <ng-template #localeMenu>
      <app-menu [ariaLabel]="labelKey() | transloco">
        @for (locale of locales(); track locale.id) {
          <button
            appMenuItem
            type="button"
            [attr.data-active]="locale.id === activeLang() || null"
            (click)="select(locale.id)"
          >
            <span class="app-locale-toggle__option">
              @if (locale.flagId; as flagId) {
                <app-locale-flag [locale]="flagId" />
              }
              <span>{{ locale.label }}</span>
            </span>
          </button>
        }
      </app-menu>
    </ng-template>
  `,
  styleUrl: './app-locale-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-locale-toggle-host' },
})
export class AppLocaleToggleComponent {
  private readonly i18n = inject(TranslocoService);

  readonly size = input<ButtonSize>('md');
  /** Accessible name i18n key. */
  readonly labelKey = input('common.language');

  protected readonly activeLang = toSignal(this.i18n.langChanges$, {
    initialValue: this.i18n.getActiveLang(),
  });

  protected readonly locales = computed(() => {
    this.activeLang();
    return (this.i18n.getAvailableLangs() as (string | { id: string })[]).map((lang) => {
      const id = typeof lang === 'string' ? lang : lang.id;
      const flagId: LocaleFlagId | null = isLocaleFlagId(id) ? id : null;
      return {
        id,
        flagId,
        label: LOCALE_NATIVE_LABELS[id] ?? id,
      };
    });
  });

  protected select(locale: string): void {
    this.i18n.setActiveLang(locale);
  }
}
