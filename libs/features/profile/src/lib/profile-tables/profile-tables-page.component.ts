import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  AppButtonComponent,
  AppColumnSettingsComponent,
  AppConfirmDialogService,
  type ColumnSetting,
} from '@senbilan/design-system/ui';
import { injectTranslocoReady, readLoadedTranslation } from '@senbilan/shared/i18n';
import { TableLayoutCatalog } from '@senbilan/shared/ng';
import { type TableLayoutDefinition } from '@senbilan/shared/util';
import { skip } from 'rxjs';

@Component({
  selector: 'profile-tables-page',
  imports: [TranslocoPipe, AppButtonComponent, AppColumnSettingsComponent],
  templateUrl: './profile-tables-page.component.html',
  styleUrl: './profile-tables-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileTablesPageComponent {
  private readonly catalog = inject(TableLayoutCatalog);
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();
  private readonly confirm = inject(AppConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ready = signal(false);
  protected readonly tables = signal<readonly TableLayoutDefinition[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly hidden = signal<readonly string[]>([]);
  protected readonly order = signal<readonly string[]>([]);

  protected readonly selected = computed(
    () => this.tables().find((table) => table.id === this.selectedId()) ?? null,
  );

  protected readonly columnSettings = computed<readonly ColumnSetting[]>(() => {
    this.i18nReady();
    const table = this.selected();
    if (!table) {
      return [];
    }
    return table.columns.map((column) => ({
      key: column.key,
      header: readLoadedTranslation(this.i18n, column.labelKey),
      hideable: column.hideable,
    }));
  });

  constructor() {
    void this.catalog
      .load()
      .then((tables) => {
        this.tables.set(tables);
        const first = tables[0];
        if (first) {
          this.select(first.id);
        }
        this.ready.set(true);
      })
      .catch(() => this.ready.set(true));
    this.i18n.langChanges$.pipe(skip(1), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      void this.catalog.refreshTranslations();
    });
  }

  protected select(id: string): void {
    const table = this.tables().find((item) => item.id === id);
    if (!table) {
      return;
    }
    const snapshot = table.read();
    this.selectedId.set(id);
    this.hidden.set(snapshot.hidden);
    this.order.set(snapshot.order);
  }

  protected onHiddenChange(hidden: readonly string[]): void {
    this.hidden.set(hidden);
    this.persist({ hidden, order: this.order() });
  }

  protected onOrderChange(order: readonly string[]): void {
    this.order.set(order);
    this.persist({ hidden: this.hidden(), order });
  }

  protected showAll(): void {
    this.onHiddenChange([]);
  }

  protected resetSelected(): void {
    const table = this.selected();
    if (!table) {
      return;
    }
    this.hidden.set(table.defaultHidden);
    this.order.set([]);
    this.persist({ hidden: table.defaultHidden, order: [] });
  }

  protected async resetAll(): Promise<void> {
    const ok = await this.confirm.ask({
      title: this.i18n.translate('profile.tables.resetAllTitle'),
      message: this.i18n.translate('profile.tables.resetAllMessage'),
      confirmLabel: this.i18n.translate('profile.tables.resetAll'),
      cancelLabel: this.i18n.translate('common.cancel'),
      tone: 'danger',
      icon: 'columns',
    });
    if (!ok) {
      return;
    }
    for (const table of this.tables()) {
      table.write({ hidden: table.defaultHidden, order: [] });
    }
    const current = this.selected();
    if (current) {
      this.select(current.id);
    }
  }

  private persist(snapshot: { hidden: readonly string[]; order: readonly string[] }): void {
    this.selected()?.write(snapshot);
  }
}
