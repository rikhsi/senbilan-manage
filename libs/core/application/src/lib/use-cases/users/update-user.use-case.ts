import { RoleId, type User, type UserId } from '@senbilan/core/domain';
import { type UserRepository } from '../../ports/user.repository';
import { type UserFormInput, validateUserInput } from './user-input.validation';

export class UpdateUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: UserId, input: UserFormInput): Promise<User> {
    const validated = validateUserInput(input);
    if (!validated.ok) {
      throw validated.error;
    }
    // E-mail is immutable after creation (it is the login); only the rest is sent.
    return this.users.update(id, {
      firstName: validated.value.firstName,
      lastName: validated.value.lastName,
      roleIds: validated.value.roleIds.map(RoleId),
    });
  }
}
