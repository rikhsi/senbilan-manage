import { expect, test } from '@playwright/test';
import { LoginPage } from './support/login.page';

test.describe('login', () => {
  test('signs in with mock credentials and lands on dashboard', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.expectVisible();
    await login.login('admin@senbilan.dev', 'password123');

    await expect(page).toHaveURL(/\/dashboard(?:\?|$)/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
