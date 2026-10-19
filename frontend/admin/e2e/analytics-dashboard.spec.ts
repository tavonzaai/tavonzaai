import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin analytics dashboard', () => {
  test('loads KPIs from /analytics/overview (not order list dumps)', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId('admin-view-dashboard')).toBeVisible();

    const analyticsUrls: string[] = [];
    const orderListUrls: string[] = [];
    page.on('request', (request) => {
      if (request.method() !== 'GET') return;
      const url = request.url();
      if (/\/analytics\/overview/.test(url)) analyticsUrls.push(url);
      if (/\/orders\/branch\//.test(url) || /\/orders\?/.test(url)) orderListUrls.push(url);
    });

    await page.reload();
    await expect(page.getByTestId('admin-view-dashboard')).toBeVisible();
    await expect.poll(() => analyticsUrls.length, { timeout: 20_000 }).toBeGreaterThan(0);
    expect(orderListUrls).toEqual([]);
    await expect(page.getByTestId('dashboard-paid-revenue')).toBeVisible();
  });
});
