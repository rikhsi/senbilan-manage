import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { fullName, type User } from '@senbilan/core/domain';
import { AppAvatarComponent, type AvatarRing, type AvatarSize } from '@senbilan/design-system/ui';

@Component({
  selector: 'entity-user-avatar',
  imports: [AppAvatarComponent],
  template: `
    <app-avatar [name]="displayName()" [src]="avatarSrc()" [size]="size()" [ring]="ring()" />
  `,
  styleUrl: './user-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'entity-user-avatar' },
})
export class UserAvatarComponent {
  /** Pass a User aggregate, or supply name/src manually. */
  readonly user = input<Pick<User, 'firstName' | 'lastName' | 'avatarUrl'> | null>(null);
  readonly name = input('');
  readonly src = input<string | null>(null);
  readonly size = input<AvatarSize>('md');
  readonly ring = input<AvatarRing>('none');

  protected readonly displayName = computed(() => {
    const u = this.user();
    if (u) {
      return fullName(u);
    }
    return this.name();
  });

  protected readonly avatarSrc = computed(() => this.user()?.avatarUrl ?? this.src());
}
