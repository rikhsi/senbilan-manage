import { type UserId } from '@senbilan/core/domain';
import { ForbiddenError } from '../../errors/app-error';
import { type UserRepository } from '../../ports/user.repository';

export class DeleteUsersUseCase {
  constructor(private readonly users: UserRepository) {}

  /** `currentUserId` guards against an admin deleting their own account in a bulk action. */
  async execute(ids: readonly UserId[], currentUserId: UserId): Promise<void> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) {
      return;
    }
    if (unique.includes(currentUserId)) {
      throw new ForbiddenError();
    }
    await this.users.deleteMany(unique);
  }
}
