import { DomainError } from '../shared/domain-error';
import { type UserStatus } from './user.entity';

export class InvalidEmailError extends DomainError {
  readonly code = 'user.email-invalid';

  constructor(readonly email: string) {
    super(`"${email}" is not a valid e-mail address`);
  }
}

export class UserNameInvalidError extends DomainError {
  readonly code = 'user.name-invalid';

  constructor(readonly field: 'firstName' | 'lastName') {
    super(`User ${field} is invalid`);
  }
}

export class UserStatusTransitionError extends DomainError {
  readonly code = 'user.status-transition';

  constructor(
    readonly from: UserStatus,
    readonly to: UserStatus,
  ) {
    super(`Cannot change user status from ${from} to ${to}`);
  }
}
