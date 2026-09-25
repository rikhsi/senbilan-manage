import { type Role, type RoleId } from '@senbilan/core/domain';
import { NotFoundError } from '../../errors/app-error';
import { type RoleRepository } from '../../ports/role.repository';

/** Read-only role queries. Grouped in one service because they carry no business rules. */
export class RoleQueries {
  constructor(private readonly roles: RoleRepository) {}

  getAll(signal?: AbortSignal): Promise<readonly Role[]> {
    return this.roles.findAll(signal);
  }

  async getById(id: RoleId, signal?: AbortSignal): Promise<Role> {
    const role = await this.roles.findById(id, signal);
    if (!role) {
      throw new NotFoundError('role', id);
    }
    return role;
  }
}
