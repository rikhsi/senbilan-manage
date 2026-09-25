import { type User } from '@senbilan/core/domain';
import { type Page } from '../../contracts/pagination';
import { type UserListRequest, type UserRepository } from '../../ports/user.repository';

const MAX_PAGE_SIZE = 100;

export class GetUsersUseCase {
  constructor(private readonly users: UserRepository) {}

  execute(request: UserListRequest, signal?: AbortSignal): Promise<Page<User>> {
    const search = request.search?.trim();
    const safe: UserListRequest = {
      page: Math.max(1, request.page),
      size: Math.min(MAX_PAGE_SIZE, Math.max(1, request.size)),
      ...(search ? { search } : {}),
      ...(request.sort !== undefined ? { sort: request.sort } : {}),
      ...(request.filter !== undefined ? { filter: request.filter } : {}),
    };
    return this.users.findPage(safe, signal);
  }
}
