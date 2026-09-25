import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { APP_CONFIG } from '@senbilan/shared/config';
import {
  AppButtonComponent,
  AppFormFieldComponent,
  AppInputDirective,
  AppRadioGroupComponent,
  type RadioOption,
  AppTabsComponent,
  type TabItem,
} from '@senbilan/design-system/ui';

type SettingsTab = 'theme' | 'language' | 'profile';
type ThemeMode = 'light' | 'dark' | 'system';
type AppLocale = 'ru' | 'en' | 'uz';

@Component({
  selector: 'settings-page',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    AppButtonComponent,
    AppFormFieldComponent,
    AppInputDirective,
    AppRadioGroupComponent,
    AppTabsComponent,
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  private readonly i18n = inject(TranslocoService);
  private readonly fb = inject(FormBuilder);
  private readonly config = inject(APP_CONFIG, { optional: true });

  protected readonly tab = signal<SettingsTab>('theme');
  protected readonly theme = signal<ThemeMode>('system');
  protected readonly language = signal<AppLocale>(this.config?.defaultLocale ?? 'ru');

  protected readonly tabs = computed<readonly TabItem<SettingsTab>[]>(() => [
    { id: 'theme', label: this.i18n.translate('settings.tabs.theme'), icon: 'palette' },
    { id: 'language', label: this.i18n.translate('settings.tabs.language'), icon: 'globe' },
    { id: 'profile', label: this.i18n.translate('settings.tabs.profile'), icon: 'user' },
  ]);

  protected readonly themeOptions = computed<readonly RadioOption<ThemeMode>[]>(() => [
    { value: 'light', label: this.i18n.translate('settings.theme.light') },
    { value: 'dark', label: this.i18n.translate('settings.theme.dark') },
    { value: 'system', label: this.i18n.translate('settings.theme.system') },
  ]);

  protected readonly languageOptions = computed<readonly RadioOption<AppLocale>[]>(() => {
    const locales = this.config?.availableLocales ?? (['ru', 'en', 'uz'] as const);
    return locales.map((locale) => ({ value: locale, label: locale.toUpperCase() }));
  });

  protected readonly profileForm = this.fb.nonNullable.group({
    firstName: [''],
    lastName: [''],
    email: [{ value: '', disabled: true }],
  });

  protected onThemeChange(value: ThemeMode): void {
    this.theme.set(value);
    let resolved: 'light' | 'dark' = value === 'dark' ? 'dark' : 'light';
    if (value === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset['theme'] = resolved;
  }

  protected onLanguageChange(value: AppLocale): void {
    this.language.set(value);
    // TODO: wire TranslocoService.setActiveLang via shared/i18n.
    this.i18n.setActiveLang(value);
  }

  protected saveProfile(): void {
    // TODO: call UpdateProfileUseCase once session user id is available.
  }
}
