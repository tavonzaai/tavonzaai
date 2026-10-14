import { expect, test, type Page } from '@playwright/test';
import { apiBaseUrl, loginAsAdmin, loginViaApi } from './helpers';

function collectGetUrls(page: Page) {
  const urls: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'GET') urls.push(request.url());
  });
  return urls;
}

function hasPagedListCall(urls: string[], path: string) {
  return urls.some(
    (url) => url.includes(path) && url.includes('page=1') && url.includes('limit=12'),
  );
}

test.describe('Admin listing pagination', () => {
  test('restaurants, branches, permissions, and payments default to page=1&limit=12', async ({
    page,
  }) => {
    const urls = collectGetUrls(page);
    await loginAsAdmin(page);

    await page.getByTestId('nav-restaurants').click();
    await expect(page.getByTestId('admin-view-restaurants')).toBeVisible();
    await expect.poll(() => hasPagedListCall(urls, '/restaurants')).toBeTruthy();
    const restaurantCards = page.locator('[data-testid="restaurants-list"] .grid > *');
    if ((await restaurantCards.count()) > 0) {
      expect(await restaurantCards.count()).toBeLessThanOrEqual(12);
    }

    await page.getByTestId('nav-branches').click();
    await expect(page.getByTestId('admin-view-branches')).toBeVisible();
    await expect.poll(() => hasPagedListCall(urls, '/branches')).toBeTruthy();
    const branchRows = page.locator('[data-testid="branches-list"] tbody tr');
    if ((await branchRows.count()) > 0) {
      expect(await branchRows.count()).toBeLessThanOrEqual(12);
    }

    await page.getByTestId('nav-permissions').click();
    await expect(page.getByTestId('admin-view-permissions')).toBeVisible();
    await expect.poll(() => hasPagedListCall(urls, '/users')).toBeTruthy();
    const userRows = page.locator('[data-testid^="user-expand-"]');
    await expect(userRows.first()).toBeVisible({ timeout: 15_000 });
    expect(await userRows.count()).toBeLessThanOrEqual(12);

    await page.getByTestId('nav-payments').click();
    await expect(page.getByTestId('admin-view-payments')).toBeVisible();
    await expect
      .poll(() => urls.filter((url) => url.includes('/payments')).join('\n'))
      .toMatch(/limit=12/);
  });

  test('pagination controls navigate when more than one page exists', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-restaurants').click();
    await expect(page.getByTestId('admin-view-restaurants')).toBeVisible();

    const bar = page.getByTestId('pagination-bar');
    if ((await bar.count()) === 0) {
      test.skip(true, 'Not enough restaurants to exercise page navigation');
    }

    await expect(page).toHaveURL(/\/new-admin-dashboard\/restaurants/);
    const next = page.getByTestId('pagination-next');
    if (await next.isEnabled()) {
      await next.click();
      await expect(page).toHaveURL(/page=2/);
      await page.getByTestId('pagination-prev').click();
      await expect(page).not.toHaveURL(/page=2/);
    }
  });

  test('users API metadata matches a 12-item page', async ({ request }) => {
    const { token } = await loginViaApi(request);
    const response = await request.get(`${apiBaseUrl}/users?page=1&limit=12`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const rows = body.data || [];
    const meta = body.meta;
    expect(rows.length).toBeLessThanOrEqual(12);
    if (meta) {
      expect(meta.limit).toBe(12);
      expect(meta.page).toBe(1);
      expect(rows.length).toBe(Math.min(12, meta.total ?? rows.length));
    }
  });
});
