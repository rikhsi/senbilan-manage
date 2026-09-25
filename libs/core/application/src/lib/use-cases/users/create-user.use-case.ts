import { RoleId, type User } from '@senbilan/core/domain';
import { type UserRepository } from '../../ports/user.repository';
import { type UserFormInput, validateUserInput } from './user-input.validation';

export class CreateUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(input: UserFormInput): Promise<User> {
    const validated = validateUserInput(input);
    if (!validated.ok) {
      throw validated.error;
    }
    return this.users.create({
      email: validated.value.email,
      firstName: validated.value.firstName,
      lastName: validated.value.lastName,
      roleIds: validated.value.roleIds.map(RoleId),
    });
  }
}
