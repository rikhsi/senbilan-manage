import { type User, type UserId, validateUserName } from '@senbilan/core/domain';
import { ValidationError } from '../../errors/app-error';
import { type UserRepository } from '../../ports/user.repository';

export interface ProfileFormInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly avatarUrl: string | null;
}

export class UpdateProfileUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: UserId, input: ProfileFormInput): Promise<User> {
    const errors: Record<string, string[]> = {};
    const firstName = validateUserName(input.firstName, 'firstName');
    const lastName = validateUserName(input.lastName, 'lastName');
    if (!firstName.ok) {
      errors['firstName'] = ['firstName.invalid'];
    }
    if (!lastName.ok) {
      errors['lastName'] = ['lastName.invalid'];
    }
    if (!firstName.ok || !lastName.ok) {
      throw new ValidationError(errors);
    }
    return this.users.update(userId, {
      firstName: firstName.value,
      lastName: lastName.value,
      avatarUrl: input.avatarUrl,
    });
  }
}
