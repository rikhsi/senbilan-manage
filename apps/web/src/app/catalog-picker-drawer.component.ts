import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  type ComponentRef,
  EnvironmentInjector,
  type Type,
  type WritableSignal,
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  createEnvironmentInjector,
  DestroyRef,
  inject,
  inputBinding,
  signal,
  twoWayBinding,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AppButtonComponent, AppDialogShellComponent } from '@senbilan/design-system/ui';
import { injectTranslocoReady } from '@senbilan/shared/i18n';
import {
  type CatalogPick,
  type CatalogPickKind,
  type CatalogPickOutcome,
} from '@senbilan/shared/ng';

export interface CatalogPickerDrawerData {
  readonly kind: CatalogPickKind;
  readonly pick: CatalogPick | null;
}

interface CatalogPickerPage {
  pickedId(): string | null;
  pickedLabel(): string;
}

@Component({
  selector: 'web-catalog-picker-drawer',
  imports: [TranslocoPipe, AppButtonComponent, AppDialogShellComponent],
  template: `
    <app-dialog-shell [title]="title()" [closeLabel]="'common.close' | transloco" [flush]="true">
      <ng-container #host />
      <ng-container footer>
        <button app-button type="button" variant="ghost" (click)="cancel()">
          {{ 'common.cancel' | transloco }}
        </button>
        <button app-button type="button" variant="primary" [disabled]="!ready()" (click)="apply()">
          {{ 'common.apply' | transloco }}
        </button>
      </ng-container>
    </app-dialog-shell>
  `,
  styles: `
    :host {
      display: flex;
      flex-flow: column nowrap;
      height: 100%;
      min-height: 0;
    }

    users-page,
    couples-page {
      display: block;
      min-height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPickerDrawerComponent {
  private readonly ref = inject<DialogRef<CatalogPickOutcome>>(DialogRef);
  private readonly environment = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();
  private readonly host = viewChild.required('host', { read: ViewContainerRef });
  protected readonly data = inject<CatalogPickerDrawerData>(DIALOG_DATA);

  protected readonly pickedId = signal<string | null>(this.data.pick?.id ?? null);
  protected readonly pickedLabel = signal(this.data.pick?.label ?? '');
  protected readonly ready = signal(false);
  protected readonly title = computed(() => {
    this.i18nReady();
    return this.i18n.translate(this.data.kind === 'user' ? 'media.owner' : 'media.couple');
  });

  private pageInjector: EnvironmentInjector | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.pageInjector?.destroy());
    afterNextRender(() => {
      void this.mountPage();
    });
  }

  protected cancel(): void {
    this.ref.close({ applied: false, pick: null });
  }

  protected apply(): void {
    const id = this.pickedId();
    this.ref.close({
      applied: true,
      pick: id ? { id, label: this.pickedLabel() || id } : null,
    });
  }

  private async mountPage(): Promise<void> {
    const kind = this.data.kind;
    const loaded =
      kind === 'user'
        ? await import('@senbilan/features/users')
        : await import('@senbilan/features/couples');
    if (this.pageInjector) {
      return;
    }
    const component = (
      kind === 'user'
        ? (loaded as typeof import('@senbilan/features/users')).UsersPageComponent
        : (loaded as typeof import('@senbilan/features/couples')).CouplesPageComponent
    ) as Type<CatalogPickerPage>;
    const providers =
      kind === 'user'
        ? (loaded as typeof import('@senbilan/features/users')).provideUsersI18n()
        : (loaded as typeof import('@senbilan/features/couples')).provideCouplesI18n();
    const pageInjector = createEnvironmentInjector(providers, this.environment);
    this.pageInjector = pageInjector;
    const pageRef: ComponentRef<CatalogPickerPage> = this.host().createComponent(component, {
      environmentInjector: pageInjector,
      bindings: [
        inputBinding('picking', () => true),
        twoWayBinding('pickedId', this.pickedId as WritableSignal<unknown>),
        twoWayBinding('pickedLabel', this.pickedLabel as WritableSignal<unknown>),
      ],
    });
    pageRef.changeDetectorRef.detectChanges();
    this.ready.set(true);
  }
}
