import { fullName, initials, type User, type UserStatus } from '@senbilan/core/domain';
import type { Tone } from '@senbilan/design-system/ui';

export interface UserViewModel {
  readonly id: string;
  readonly fullName: string;
  readonly initials: string;
  readonly email: string;
  readonly avatarUrl: string | null;
  readonly status: UserStatus;
  readonly lastActiveAt: string | null;
  readonly roleIds: readonly string[];
}

export const toUserViewModel = (user: User): UserViewModel => ({
  id: user.id,
  fullName: fullName(user),
  initials: initials(user),
  email: user.email,
  avatarUrl: user.avatarUrl,
  status: user.status,
  lastActiveAt: user.lastActiveAt,
  roleIds: user.roleIds,
});

export const userStatusTone = (status: UserStatus): Tone => {
  switch (status) {
    case 'active':
      return 'success';
    case 'invited':
      return 'info';
    case 'blocked':
      return 'danger';
  }
};
