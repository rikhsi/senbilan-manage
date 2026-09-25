export {
  PlatformService,
  DesktopService,
  HapticsAdapter,
  StatusBarAdapter,
  type PlatformKind,
} from './lib/platform.ports';
export { BrowserPlatformService, NoopDesktopService } from './lib/browser-platform.service';
export { providePlatform } from './lib/provide-platform';
