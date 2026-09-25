import { DomainError } from '../shared/domain-error';

export class RoleNameInvalidError extends DomainError {
  readonly code = 'role.name-invalid';

  constructor(readonly roleName: string) {
    super(`Role name "${roleName}" is invalid`);
  }
}

export class SystemRoleImmutableError extends DomainError {
  readonly code = 'role.system-immutable';

  constructor(readonly roleId: string) {
    super(`System role ${roleId} cannot lose permissions or be deleted`);
  }
}
