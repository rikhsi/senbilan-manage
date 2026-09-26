import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { type PermissionKey } from '@senbilan/core/domain';
import { AppCheckboxComponent } from '@senbilan/design-system/ui';
import { type PermissionMatrixGroup } from './permission-matrix.model';

export type { PermissionMatrixGroup } from './permission-matrix.model';

@Component({
  selector: 'entity-permission-matrix',
  imports: [AppCheckboxComponent],
  templateUrl: './permission-matrix.component.html',
  styleUrl: './permission-matrix.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'entity-permission-matrix' },
})
export class PermissionMatrixComponent {
  readonly groups = input.required<readonly PermissionMatrixGroup[]>();
  readonly selected = model<readonly PermissionKey[]>([]);
  readonly readonly = input(false);

  protected readonly selectedSet = computed(() => new Set(this.selected()));

  protected isChecked(key: PermissionKey): boolean {
    return this.selectedSet().has(key);
  }

  protected toggle(key: PermissionKey, checked: boolean): void {
    if (this.readonly()) {
      return;
    }
    const next = new Set(this.selected());
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
    }
    this.selected.set([...next] as PermissionKey[]);
  }
}
