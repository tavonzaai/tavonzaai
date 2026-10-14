import { expect, test } from '@playwright/test';
import { apiBaseUrl, loginAsAdmin, loginViaApi } from './helpers';

test.describe('Permissions layout', () => {
  test('keeps the user list visible when a permission row is expanded', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-permissions').click();
    await expect(page.getByTestId('team-directory')).toBeVisible();

    const expanders = page.locator('[data-testid^="user-expand-"]');
    await expect(expanders.first()).toBeVisible({ timeout: 15_000 });

    const first = expanders.first();
    const testId = await first.getAttribute('data-testid');
    const userId = testId?.replace('user-expand-', '') || '';
    await first.click();
    await expect(page.getByTestId(`user-permissions-${userId}`)).toBeVisible();
    await expect(page.getByTestId('team-directory')).toBeVisible();
    await expect(page.getByTestId('create-staff-form')).toBeVisible();
  });

  test('backend rejects unauthenticated permission updates', async ({ request }) => {
    const { token } = await loginViaApi(request);
    const branches = await request.get(`${apiBaseUrl}/branches?page=1&limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(branches.ok()).toBeTruthy();
    const branchBody = await branches.json();
    const branchId = branchBody.data?.[0]?.id || branchBody[0]?.id;
    test.skip(!branchId, 'No branch available');

    const staff = await request.get(`${apiBaseUrl}/branches/${branchId}/staff`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(staff.ok()).toBeTruthy();
    const staffBody = await staff.json();
    const rows = staffBody.data || staffBody;
    const staffId = Array.isArray(rows) ? rows[0]?.staffId || rows[0]?.id : undefined;
    test.skip(!staffId, 'No staff assignment available');

    const unauth = await request.patch(`${apiBaseUrl}/branches/${branchId}/staff/${staffId}`, {
      data: { permissions: ['VIEW_ORDERS'] },
    });
    expect([401, 403]).toContain(unauth.status());
  });
});
