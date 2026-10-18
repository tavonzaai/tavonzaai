import { expect, test } from '@playwright/test';
import { loginAsManager } from './helpers';

test.describe('Branch manager role requirements', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsManager(page);
  });

  test('dashboard KPIs come from /analytics/branch-dashboard', async ({ page }) => {
    const analyticsUrls: string[] = [];
    const orderDumpUrls: string[] = [];

    page.on('request', (request) => {
      if (request.method() !== 'GET') return;
      const url = request.url();
      if (/\/analytics\/branch-dashboard/.test(url)) analyticsUrls.push(url);
      if (/\/orders\/branch\//.test(url)) orderDumpUrls.push(url);
    });

    await page.getByTestId('nav-dashboard').click();
    await page.reload();
    await expect.poll(() => analyticsUrls.length, { timeout: 20_000 }).toBeGreaterThan(0);
    expect(orderDumpUrls).toEqual([]);
  });

  test('Categories nav opens menu categories module', async ({ page }) => {
    await page.getByTestId('nav-categories').click();
    await expect(page).toHaveURL(/\/branch-manager-dashboard\/categories/);
    await expect(page.getByTestId('menu-categories-view')).toBeVisible();
    await expect(page.getByTestId('menu-category-name-input')).toBeVisible();
    await expect(page.getByTestId('menu-category-create-btn')).toBeVisible();
  });

  test('Add Staff role options exclude Assistant Manager and Branch Manager', async ({ page }) => {
    await page.getByTestId('nav-staff').click();
    await expect(page.getByTestId('add-staff-open')).toBeVisible();
    await page.getByTestId('add-staff-open').click();
    const roleSelect = page.getByTestId('add-staff-role-select');
    await expect(roleSelect).toBeVisible();

    const labels = await roleSelect.locator('option').allTextContents();
    const joined = labels.join(' | ').toLowerCase();
    expect(joined).not.toContain('assistant');
    expect(joined).not.toMatch(/branch manager/);
    expect(joined).toContain('waiter');
    expect(joined).toContain('cashier');
    expect(joined).toContain('kitchen');
    expect(joined).toContain('bartender');
    expect(joined).toContain('host');

    const values = await roleSelect.locator('option').evaluateAll((opts) =>
      opts.map((o) => (o as HTMLOptionElement).value),
    );
    expect(values).not.toContain('ASSISTANT_MANAGER');
    expect(values).not.toContain('BRANCH_MANAGER');
    expect(values).toEqual(
      expect.arrayContaining(['WAITER', 'CASHIER', 'KITCHEN_STAFF', 'BARTENDER', 'HOST']),
    );
  });
});
