import { expect, test } from '@playwright/test';
import { LoginPage } from './support/login.page';

/**
 * Verifies the production-like refresh path when `auth.refreshViaCookie: true`:
 * after login the JS-visible storage must not hold a refresh token;
 * subsequent authenticated navigation still works (access in memory + cookie jar).
 */
test.describe('refresh via cookie', () => {
  test('login does not persist refresh token in web storage', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('admin@senbilan.dev', 'password123');
    await expect(page).toHaveURL(/\/dashboard/);

    const storageBlob = await page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
    }));
    const serialized = JSON.stringify(storageBlob);
    expect(serialized).not.toMatch(/refresh\.[a-z0-9.-]+/i);

    await page.goto('/users');
    await expect(page).toHaveURL(/\/users/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
