import { Dialog, DIALOG_DATA, DialogRef, type DialogConfig } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { type ComponentType } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injectable,
  type TemplateRef,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppButtonComponent } from '../button/app-button.component';
import { AppModalService } from '../overlay/app-modal.service';

/**
 * Mobile bottom sheet. On desktop falls back to a centred modal via AppModalService.
 * Prefer opening feature content with `AppSheetService.open(Component)`.
 */
@Injectable({ providedIn: 'root' })
export class AppSheetService {
  private readonly modal = inject(AppModalService);
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C> | TemplateRef<C>,
    options: { readonly data?: D; readonly ariaLabel?: string } = {},
  ): DialogRef<R, C> {
    const isMobile = typeof matchMedia === 'function' && matchMedia('(max-width: 767px)').matches;
    if (!isMobile) {
      return this.modal.open<R, D, C>(component, {
        ...(options.data !== undefined ? { data: options.data } : {}),
        ...(options.ariaLabel !== undefined ? { ariaLabel: options.ariaLabel } : {}),
        size: 'md',
      });
    }

    const position = this.overlay.position().global().centerHorizontally().bottom('0');
    const config: DialogConfig<D, DialogRef<R, C>> = {
      hasBackdrop: true,
      disableClose: false,
      closeOnNavigation: true,
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      role: 'dialog',
      width: '100vw',
      maxWidth: '100vw',
      height: 'auto',
      maxHeight: '92dvh',
      positionStrategy: position,
      panelClass: ['app-overlay-panel', 'app-sheet-panel'],
      backdropClass: 'app-overlay-backdrop',
    };
    if (options.data !== undefined) {
      config.data = options.data;
    }
    if (options.ariaLabel !== undefined) {
      config.ariaLabel = options.ariaLabel;
    }
    return this.dialog.open<R, D, C>(component, config);
  }
}

export interface ActionSheetItem {
  readonly id: string;
  readonly label: string;
  readonly role?: 'default' | 'destructive';
}

export interface ActionSheetData {
  readonly title: string;
  readonly cancelLabel: string;
  readonly items: readonly ActionSheetItem[];
}

@Component({
  selector: 'app-action-sheet',
  imports: [AppButtonComponent],
  template: `
    <div class="app-action-sheet">
      <p class="app-action-sheet__title">{{ data.title }}</p>
      <ul class="app-action-sheet__list">
        @for (item of data.items; track item.id) {
          <li>
            <button
              app-button
              type="button"
              [variant]="item.role === 'destructive' ? 'danger' : 'secondary'"
              (click)="ref.close(item.id)"
            >
              {{ item.label }}
            </button>
          </li>
        }
      </ul>
      <button app-button variant="ghost" type="button" (click)="ref.close(null)">
        {{ data.cancelLabel }}
      </button>
    </div>
  `,
  styles: `
    .app-action-sheet {
      display: flex;
      flex-direction: column;
      gap: var(--app-space-2);
      padding: var(--app-space-4);
    }
    .app-action-sheet__title {
      margin: 0;
      color: var(--app-color-text-secondary);
      text-align: center;
    }
    .app-action-sheet__list {
      display: flex;
      flex-direction: column;
      gap: var(--app-space-2);
      padding: 0;
      margin: 0;
      list-style: none;
    }
    .app-action-sheet button {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppActionSheetComponent {
  protected readonly data = inject<ActionSheetData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<string | null>>(DialogRef);
}

@Injectable({ providedIn: 'root' })
export class AppActionSheetService {
  private readonly sheet = inject(AppSheetService);

  async present(data: ActionSheetData): Promise<string | null> {
    const ref = this.sheet.open<string | null, ActionSheetData>(AppActionSheetComponent, {
      data,
      ariaLabel: data.title,
    });
    const result = await firstValueFrom(ref.closed);
    return result ?? null;
  }
}
