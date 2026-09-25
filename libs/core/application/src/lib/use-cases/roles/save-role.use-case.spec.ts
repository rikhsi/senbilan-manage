import { RoleId, SystemRoleImmutableError } from '@senbilan/core/domain';
import { InMemoryRoleRepository, makeRole } from '../../../testing/fakes';
import { ValidationError } from '../../errors/app-error';
import { CreateRoleUseCase, DeleteRoleUseCase, UpdateRoleUseCase } from './save-role.use-case';

describe('Role use cases', () => {
  it('creates a role, ignoring unknown permission keys as a validation error', async () => {
    const repo = new InMemoryRoleRepository();
    const useCase = new CreateRoleUseCase(repo);
    await expect(
      useCase.execute({ name: 'Ops', description: '', permissions: ['users:read', 'nope:x'] }),
    ).rejects.toBeInstanceOf(ValidationError);
    const role = await useCase.execute({ name: ' Ops ', description: ' team ', permissions: ['users:read'] });
    expect(role.name).toBe('Ops');
    expect(role.description).toBe('team');
  });

  it('protects system roles from losing permissions', async () => {
    const repo = new InMemoryRoleRepository([
      makeRole({ id: RoleId('owner'), isSystem: true, permissions: ['users:read', 'roles:write'] }),
    ]);
    const useCase = new UpdateRoleUseCase(repo);
    await expect(
      useCase.execute(RoleId('owner'), { name: 'Owner', description: '', permissions: ['users:read'] }),
    ).rejects.toBeInstanceOf(SystemRoleImmutableError);
  });

  it('refuses to delete system roles', async () => {
    const repo = new InMemoryRoleRepository([makeRole({ id: RoleId('owner'), isSystem: true })]);
    await expect(new DeleteRoleUseCase(repo).execute(RoleId('owner'))).rejects.toBeInstanceOf(ValidationError);
    await new DeleteRoleUseCase(new InMemoryRoleRepository([makeRole()])).execute(RoleId('editor'));
  });
});
