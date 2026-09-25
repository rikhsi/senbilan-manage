import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AppIconButtonComponent } from '../button/app-icon-button.component';

/**
 * Layout for dialog/drawer content: sticky header with title + close, scrollable
 * body, sticky footer for actions. Use inside any component opened through AppModalService.
 *
 * ```html
 * <app-dialog-shell [title]="t('users.edit')" [closeLabel]="t('common.close')">
 *   …form…
 *   <ng-container footer>
 *     <button app-button variant="ghost" (click)="ref.close()">{{ t('common.cancel') }}</button>
 *     <button app-button variant="primary" (click)="save()">{{ t('common.save') }}</button>
 *   </ng-container>
 * </app-dialog-shell>
 * ```
 */
@Component({
  selector: 'app-dialog-shell',
  imports: [AppIconButtonComponent],
  template: `
    <header class="app-dialog-shell__header">
      <div class="app-dialog-shell__heading">
        <h2 class="app-dialog-shell__title" [id]="titleId">{{ title() }}</h2>
        @if (subtitle()) {
          <p class="app-dialog-shell__subtitle">{{ subtitle() }}</p>
        }
      </div>
      @if (closable()) {
        <button
          app-icon-button
          icon="x"
          size="sm"
          [label]="closeLabel()"
          type="button"
          (click)="close()"
        ></button>
      }
    </header>
    <div class="app-dialog-shell__body" [class.app-dialog-shell__body--flush]="flush()">
      <ng-content />
    </div>
    <footer class="app-dialog-shell__footer">
      <ng-content select="[footer]" />
    </footer>
  `,
  styleUrl: './app-dialog-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-dialog-shell', '[attr.aria-labelledby]': 'titleId' },
})
export class AppDialogShellComponent {
  private static counter = 0;
  private readonly ref = inject(DialogRef, { optional: true });

  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly closeLabel = input('');
  readonly closable = input(true);
  /** Remove body padding (tables, lists). */
  readonly flush = input(false);

  protected readonly titleId = `app-dialog-title-${AppDialogShellComponent.counter++}`;

  protected close(): void {
    this.ref?.close();
  }
}
