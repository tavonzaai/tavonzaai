import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin persistence against the real backend', () => {
  test('creates a restaurant and still sees it after reload', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-restaurants').click();
    await expect(page.getByTestId('admin-view-restaurants')).toBeVisible();

    const name = `E2E Restaurant ${Date.now()}`;
    await page.getByTestId('create-restaurant-open').click();
    await page.getByTestId('restaurant-name').fill(name);
    await page.getByTestId('restaurant-submit').click();
    await expect(page.getByText(/created successfully/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(name)).toBeVisible();
    await page.reload();
    await expect(page.getByText(name)).toBeVisible();
  });

  test('payments and reports pages render backend-backed empty or populated tables', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByTestId('nav-payments').click();
    await expect(page.getByTestId('admin-view-payments')).toBeVisible();
    await expect(page.getByText(/unable to load|failed to fetch/i)).toHaveCount(0);

    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('admin-view-reports')).toBeVisible();
    await expect(page.getByText(/unable to load|failed to fetch/i)).toHaveCount(0);
  });

  test('settings profile fields are bound to the authenticated user, not dummy defaults', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-settings').click();
    await expect(page.locator('input[value="742 Evergreen Terrace, Atlanta, GA"]')).toHaveCount(0);
    await expect(page.locator('input[value="+1 (555) 234-5678"]')).toHaveCount(0);
  });
});
