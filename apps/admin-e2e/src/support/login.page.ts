import { type Page, expect } from '@playwright/test';

/** Light page object for the auth login screen. */
export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/auth/login');
  }

  emailInput() {
    return this.page.locator('input[type="email"], input[autocomplete="username"]').first();
  }

  passwordInput() {
    return this.page
      .locator('input[type="password"], input[autocomplete="current-password"]')
      .first();
  }

  submitButton() {
    return this.page.locator('button[type="submit"]').first();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }

  async expectVisible(): Promise<void> {
    await expect(this.emailInput()).toBeVisible();
    await expect(this.passwordInput()).toBeVisible();
  }
}
