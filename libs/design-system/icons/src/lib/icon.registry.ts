import { inject, Injectable, InjectionToken, type Provider } from '@angular/core';
import { APP_ICONS } from './app-icons';
import { type IconDefinition, type IconMap, iconToSvg, svgToDataUri } from './icon.types';

/** Multi-token: libraries/apps contribute icon maps; the registry merges them. */
export const ICON_SETS = new InjectionToken<readonly IconMap[]>('ICON_SETS');

@Injectable({ providedIn: 'root' })
export class IconRegistry {
  private readonly icons = new Map<string, IconDefinition>();
  private readonly svgCache = new Map<string, string>();

  constructor() {
    const sets = inject(ICON_SETS, { optional: true }) ?? [APP_ICONS];
    for (const set of sets) {
      this.register(set);
    }
  }

  register(set: IconMap): void {
    for (const [name, definition] of Object.entries(set)) {
      this.icons.set(name, definition);
      this.svgCache.delete(name);
    }
  }

  has(name: string): boolean {
    return this.icons.has(name);
  }

  get(name: string): IconDefinition | undefined {
    return this.icons.get(name);
  }

  names(): readonly string[] {
    return [...this.icons.keys()];
  }

  toSvg(name: string): string | undefined {
    const cached = this.svgCache.get(name);
    if (cached) {
      return cached;
    }
    const definition = this.icons.get(name);
    if (!definition) {
      return undefined;
    }
    const svg = iconToSvg(definition);
    this.svgCache.set(name, svg);
    return svg;
  }

  toDataUri(name: string): string | undefined {
    const svg = this.toSvg(name);
    return svg ? svgToDataUri(svg) : undefined;
  }
}

/** Registers the design-system icon set plus optional extra sets (vendor-free). */
export const provideIcons = (...extraSets: readonly IconMap[]): Provider[] => [
  { provide: ICON_SETS, useValue: [APP_ICONS, ...extraSets] },
];
