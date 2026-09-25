import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { type PermissionDescriptor, PermissionRepository } from '@senbilan/core/application';
import { ALL_PERMISSIONS } from '@senbilan/core/domain';
import { AppCardComponent, AppTagComponent } from '@senbilan/design-system/ui';

@Component({
  selector: 'permissions-page',
  imports: [TranslocoPipe, AppCardComponent, AppTagComponent],
  templateUrl: './permissions-page.component.html',
  styleUrl: './permissions-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsPageComponent {
  private readonly repo = inject(PermissionRepository, { optional: true });

  protected readonly items = signal<readonly PermissionDescriptor[]>([]);
  protected readonly loading = signal(false);

  constructor() {
    void this.reload();
  }

  private async reload(): Promise<void> {
    this.loading.set(true);
    try {
      if (!this.repo) {
        this.items.set(ALL_PERMISSIONS.map((p) => ({ ...p, description: p.key })));
        return;
      }
      this.items.set(await this.repo.findAll());
    } finally {
      this.loading.set(false);
    }
  }
}
