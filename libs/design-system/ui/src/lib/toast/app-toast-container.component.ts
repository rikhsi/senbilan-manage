import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { type AppIconName, AppIconComponent } from '@senbilan/design-system/icons';
import { type Toast, ToastService } from './toast.service';
import { TOAST_TONE_ICONS } from './toast-icons';

/** Place once in the app shell. Announces toasts via a polite live region. */
@Component({
  selector: 'app-toast-container',
  imports: [AppIconComponent],
  template: `
    <div class="app-toasts" role="region" [attr.aria-label]="regionLabel()" aria-live="polite">
      @for (toast of toasts.toasts(); track toast.id) {
        <div class="app-toast" [attr.data-tone]="toast.tone" role="status">
          <app-icon class="app-toast__icon" [name]="iconFor(toast)" size="md" />
          <div class="app-toast__content">
            <p class="app-toast__title">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="app-toast__message">{{ toast.message }}</p>
            }
            @if (toast.action) {
              <button type="button" class="app-toast__action" (click)="run(toast)">
                {{ toast.action.label }}
              </button>
            }
          </div>
          <button
            type="button"
            class="app-toast__close"
            [attr.aria-label]="closeLabel()"
            (click)="toasts.dismiss(toast.id)"
          >
            <app-icon name="x" size="xs" />
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './app-toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppToastContainerComponent {
  protected readonly toasts = inject(ToastService);
  readonly closeLabel = input('');
  readonly regionLabel = input('');

  protected iconFor(toast: Toast): AppIconName {
    return TOAST_TONE_ICONS[toast.tone];
  }

  protected run(toast: Toast): void {
    toast.action?.run();
    this.toasts.dismiss(toast.id);
  }
}
