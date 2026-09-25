import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { UserId, type UserWithRoles } from '@senbilan/core/domain';
import { RoleBadgeComponent } from '@senbilan/entities/role';
import {
  toUserViewModel,
  UserAvatarComponent,
  UserQueries,
  userStatusTone,
} from '@senbilan/entities/user';
import {
  AppButtonComponent,
  AppCardComponent,
  AppStatusComponent,
} from '@senbilan/design-system/ui';

@Component({
  selector: 'users-detail-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    AppButtonComponent,
    AppCardComponent,
    AppStatusComponent,
    UserAvatarComponent,
    RoleBadgeComponent,
  ],
  templateUrl: './user-detail-page.component.html',
  styleUrl: './user-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly userQueries = inject(UserQueries);

  protected readonly user = signal<UserWithRoles | null>(null);
  protected readonly loading = signal(true);
  protected readonly viewOf = toUserViewModel;
  protected readonly statusTone = userStatusTone;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      void this.load(UserId(id));
    } else {
      this.loading.set(false);
    }
  }

  private async load(id: ReturnType<typeof UserId>): Promise<void> {
    this.loading.set(true);
    try {
      this.user.set(
        await this.userQueries.detailOptions(id).queryFn({
          signal: new AbortController().signal,
        }),
      );
    } catch {
      this.user.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
