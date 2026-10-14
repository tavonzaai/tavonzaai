import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers';

const SECTIONS = [
  { path: 'org-profile', testId: 'settings-section-org-profile' },
  { path: 'admin-profile', testId: 'settings-section-admin-profile' },
  { path: 'notifications', testId: 'settings-section-notifications' },
  { path: 'security', testId: 'settings-section-security' },
] as const;

test.describe('Settings routes and APIs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  for (const section of SECTIONS) {
    test(`opens /settings/${section.path} directly and survives refresh`, async ({ page }) => {
      await page.goto(`/new-admin-dashboard/settings/${section.path}`);
      await expect(page.getByTestId('admin-view-settings')).toBeVisible();
      await expect(page.getByTestId(section.testId)).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`/new-admin-dashboard/settings/${section.path}`));
      await page.reload();
      await expect(page.getByTestId(section.testId)).toBeVisible();
    });
  }

  test('unknown settings section redirects to org-profile', async ({ page }) => {
    await page.goto('/new-admin-dashboard/settings/not-a-real-tab');
    await expect(page).toHaveURL(/\/new-admin-dashboard\/settings\/org-profile/);
    await expect(page.getByTestId('settings-section-org-profile')).toBeVisible();
  });

  test('tab clicks update the URL and back/forward restore the section', async ({ page }) => {
    await page.goto('/new-admin-dashboard/settings/org-profile');
    await expect(page.getByTestId('settings-section-org-profile')).toBeVisible();

    await page.getByTestId('settings-tab-admin-profile').click();
    await expect(page).toHaveURL(/\/settings\/admin-profile/);
    await expect(page.getByTestId('settings-section-admin-profile')).toBeVisible();

    await page.getByTestId('settings-tab-notifications').click();
    await expect(page).toHaveURL(/\/settings\/notifications/);
    await expect(page.getByTestId('settings-section-notifications')).toBeVisible();

    await page.getByTestId('settings-tab-security').click();
    await expect(page).toHaveURL(/\/settings\/security/);
    await expect(page.getByTestId('settings-section-security')).toBeVisible();

    await page.goBack();
    await expect(page.getByTestId('settings-section-notifications')).toBeVisible();
    await page.goForward();
    await expect(page.getByTestId('settings-section-security')).toBeVisible();
  });

  test('organization name loads from the backend and empty names are rejected', async ({ page }) => {
    await page.goto('/new-admin-dashboard/settings/org-profile');
    const name = page.getByTestId('settings-org-name');
    await expect(name).toBeVisible();
    await expect(name).not.toHaveValue('', { timeout: 15_000 });

    const original = await name.inputValue();
    await name.fill('');
    await page.getByTestId('settings-org-save').click();
    await expect(page.getByText(/Organization name is required/i)).toBeVisible();

    await name.fill(original);
  });

  test('admin profile is bound to the authenticated user', async ({ page }) => {
    await page.goto('/new-admin-dashboard/settings/admin-profile');
    await expect(page.getByTestId('settings-admin-name')).not.toHaveValue('', { timeout: 15_000 });
    await expect(page.getByText(/Authenticated Email/i)).toBeVisible();
  });

  test('security password form rejects mismatched passwords', async ({ page }) => {
    await page.goto('/new-admin-dashboard/settings/security');
    await page.getByTestId('settings-current-password').fill('CurrentPass1');
    await page.getByTestId('settings-new-password').fill('NewPass123!');
    await page.getByTestId('settings-confirm-password').fill('Mismatch123!');
    await page.getByTestId('settings-password-save').click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });
});
