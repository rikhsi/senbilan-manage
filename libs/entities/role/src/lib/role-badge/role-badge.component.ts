import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type Role } from '@senbilan/core/domain';
import { AppBadgeComponent, type Tone } from '@senbilan/design-system/ui';

@Component({
  selector: 'entity-role-badge',
  imports: [AppBadgeComponent],
  template: `
    <app-badge [tone]="tone()" [icon]="role().isSystem ? 'shield-check' : 'shield'" [pill]="true">
      {{ role().name }}
    </app-badge>
  `,
  styleUrl: './role-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'entity-role-badge' },
})
export class RoleBadgeComponent {
  readonly role = input.required<Pick<Role, 'name' | 'isSystem'>>();
  readonly toneOverride = input<Tone | null>(null);

  protected readonly tone = computed<Tone>(
    () => this.toneOverride() ?? (this.role().isSystem ? 'primary' : 'neutral'),
  );
}
