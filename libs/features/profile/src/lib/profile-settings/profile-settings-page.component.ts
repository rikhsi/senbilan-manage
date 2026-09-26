import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AppRadioGroupComponent, type RadioOption } from '@senbilan/design-system/ui';
import { APP_CONFIG } from '@senbilan/shared/config';
import { injectTranslocoReady, type AppLocale } from '@senbilan/shared/i18n';
import { ShellStore, type ShellDensity } from '@senbilan/shared/shell';
import { ThemeService, type ThemeMode } from '@senbilan/shared/theme';

@Component({
  selector: 'profile-settings-page',
  imports: [TranslocoPipe, AppRadioGroupComponent],
  templateUrl: './profile-settings-page.component.html',
  styleUrl: './profile-settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsPageComponent {
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();
  private readonly config = inject(APP_CONFIG, { optional: true });
  private readonly theme = inject(ThemeService);
  private readonly shell = inject(ShellStore);

  protected readonly themeOptions = computed<readonly RadioOption<ThemeMode>[]>(() => {
    this.i18nReady();
    return [
      { value: 'light', label: this.i18n.translate('profile.settings.theme.light') },
      { value: 'dark', label: this.i18n.translate('profile.settings.theme.dark') },
      { value: 'system', label: this.i18n.translate('profile.settings.theme.system') },
    ];
  });

  protected readonly densityOptions = computed<readonly RadioOption<ShellDensity>[]>(() => {
    this.i18nReady();
    return [
      { value: 'comfortable', label: this.i18n.translate('profile.settings.density.comfortable') },
      { value: 'compact', label: this.i18n.translate('profile.settings.density.compact') },
    ];
  });

  protected readonly languageOptions = computed<readonly RadioOption<AppLocale>[]>(() => {
    this.i18nReady();
    const locales = this.config?.availableLocales ?? (['ru', 'en', 'uz'] as const);
    return locales.map((locale) => ({
      value: locale,
      label: this.i18n.translate(`profile.settings.language.${locale}`),
    }));
  });

  protected readonly themeMode = computed(() => this.theme.mode());
  protected readonly density = computed(() => this.shell.density());
  protected readonly language = computed(
    () => (this.i18n.getActiveLang() as AppLocale) || this.config?.defaultLocale || 'ru',
  );

  protected onThemeChange(value: ThemeMode): void {
    this.theme.setMode(value);
  }

  protected onDensityChange(value: ShellDensity): void {
    this.shell.setDensity(value);
    this.theme.setDensity(value);
  }

  protected onLanguageChange(value: AppLocale): void {
    this.i18n.setActiveLang(value);
  }
}
