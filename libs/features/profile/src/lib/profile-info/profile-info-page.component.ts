import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { RoleRepository } from '@senbilan/core/application';
import { type RoleId } from '@senbilan/core/domain';
import { UserAvatarComponent } from '@senbilan/entities/user';
import { AuthStore } from '@senbilan/shared/auth';
import { type ProfileInfoView } from '../profile-shell/profile.model';

@Component({
  selector: 'profile-info-page',
  imports: [TranslocoPipe, UserAvatarComponent],
  templateUrl: './profile-info-page.component.html',
  styleUrl: './profile-info-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInfoPageComponent {
  private readonly auth = inject(AuthStore);
  private readonly i18n = inject(TranslocoService);
  private readonly rolesRepo = inject(RoleRepository, { optional: true });

  private readonly roleLabel = signal(this.i18n.translate('profile.info.roleEmpty'));

  protected readonly info = computed<ProfileInfoView>(() => {
    const user = this.auth.user();
    const firstName = user?.firstName ?? '';
    const lastName = user?.lastName ?? '';
    const displayName = `${firstName} ${lastName}`.trim() || (user?.email ?? '');
    return {
      firstName,
      // Reserved for upcoming domain field — keep the slot in the layout.
      middleName: '',
      lastName,
      roleLabel: this.roleLabel(),
      avatarUrl: user?.avatarUrl ?? null,
      displayName,
    };
  });

  constructor() {
    effect(() => {
      const ids = this.auth.user()?.roleIds ?? [];
      void this.resolveRoleLabel(ids).then((label) => this.roleLabel.set(label));
    });
  }

  private async resolveRoleLabel(ids: readonly RoleId[]): Promise<string> {
    const empty = this.i18n.translate('profile.info.roleEmpty');
    const repo = this.rolesRepo;
    if (!repo || ids.length === 0) {
      return empty;
    }
    const roles = await Promise.all(ids.map((id) => repo.findById(id)));
    const names = roles.flatMap((role) => (role ? [role.name] : []));
    return names.length > 0 ? names.join(', ') : empty;
  }
}
