import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers';

const TABS = [
  'dashboard',
  'restaurants',
  'branches',
  'permissions',
  'payments',
  'reports',
  'subscription',
  'settings',
] as const;

test.describe('Admin dashboard pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  for (const tab of TABS) {
    test(`renders ${tab} from the live shell`, async ({ page }) => {
      await page.getByTestId(`nav-${tab}`).click();
      await expect(page.getByTestId(`admin-view-${tab}`)).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`/new-admin-dashboard/${tab}`));
    });
  }

  test('dashboard KPIs come from the analytics API, not placeholder millions', async ({ page }) => {
    await expect(page.getByTestId('dashboard-paid-revenue')).toBeVisible();
    await expect(page.getByText('$2M')).toHaveCount(0);
    await expect(page.getByText('Excellent')).toHaveCount(0);
  });

  test('subscription stays a non-billing placeholder', async ({ page }) => {
    await page.getByTestId('nav-subscription').click();
    await expect(page.getByTestId('subscription-placeholder')).toBeVisible();
    await expect(page.getByText(/Visa ending in 4242/i)).toHaveCount(0);
  });

  test('permissions page exposes team directory and staff creation', async ({ page }) => {
    await page.getByTestId('nav-permissions').click();
    await expect(page.getByTestId('team-directory')).toBeVisible();
    await expect(page.getByTestId('create-staff-form')).toBeVisible();
    await expect(page.getByTestId('create-staff-role')).toContainText('WAITER');
    await expect(page.getByTestId('create-staff-role')).not.toContainText('SUPER_ADMIN');
  });

  test('restaurants page can open the create form and validate required name', async ({ page }) => {
    await page.getByTestId('nav-restaurants').click();
    await expect(page.getByRole('heading', { name: 'Restaurants' })).toBeVisible();
    await expect(page.getByTestId('create-restaurant-open')).toBeEnabled();
    await page.getByTestId('create-restaurant-open').click();
    await expect(page.getByRole('heading', { name: 'Create Restaurant' })).toBeVisible();
    await expect(page.getByTestId('restaurant-name')).toBeVisible();
    await page.getByTestId('restaurant-submit').click();
    await expect(page.getByTestId('restaurant-name')).toBeVisible();
  });
});
