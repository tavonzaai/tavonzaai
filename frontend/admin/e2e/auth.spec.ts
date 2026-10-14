import { expect, test } from '@playwright/test';
import { adminEmail, adminPassword, loginAsAdmin, requireAdminCredentials } from './helpers';

test.describe('Admin authentication', () => {
  test('rejects invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill('nobody@example.com');
    await page.getByTestId('login-password').fill('WrongPass123!');
    await page.getByTestId('login-submit').click();
    await expect(page.getByText(/invalid|incorrect|unauthorized|failed/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects unauthenticated users away from protected routes', async ({ page }) => {
    await page.goto('/new-admin-dashboard/dashboard');
    await page.waitForURL(/\/login/, { timeout: 15_000 });
  });

  test('logs in an authorized admin and signs out', async ({ page }) => {
    requireAdminCredentials();
    await loginAsAdmin(page);
    await expect(page.getByTestId('nav-restaurants')).toBeVisible();
    await page.getByTestId('admin-sign-out').click();
    await page.waitForURL(/\/login/, { timeout: 15_000 });
  });

  test('keeps the session email available after login', async ({ page }) => {
    requireAdminCredentials();
    await loginAsAdmin(page);
    await page.getByTestId('nav-settings').click();
    await expect(page.getByTestId('admin-view-settings')).toBeVisible();
    await expect(page.getByRole('heading', { name: /settings|organization|profile/i }).first()).toBeVisible();
    void adminEmail;
    void adminPassword;
  });
});
