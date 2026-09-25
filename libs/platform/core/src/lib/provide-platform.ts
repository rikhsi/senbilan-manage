import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { BrowserPlatformService, NoopDesktopService } from './browser-platform.service';
import { DesktopService, PlatformService } from './platform.ports';

export const providePlatform = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    BrowserPlatformService,
    NoopDesktopService,
    { provide: PlatformService, useExisting: BrowserPlatformService },
    { provide: DesktopService, useExisting: NoopDesktopService },
  ]);
