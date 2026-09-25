import { Directive, inject, input, TemplateRef } from '@angular/core';
import { type CellContext, type RowContext } from './data-table.types';

/**
 * Custom cell renderer for a column.
 * ```html
 * <ng-template appCell="status" let-row let-value="value">
 *   <app-status [tone]="row.active ? 'success' : 'neutral'">{{ value }}</app-status>
 * </ng-template>
 * ```
 */
@Directive({ selector: 'ng-template[appCell]' })
export class AppCellDirective<T> {
  readonly column = input.required<string>({ alias: 'appCell' });
  readonly template = inject<TemplateRef<CellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: AppCellDirective<T>,
    _ctx: unknown,
  ): _ctx is CellContext<T> {
    return true;
  }
}

/** Row action cell (kebab menu, buttons). Rendered as the last, sticky column. */
@Directive({ selector: 'ng-template[appRowActions]' })
export class AppRowActionsDirective<T> {
  readonly template = inject<TemplateRef<RowContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: AppRowActionsDirective<T>,
    _ctx: unknown,
  ): _ctx is RowContext<T> {
    return true;
  }
}

/** Expandable row detail. Enables the expand toggle column. */
@Directive({ selector: 'ng-template[appRowExpansion]' })
export class AppRowExpansionDirective<T> {
  readonly template = inject<TemplateRef<RowContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: AppRowExpansionDirective<T>,
    _ctx: unknown,
  ): _ctx is RowContext<T> {
    return true;
  }
}
