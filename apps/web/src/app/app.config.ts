import {
  type ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideDesignSystem } from '@senbilan/design-system/ui';
import { provideApi } from '@senbilan/infra/api';
import { provideMockApi } from '@senbilan/infra/mock';
import { provideObservability } from '@senbilan/infra/observability';
import { provideStorage } from '@senbilan/infra/storage';
import { providePlatform } from '@senbilan/platform/core';
import { provideDesktopPlatform } from '@senbilan/platform/desktop';
import { provideAuth } from '@senbilan/shared/auth';
import { provideAppConfig } from '@senbilan/shared/config';
import { provideI18n } from '@senbilan/shared/i18n';
import { provideQueryClient } from '@senbilan/shared/query';
import { provideTheme } from '@senbilan/shared/theme';
import { provideVendors } from '@senbilan/vendors/ui';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';
import { provideLayoutShell } from './provide-layout-shell';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimations(),
    provideRouter(appRoutes, withComponentInputBinding(), withViewTransitions()),
    provideAppConfig(environment),
    provideDesignSystem(),
    provideVendors(),
    provideI18n({
      defaultLocale: environment.defaultLocale,
      availableLocales: environment.availableLocales,
      prodMode: environment.production,
    }),
    provideTheme(),
    provideObservability(),
    provideStorage(),
    providePlatform(),
    provideDesktopPlatform(),
    provideApi(),
    provideMockApi(),
    provideAuth(),
    provideLayoutShell(),
    provideQueryClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode() && environment.features.pwa,
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
