import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideDesignSystem } from '@senbilan/design-system/ui';
import { provideApi } from '@senbilan/infra/api';
import { provideMockApi } from '@senbilan/infra/mock';
import { provideObservability } from '@senbilan/infra/observability';
import { provideStorage } from '@senbilan/infra/storage';
import { providePlatform } from '@senbilan/platform/core';
import { provideAuth } from '@senbilan/shared/auth';
import { provideAppConfig } from '@senbilan/shared/config';
import { provideI18n } from '@senbilan/shared/i18n';
import { provideQueryClient } from '@senbilan/shared/query';
import { provideTheme } from '@senbilan/shared/theme';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimations(),
    provideRouter(appRoutes, withComponentInputBinding(), withViewTransitions()),
    provideAppConfig(environment),
    provideDesignSystem(),
    provideI18n({
      defaultLocale: environment.defaultLocale,
      availableLocales: environment.availableLocales,
      prodMode: environment.production,
    }),
    provideTheme(),
    provideObservability(),
    provideStorage(),
    providePlatform(),
    provideApi(),
    provideMockApi(),
    provideAuth(),
    provideQueryClient(),
  ],
};
