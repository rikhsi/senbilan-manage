import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { UserId } from '@senbilan/core/domain';
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
  AppEmptyStateComponent,
  AppSkeletonComponent,
  AppStatusComponent,
} from '@senbilan/design-system/ui';
import { injectQuery } from '@tanstack/angular-query-experimental';

@Component({
  selector: 'users-detail-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    AppButtonComponent,
    AppCardComponent,
    AppEmptyStateComponent,
    AppSkeletonComponent,
    AppStatusComponent,
    UserAvatarComponent,
    RoleBadgeComponent,
  ],
  templateUrl: './user-detail-page.component.html',
  styleUrl: './user-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailPageComponent {
  private readonly userQueries = inject(UserQueries);

  /** Bound from route `:id` via `withComponentInputBinding`. */
  readonly id = input.required<string>();

  private readonly detailQuery = injectQuery(() =>
    this.userQueries.detailOptions(UserId(this.id())),
  );

  protected readonly user = computed(() => this.detailQuery.data() ?? null);
  protected readonly loading = computed(() => this.detailQuery.isPending());
  protected readonly viewOf = toUserViewModel;
  protected readonly statusTone = userStatusTone;
}
