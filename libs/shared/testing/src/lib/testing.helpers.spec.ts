import { describe, expect, it } from 'vitest';
import { fakeRole, fakeSession, fakeUser } from './fixtures';
import { createMockUseCase } from './mock-use-case';
import { createTestQueryClient } from './provide-test-query-client';
import { createSpyRepo } from './spy-repo';
import { setupMsw, startMsw, stopMsw } from './msw';

describe('@senbilan/shared/testing', () => {
  it('createMockUseCase records calls and returns the stubbed result', async () => {
    const useCase = createMockUseCase<{ id: string }, string>(async (input) => `user:${input.id}`);
    await expect(useCase.execute({ id: 'u1' })).resolves.toBe('user:u1');
    expect(useCase.calls).toEqual([{ id: 'u1' }]);
    expect(useCase.execute).toHaveBeenCalledOnce();
  });

  it('createSpyRepo stubs listed methods and fails closed on others', async () => {
    const repo = createSpyRepo<{
      findById(id: string): Promise<string | null>;
      wipe(): Promise<void>;
    }>({
      findById: async (id) => (id === 'u1' ? 'Ada' : null),
    });
    await expect(repo.findById('u1')).resolves.toBe('Ada');
    await expect(repo.wipe()).rejects.toThrow(/wipe/);
  });

  it('fixtures build consistent User / Session / Role shapes', () => {
    const user = fakeUser({ firstName: 'Ada' });
    const session = fakeSession({ user });
    const role = fakeRole({ name: 'Admin' });
    expect(user.firstName).toBe('Ada');
    expect(session.user.id).toBe(user.id);
    expect(role.name).toBe('Admin');
  });

  it('createTestQueryClient uses test-friendly defaults', () => {
    const client = createTestQueryClient();
    expect(client.getDefaultOptions().queries?.retry).toBe(false);
    client.clear();
  });

  it('setupMsw creates a server that can start and stop', () => {
    const server = setupMsw();
    expect(server).toBeTruthy();
    startMsw();
    stopMsw();
  });
});
