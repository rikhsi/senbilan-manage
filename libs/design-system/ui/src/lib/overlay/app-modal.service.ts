import { Dialog, type DialogConfig, type DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { type ComponentType } from '@angular/cdk/portal';
import { inject, Injectable, type TemplateRef } from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalOptions<D> {
  readonly data?: D;
  readonly size?: ModalSize;
  /** Close on backdrop click / Escape (default true). Set false for destructive flows. */
  readonly dismissible?: boolean;
  readonly ariaLabel?: string;
}

export interface DrawerOptions<D> extends Omit<ModalOptions<D>, 'size'> {
  readonly side?: 'right' | 'left';
  readonly width?: 'sm' | 'md' | 'lg';
}

const MODAL_WIDTHS: Readonly<Record<ModalSize, string>> = {
  sm: 'min(28rem, calc(100vw - 2rem))',
  md: 'min(36rem, calc(100vw - 2rem))',
  lg: 'min(48rem, calc(100vw - 2rem))',
  xl: 'min(64rem, calc(100vw - 2rem))',
  full: 'calc(100vw - 2rem)',
};

const DRAWER_WIDTHS: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: 'min(24rem, 100vw)',
  md: 'min(32rem, 100vw)',
  lg: 'min(44rem, 100vw)',
};

type Config<R, D, C> = DialogConfig<D, DialogRef<R, C>>;

/**
 * Opens components in a CDK Dialog (focus trap, aria, Escape, restore focus)
 * styled as a centred modal or a side drawer. Content components read data via
 * `inject(DIALOG_DATA)` and close via `inject(DialogRef)`.
 */
@Injectable({ providedIn: 'root' })
export class AppModalService {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C> | TemplateRef<C>,
    options: ModalOptions<D> = {},
  ): DialogRef<R, C> {
    const size = options.size ?? 'md';
    const config: Config<R, D, C> = {
      ...this.base<R, D, C>(options),
      width: MODAL_WIDTHS[size],
      maxHeight: 'calc(100dvh - 2rem)',
      panelClass: ['app-overlay-panel', 'app-modal-panel', `app-modal-panel--${size}`],
      backdropClass: 'app-overlay-backdrop',
    };
    return this.dialog.open<R, D, C>(component, config);
  }

  openDrawer<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C> | TemplateRef<C>,
    options: DrawerOptions<D> = {},
  ): DialogRef<R, C> {
    const side = options.side ?? 'right';
    const position = this.overlay.position().global().top('0');
    const config: Config<R, D, C> = {
      ...this.base<R, D, C>(options),
      width: DRAWER_WIDTHS[options.width ?? 'md'],
      height: '100dvh',
      positionStrategy: side === 'right' ? position.right('0') : position.left('0'),
      panelClass: ['app-overlay-panel', 'app-drawer-panel', `app-drawer-panel--${side}`],
      backdropClass: 'app-overlay-backdrop',
    };
    return this.dialog.open<R, D, C>(component, config);
  }

  closeAll(): void {
    this.dialog.closeAll();
  }

  private base<R, D, C>(options: ModalOptions<D> | DrawerOptions<D>): Config<R, D, C> {
    const dismissible = options.dismissible ?? true;
    const config: Config<R, D, C> = {
      hasBackdrop: true,
      disableClose: !dismissible,
      closeOnNavigation: true,
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      role: 'dialog',
    };
    if (options.data !== undefined) {
      config.data = options.data;
    }
    if (options.ariaLabel !== undefined) {
      config.ariaLabel = options.ariaLabel;
    }
    return config;
  }
}
