import {
  ENVIRONMENT_INITIALIZER,
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { ThemeService } from './theme.service';

/**
 * Ensures `ThemeService` is constructed at bootstrap so DOM attributes and
 * persistence run before the first routed view.
 */
export const provideTheme = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: (): void => {
        inject(ThemeService);
      },
    },
  ]);
