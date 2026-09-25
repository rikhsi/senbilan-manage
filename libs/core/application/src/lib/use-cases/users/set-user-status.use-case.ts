import {
  canTransitionUserStatus,
  type User,
  type UserId,
  type UserStatus,
  UserStatusTransitionError,
} from '@senbilan/core/domain';
import { NotFoundError } from '../../errors/app-error';
import { type UserRepository } from '../../ports/user.repository';

export class SetUserStatusUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: UserId, status: UserStatus): Promise<User> {
    const current = await this.users.findById(id);
    if (!current) {
      throw new NotFoundError('user', id);
    }
    if (!canTransitionUserStatus(current.status, status)) {
      throw new UserStatusTransitionError(current.status, status);
    }
    return this.users.setStatus(id, status);
  }
}
