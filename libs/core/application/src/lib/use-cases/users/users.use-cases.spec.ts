import { UserId, UserStatusTransitionError } from '@senbilan/core/domain';
import { InMemoryUserRepository, makeUser } from '../../../testing/fakes';
import { ForbiddenError, NotFoundError, ValidationError } from '../../errors/app-error';
import { CreateUserUseCase } from './create-user.use-case';
import { DeleteUsersUseCase } from './delete-users.use-case';
import { GetUserUseCase } from './get-user.use-case';
import { GetUsersUseCase } from './get-users.use-case';
import { SetUserStatusUseCase } from './set-user-status.use-case';

describe('GetUsersUseCase', () => {
  it('clamps page and size to safe bounds and trims search', async () => {
    const repo = new InMemoryUserRepository([makeUser()]);
    const page = await new GetUsersUseCase(repo).execute({ page: 0, size: 5000, search: '  ada ' });
    expect(page.page).toBe(1);
    expect(page.size).toBe(100);
  });
});

describe('GetUserUseCase', () => {
  it('throws NotFoundError for unknown ids', async () => {
    const useCase = new GetUserUseCase(new InMemoryUserRepository());
    await expect(useCase.execute(UserId('nope'))).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('CreateUserUseCase', () => {
  it('collects all field errors before touching the repository', async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new CreateUserUseCase(repo);
    const promise = useCase.execute({ email: 'bad', firstName: '', lastName: 'Ok', roleIds: [] });
    await expect(promise).rejects.toBeInstanceOf(ValidationError);
    await promise.catch((error: ValidationError) => {
      expect(Object.keys(error.fieldErrors).sort()).toEqual(['email', 'firstName', 'roleIds']);
    });
    expect(repo.users).toHaveLength(0);
  });

  it('normalises the e-mail and deduplicates roles', async () => {
    const repo = new InMemoryUserRepository();
    const user = await new CreateUserUseCase(repo).execute({
      email: ' New@Senbilan.UZ ',
      firstName: ' Ada ',
      lastName: 'Lovelace',
      roleIds: ['admin', 'admin'],
    });
    expect(user.email).toBe('new@senbilan.uz');
    expect(user.firstName).toBe('Ada');
    expect(user.roleIds).toEqual(['admin']);
  });
});

describe('SetUserStatusUseCase', () => {
  it('enforces the status transition rules', async () => {
    const repo = new InMemoryUserRepository([makeUser({ status: 'blocked' })]);
    const useCase = new SetUserStatusUseCase(repo);
    await expect(useCase.execute(UserId('u1'), 'invited')).rejects.toBeInstanceOf(UserStatusTransitionError);
    const updated = await useCase.execute(UserId('u1'), 'active');
    expect(updated.status).toBe('active');
  });
});

describe('DeleteUsersUseCase', () => {
  it('refuses to delete the current user and does nothing for empty input', async () => {
    const repo = new InMemoryUserRepository([makeUser(), makeUser({ id: UserId('u2') })]);
    const useCase = new DeleteUsersUseCase(repo);

    await expect(useCase.execute([UserId('u1'), UserId('u2')], UserId('u1'))).rejects.toBeInstanceOf(ForbiddenError);
    await useCase.execute([], UserId('u1'));
    expect(repo.calls).toEqual([]);

    await useCase.execute([UserId('u2'), UserId('u2')], UserId('u1'));
    expect(repo.calls).toEqual(['deleteMany:u2']);
  });
});
