import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { type AppIconName, AppIconComponent } from '@senbilan/design-system/icons';
import { AppButtonComponent } from '../button/app-button.component';
import { AppModalService } from './app-modal.service';

export interface ConfirmDialogOptions {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly closeLabel?: string;
  readonly tone?: 'primary' | 'danger';
  readonly icon?: AppIconName;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [AppButtonComponent, AppIconComponent],
  template: `
    <div class="app-confirm">
      <div class="app-confirm__icon" [attr.data-tone]="data.tone ?? 'primary'">
        <app-icon
          [name]="data.icon ?? (data.tone === 'danger' ? 'alert-triangle' : 'info')"
          size="lg"
        />
      </div>
      <h2 class="app-confirm__title" id="app-confirm-title">{{ data.title }}</h2>
      <p class="app-confirm__message" id="app-confirm-message">{{ data.message }}</p>
      <div class="app-confirm__actions">
        <button app-button variant="secondary" type="button" (click)="ref.close(false)">
          {{ data.cancelLabel }}
        </button>
        <button
          app-button
          [variant]="data.tone === 'danger' ? 'danger' : 'primary'"
          type="button"
          cdkFocusInitial
          (click)="ref.close(true)"
        >
          {{ data.confirmLabel }}
        </button>
      </div>
    </div>
  `,
  styleUrl: './app-confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogOptions>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
}

/** `await confirm.ask({...})` → true when confirmed. */
@Injectable({ providedIn: 'root' })
export class AppConfirmDialogService {
  private readonly modal = inject(AppModalService);

  async ask(options: ConfirmDialogOptions): Promise<boolean> {
    const ref = this.modal.open<boolean, ConfirmDialogOptions>(AppConfirmDialogComponent, {
      data: options,
      size: 'sm',
      ariaLabel: options.title,
      dismissible: options.tone !== 'danger',
    });
    const result = await firstValueFrom(ref.closed);
    return result === true;
  }
}
