import {
  type ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { APP_THEME_MODE, provideDesignSystem } from '@senbilan/design-system/ui';
import { provideApi } from '@senbilan/infra/api';
import { provideMockApi } from '@senbilan/infra/mock';
import { provideObservability } from '@senbilan/infra/observability';
import { provideStorage } from '@senbilan/infra/storage';
import { provideMobilePlatform } from '@senbilan/platform/mobile';
import { provideAuth } from '@senbilan/shared/auth';
import { provideAppConfig } from '@senbilan/shared/config';
import { provideI18n } from '@senbilan/shared/i18n';
import { provideQueryClient } from '@senbilan/shared/query';
import { provideTheme, ThemeService, type ThemeMode } from '@senbilan/shared/theme';
import { provideVendors } from '@senbilan/vendors/ui';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimations(),
    provideIonicAngular({ mode: 'ios' }),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAppConfig(environment),
    provideDesignSystem(),
    provideVendors(),
    provideI18n({
      defaultLocale: environment.defaultLocale,
      availableLocales: environment.availableLocales,
      prodMode: environment.production,
      scopes: ['auth'],
    }),
    provideTheme(),
    {
      provide: APP_THEME_MODE,
      useFactory: () => {
        const theme = inject(ThemeService);
        return {
          mode: () => theme.mode(),
          setMode: (mode: ThemeMode) => theme.setMode(mode),
          cycleMode: () => theme.cycleMode(),
        };
      },
    },
    provideObservability(),
    provideStorage(),
    provideMobilePlatform(),
    provideApi(),
    provideMockApi(),
    provideAuth(),
    provideQueryClient(),
  ],
};
