import { type Provider } from '@angular/core';
import { tuiIconsProvider } from '@taiga-ui/core';
import { APP_ICONS, iconToSvg } from '@senbilan/design-system/icons';
import { TAIGA_ICON_ALIASES } from './taiga-icon-aliases';

/** Bridges Taiga's internal `@tui.*` icon names to our Lucide set. */
export const provideVendorIcons = (): Provider[] => {
  const taigaIcons = Object.fromEntries(
    Object.entries(TAIGA_ICON_ALIASES).map(([taigaName, appName]) => [
      taigaName,
      iconToSvg(APP_ICONS[appName]),
    ]),
  );
  return [tuiIconsProvider(taigaIcons)];
};
