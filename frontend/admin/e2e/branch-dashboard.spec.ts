import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Branch dashboard routes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('opens a branch on nested section URLs and reloads in place', async ({ page }) => {
    await page.getByTestId('nav-branches').click();
    const opener = page.locator('[data-testid^="branch-open-"]').first();
    await expect(opener).toBeVisible();
    await opener.click();
    await expect(page).toHaveURL(/\/new-admin-dashboard\/branches\/[0-9a-f-]{36}\/overview$/);
    await expect(page.getByTestId('branch-dashboard')).toBeVisible();

    const branchId = page.url().match(/branches\/([0-9a-f-]{36})\/overview$/)?.[1];
    expect(branchId).toBeTruthy();

    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'GET') requests.push(request.url());
    });
    await page.reload();
    await expect(page.getByTestId('branch-dashboard')).toBeVisible();

    const listCalls = requests.filter((url) => /\/branches\?/.test(url));
    const detailCalls = requests.filter((url) =>
      new RegExp(`/branches/${branchId}(?:\\?|$)`).test(url),
    );
    expect(listCalls).toEqual([]);
    expect(detailCalls.length).toBeGreaterThan(0);

    await page.getByTestId('branch-section-tables').click();
    await expect(page).toHaveURL(new RegExp(`/branches/${branchId}/tables$`));
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/branches/${branchId}/tables$`));

    await page.getByTestId('branch-section-menu').click();
    await expect(page).toHaveURL(new RegExp(`/branches/${branchId}/menu$`));

    await page.getByTestId('branch-section-staff').click();
    await expect(page).toHaveURL(new RegExp(`/branches/${branchId}/staff$`));
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/branches/${branchId}/staff$`));
    await expect(page.getByTestId('staff-role-filter')).toBeVisible();
    await expect(page.getByTestId('staff-status-filter')).toHaveValue('All');

    await page.goto(`/new-admin-dashboard/branches?branchId=${branchId}`);
    await expect(page).toHaveURL(new RegExp(`/branches/${branchId}/overview$`));

    await page.goto(`/new-admin-dashboard/branches/${branchId}/menus`);
    await expect(page).toHaveURL(new RegExp(`/branches/${branchId}/menu$`));
    await page.goto(`/new-admin-dashboard/branches/${branchId}/stuffs`);
    await expect(page).toHaveURL(new RegExp(`/branches/${branchId}/staff$`));
  });

  test('keeps deactivated staff visible on the staff tab', async ({ page }) => {
    await page.getByTestId('nav-branches').click();
    const opener = page.locator('[data-testid^="branch-open-"]').first();
    await expect(opener).toBeVisible();
    await opener.click();
    await page.getByTestId('branch-section-staff').click();
    await expect(page.getByTestId('branch-dashboard')).toBeVisible();

    const deactivate = page.locator('[data-testid^="staff-deactivate-"]').first();
    if ((await deactivate.count()) === 0) {
      test.skip(true, 'No active staff on the first branch');
    }

    const testId = await deactivate.getAttribute('data-testid');
    const staffId = testId?.replace('staff-deactivate-', '') || '';
    expect(staffId).toBeTruthy();
    await deactivate.click();
    const row = page.getByTestId(`staff-row-${staffId}`);
    await expect(row).toContainText('Inactive');
    await page.getByTestId(`staff-activate-${staffId}`).click();
    await expect(row).toContainText('Active');
  });

  test('opens a restaurant from its id path', async ({ page }) => {
    await page.getByTestId('nav-restaurants').click();
    const opener = page.locator('[data-testid^="restaurant-open-"]').first();
    await expect(opener).toBeVisible();
    await opener.click();
    await expect(page).toHaveURL(/\/new-admin-dashboard\/restaurants\/[0-9a-f-]{36}$/);

    const restaurantId = page.url().match(/restaurants\/([0-9a-f-]{36})$/)?.[1];
    await page.goto(`/new-admin-dashboard/restaurants?id=${restaurantId}`);
    await expect(page).toHaveURL(new RegExp(`/restaurants/${restaurantId}$`));
  });
});
