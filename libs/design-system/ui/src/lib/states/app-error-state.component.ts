import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppButtonComponent } from '../button/app-button.component';
import { AppEmptyStateComponent } from './app-empty-state.component';

/** Error placeholder with optional retry. All texts come from the caller (i18n). */
@Component({
  selector: 'app-error-state',
  imports: [AppEmptyStateComponent, AppButtonComponent],
  template: `
    <app-empty-state
      icon="circle-alert"
      tone="danger"
      [title]="title()"
      [description]="description()"
      [size]="size()"
    >
      @if (retryLabel()) {
        <button app-button variant="secondary" icon="refresh" type="button" (click)="retry.emit()">
          {{ retryLabel() }}
        </button>
      }
    </app-empty-state>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-error-state' },
})
export class AppErrorStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly retryLabel = input<string>('');
  readonly size = input<'sm' | 'md'>('md');
  readonly retry = output<void>();
}
