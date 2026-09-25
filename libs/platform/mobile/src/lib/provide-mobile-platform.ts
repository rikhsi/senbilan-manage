import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { HapticsAdapter, StatusBarAdapter } from '@senbilan/platform/core';
import { CapacitorHapticsAdapter, CapacitorStatusBarAdapter } from './capacitor-adapters';

export const provideMobilePlatform = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    CapacitorHapticsAdapter,
    CapacitorStatusBarAdapter,
    { provide: HapticsAdapter, useExisting: CapacitorHapticsAdapter },
    { provide: StatusBarAdapter, useExisting: CapacitorStatusBarAdapter },
  ]);
