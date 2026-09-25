import {
  isPermissionKey,
  type PermissionKey,
  type Role,
  type RoleId,
  validateRoleName,
  withRolePermissions,
} from '@senbilan/core/domain';
import { NotFoundError, ValidationError } from '../../errors/app-error';
import { type RoleRepository } from '../../ports/role.repository';

export interface RoleFormInput {
  readonly name: string;
  readonly description: string;
  readonly permissions: readonly string[];
}

export const ROLE_VALIDATION_CODES = {
  nameInvalid: 'name.invalid',
  permissionsInvalid: 'permissions.invalid',
} as const;

const validate = (input: RoleFormInput) => {
  const errors: Record<string, string[]> = {};
  const name = validateRoleName(input.name);
  if (!name.ok) {
    errors['name'] = [ROLE_VALIDATION_CODES.nameInvalid];
  }
  const permissions = input.permissions.filter(isPermissionKey);
  if (permissions.length !== input.permissions.length) {
    errors['permissions'] = [ROLE_VALIDATION_CODES.permissionsInvalid];
  }
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
  return {
    name: name.ok ? name.value : input.name,
    description: input.description.trim(),
    permissions: permissions as readonly PermissionKey[],
  };
};

export class CreateRoleUseCase {
  constructor(private readonly roles: RoleRepository) {}

  async execute(input: RoleFormInput): Promise<Role> {
    return this.roles.create(validate(input));
  }
}

export class UpdateRoleUseCase {
  constructor(private readonly roles: RoleRepository) {}

  async execute(id: RoleId, input: RoleFormInput): Promise<Role> {
    const current = await this.roles.findById(id);
    if (!current) {
      throw new NotFoundError('role', id);
    }
    const data = validate(input);
    const next = withRolePermissions(current, data.permissions);
    if (!next.ok) {
      throw next.error;
    }
    return this.roles.update(id, {
      name: data.name,
      description: data.description,
      permissions: next.value.permissions,
    });
  }
}

export class DeleteRoleUseCase {
  constructor(private readonly roles: RoleRepository) {}

  async execute(id: RoleId): Promise<void> {
    const current = await this.roles.findById(id);
    if (!current) {
      throw new NotFoundError('role', id);
    }
    if (current.isSystem) {
      throw new ValidationError({ role: ['role.system-immutable'] });
    }
    await this.roles.delete(id);
  }
}
