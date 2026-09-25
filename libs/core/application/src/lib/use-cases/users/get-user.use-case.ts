import { type UserId, type UserWithRoles } from '@senbilan/core/domain';
import { NotFoundError } from '../../errors/app-error';
import { type UserRepository } from '../../ports/user.repository';

export class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: UserId, signal?: AbortSignal): Promise<UserWithRoles> {
    const user = await this.users.findById(id, signal);
    if (!user) {
      throw new NotFoundError('user', id);
    }
    return user;
  }
}
