import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideDesignSystem } from '@senbilan/design-system/ui';
import { provideAppConfig } from '@senbilan/shared/config';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideAppConfig(environment),
    provideDesignSystem(),
  ],
};
