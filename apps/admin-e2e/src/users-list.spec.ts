import { expect, test } from '@playwright/test';
import { LoginPage } from './support/login.page';

test.describe('users list', () => {
  test('loads users page after login', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('admin@senbilan.dev', 'password123');
    await expect(page).toHaveURL(/\/dashboard(?:\?|$)/, { timeout: 15_000 });

    await page.goto('/users');
    await expect(page).toHaveURL(/\/users(?:\?|$)/, { timeout: 15_000 });
    await expect(page.locator('.users-page__title, h1').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('app-data-table, table').first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
