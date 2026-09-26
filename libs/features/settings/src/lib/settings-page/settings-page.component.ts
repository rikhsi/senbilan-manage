import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { UpdateProfileUseCase, UserRepository } from '@senbilan/core/application';
import {
  AppButtonComponent,
  AppFormFieldComponent,
  AppInputDirective,
  AppRadioGroupComponent,
  type RadioOption,
  AppTabsComponent,
  type TabItem,
  ToastService,
} from '@senbilan/design-system/ui';
import { AuthStore } from '@senbilan/shared/auth';
import { APP_CONFIG } from '@senbilan/shared/config';
import { disabled, form, FormField, required, submit } from '@senbilan/shared/ng';
import { ShellStore, type ShellDensity } from '@senbilan/shared/shell';
import { ThemeService, type ThemeMode } from '@senbilan/shared/theme';
import { type AppLocale, type SettingsProfileModel, type SettingsTab } from './settings.model';

@Component({
  selector: 'settings-page',
  imports: [
    FormField,
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
  private readonly config = inject(APP_CONFIG, { optional: true });
  private readonly auth = inject(AuthStore);
  private readonly theme = inject(ThemeService);
  private readonly shell = inject(ShellStore);
  private readonly toast = inject(ToastService);
  private readonly usersRepo = inject(UserRepository, { optional: true });

  protected readonly tab = signal<SettingsTab>('theme');
  protected readonly saving = signal(false);

  protected readonly tabs = computed<readonly TabItem<SettingsTab>[]>(() => [
    { id: 'theme', label: this.i18n.translate('settings.tabs.theme'), icon: 'palette' },
    { id: 'language', label: this.i18n.translate('settings.tabs.language'), icon: 'globe' },
    { id: 'density', label: this.i18n.translate('settings.tabs.density'), icon: 'sliders' },
    { id: 'profile', label: this.i18n.translate('settings.tabs.profile'), icon: 'user' },
  ]);

  protected readonly themeOptions = computed<readonly RadioOption<ThemeMode>[]>(() => [
    { value: 'light', label: this.i18n.translate('settings.theme.light') },
    { value: 'dark', label: this.i18n.translate('settings.theme.dark') },
    { value: 'system', label: this.i18n.translate('settings.theme.system') },
  ]);

  protected readonly densityOptions = computed<readonly RadioOption<ShellDensity>[]>(() => [
    { value: 'comfortable', label: this.i18n.translate('settings.density.comfortable') },
    { value: 'compact', label: this.i18n.translate('settings.density.compact') },
  ]);

  protected readonly languageOptions = computed<readonly RadioOption<AppLocale>[]>(() => {
    const locales = this.config?.availableLocales ?? (['ru', 'en', 'uz'] as const);
    return locales.map((locale) => ({
      value: locale,
      label: this.i18n.translate(`settings.language.${locale}`),
    }));
  });

  protected readonly themeMode = computed(() => this.theme.mode());
  protected readonly density = computed(() => this.shell.density());
  protected readonly language = computed(
    () => (this.i18n.getActiveLang() as AppLocale) || this.config?.defaultLocale || 'ru',
  );

  private readonly user = this.auth.user();

  protected readonly profileModel = signal<SettingsProfileModel>({
    firstName: this.user?.firstName ?? '',
    lastName: this.user?.lastName ?? '',
    email: this.user?.email ?? '',
  });

  protected readonly profileForm = form(this.profileModel, (path) => {
    required(path.firstName);
    required(path.lastName);
    disabled(path.email);
  });

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

  protected async saveProfile(event: Event): Promise<void> {
    event.preventDefault();
    const sessionUser = this.auth.user();
    const repo = this.usersRepo;
    if (!sessionUser || !repo) {
      return;
    }

    await submit(this.profileForm, async () => {
      this.saving.set(true);
      try {
        const value = this.profileModel();
        await new UpdateProfileUseCase(repo).execute(sessionUser.id, {
          firstName: value.firstName,
          lastName: value.lastName,
          avatarUrl: sessionUser.avatarUrl,
        });
        await this.auth.restore();
        this.toast.show({
          tone: 'success',
          title: this.i18n.translate('settings.profile.saved'),
        });
      } finally {
        this.saving.set(false);
      }
    });
  }
}
