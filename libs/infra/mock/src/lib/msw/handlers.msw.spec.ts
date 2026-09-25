/**
 * Example: exercise mock HTTP handlers with MSW in Node (Vitest).
 * Prefer these for contract smoke tests; port fakes cover use-case logic.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, createMockHandlers, resetMockDb } from '../..';
import { resetMsw, setupMsw, startMsw, stopMsw } from '@senbilan/shared/testing';

const API = 'http://localhost/api';

describe('MSW mock handlers (users/auth)', () => {
  beforeAll(() => {
    setupMsw(...createMockHandlers(API));
    startMsw();
  });

  afterEach(() => {
    resetMsw();
    resetMockDb();
  });

  afterAll(() => {
    stopMsw();
  });

  it('logs in with demo credentials and returns session + tokens', async () => {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_ADMIN_PASSWORD,
      }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      data: { session: { user: { email: string } }; tokens: { accessToken: string } };
    };
    expect(body.data.session.user.email).toBe(DEMO_ADMIN_EMAIL);
    expect(body.data.tokens.accessToken).toBeTruthy();
  });

  it('lists users page', async () => {
    const response = await fetch(`${API}/users?page=1&size=10`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      data: readonly unknown[];
      meta: { total: number; page: number; size: number };
    };
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.meta.page).toBe(1);
  });

  it('rejects bad credentials', async () => {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: DEMO_ADMIN_EMAIL, password: 'wrong' }),
    });
    expect(response.status).toBe(401);
  });
});
