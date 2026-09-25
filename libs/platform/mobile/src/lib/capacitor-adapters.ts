import { Injectable } from '@angular/core';
import { HapticsAdapter, StatusBarAdapter } from '@senbilan/platform/core';

/**
 * Capacitor Haptics adapter stub. Safe to call on web — becomes a no-op when
 * the native plugin is unavailable.
 */
@Injectable()
export class CapacitorHapticsAdapter extends HapticsAdapter {
  override async impact(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      const map = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      } as const;
      await Haptics.impact({ style: map[style] });
    } catch {
      /* plugin unavailable */
    }
  }

  override async notification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      const map = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      } as const;
      await Haptics.notification({ type: map[type] });
    } catch {
      /* plugin unavailable */
    }
  }
}

/** Capacitor StatusBar adapter stub. */
@Injectable()
export class CapacitorStatusBarAdapter extends StatusBarAdapter {
  override async setStyle(style: 'light' | 'dark' | 'default'): Promise<void> {
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      const map = {
        light: Style.Light,
        dark: Style.Dark,
        default: Style.Default,
      } as const;
      await StatusBar.setStyle({ style: map[style] });
    } catch {
      /* plugin unavailable */
    }
  }

  override async show(): Promise<void> {
    try {
      const { StatusBar } = await import('@capacitor/status-bar');
      await StatusBar.show();
    } catch {
      /* plugin unavailable */
    }
  }

  override async hide(): Promise<void> {
    try {
      const { StatusBar } = await import('@capacitor/status-bar');
      await StatusBar.hide();
    } catch {
      /* plugin unavailable */
    }
  }
}
