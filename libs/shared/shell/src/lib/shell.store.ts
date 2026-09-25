import { computed, effect, inject, untracked } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { type Density } from '@senbilan/design-system/tokens';
import { withPersistence } from '@senbilan/shared/ng';
import { ThemeService } from '@senbilan/shared/theme';

export const SHELL_STORAGE_KEY = 'senbilan.shell';

/** Shell density options exposed in Settings (comfortable | compact). */
export type ShellDensity = Extract<Density, 'comfortable' | 'compact'>;

interface ShellState {
  sidebarCollapsed: boolean;
  density: ShellDensity;
  commandPaletteOpen: boolean;
  mobileNavOpen: boolean;
}

const initialState: ShellState = {
  sidebarCollapsed: false,
  density: 'comfortable',
  commandPaletteOpen: false,
  mobileNavOpen: false,
};

const toShellDensity = (value: Density | ShellDensity | string): ShellDensity =>
  value === 'compact' ? 'compact' : 'comfortable';

export const ShellStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withPersistence(SHELL_STORAGE_KEY, (state) => ({
    sidebarCollapsed: state.sidebarCollapsed,
    density: toShellDensity(state.density),
  })),
  withComputed((store) => ({
    isSidebarCollapsed: computed(() => store.sidebarCollapsed()),
    isCommandPaletteOpen: computed(() => store.commandPaletteOpen()),
    isMobileNavOpen: computed(() => store.mobileNavOpen()),
  })),
  withMethods((store) => {
    const theme = inject(ThemeService, { optional: true });

    return {
      setSidebarCollapsed(collapsed: boolean): void {
        patchState(store, { sidebarCollapsed: collapsed });
      },

      toggleSidebar(): void {
        patchState(store, { sidebarCollapsed: !store.sidebarCollapsed() });
      },

      setMobileNavOpen(open: boolean): void {
        patchState(store, { mobileNavOpen: open });
      },

      toggleMobileNav(): void {
        patchState(store, { mobileNavOpen: !store.mobileNavOpen() });
      },

      setDensity(density: Density | ShellDensity): void {
        const next = toShellDensity(density);
        patchState(store, { density: next });
        theme?.setDensity(next);
      },

      openCommandPalette(): void {
        patchState(store, { commandPaletteOpen: true });
      },

      closeCommandPalette(): void {
        patchState(store, { commandPaletteOpen: false });
      },

      toggleCommandPalette(): void {
        patchState(store, { commandPaletteOpen: !store.commandPaletteOpen() });
      },

      setCommandPaletteOpen(open: boolean): void {
        patchState(store, { commandPaletteOpen: open });
      },
    };
  }),
  withHooks({
    onInit(store) {
      const theme = inject(ThemeService, { optional: true });
      const density = toShellDensity(store.density());
      if (density !== store.density()) {
        patchState(store, { density });
      }
      effect(() => {
        const next = store.density();
        untracked(() => theme?.setDensity(next));
      });
    },
  }),
);

export type ShellStore = InstanceType<typeof ShellStore>;
