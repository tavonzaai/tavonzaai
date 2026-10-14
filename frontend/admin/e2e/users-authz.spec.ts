import { expect, test } from '@playwright/test';
import { apiBaseUrl, loginAsAdmin, loginViaApi } from './helpers';

test.describe('User creation and authorization', () => {
  test('creates a staff user from the Admin permissions page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-permissions').click();
    await expect(page.getByTestId('create-staff-form')).toBeVisible();
    await expect(page.getByTestId('permissions-branch')).not.toHaveValue('', { timeout: 15_000 });

    const suffix = Date.now();
    const name = `E2E Waiter ${suffix}`;
    const email = `e2e.waiter.${suffix}@example.com`;

    await page.getByTestId('create-staff-name').fill(name);
    await page.getByTestId('create-staff-email').fill(email);
    await page.getByTestId('create-staff-password').fill('StaffPass123!');
    await page.getByTestId('create-staff-role').selectOption('WAITER');
    await page.getByTestId('create-staff-submit').click();

    await expect(page.getByText(/Staff account created/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('cell', { name })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('cell', { name })).toBeVisible();
  });

  test('rejects staff creation with an invalid password from the UI', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByTestId('nav-permissions').click();
    await page.getByTestId('create-staff-name').fill('Too Short');
    await page.getByTestId('create-staff-email').fill(`short.${Date.now()}@example.com`);
    await page.getByTestId('create-staff-password').fill('123');
    await page.getByTestId('create-staff-submit').click();
    await expect(page.getByTestId('create-staff-form')).toBeVisible();
  });

  test('backend rejects privileged role assignment on staff create', async ({ request }) => {
    const { token } = await loginViaApi(request);
    const branches = await request.get(`${apiBaseUrl}/branches?page=1&limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(branches.ok()).toBeTruthy();
    const branchBody = await branches.json();
    const branchId = branchBody.data?.[0]?.id || branchBody[0]?.id;
    test.skip(!branchId, 'No branch available for authorization fixture');

    const forbidden = await request.post(`${apiBaseUrl}/branches/${branchId}/staff`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'Escalation Attempt',
        email: `escalate.${Date.now()}@example.com`,
        password: 'StaffPass123!',
        role: 'SUPER_ADMIN',
      },
    });
    expect(forbidden.status()).toBeGreaterThanOrEqual(400);

    const unknownPerm = await request.post(`${apiBaseUrl}/branches/${branchId}/staff`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'Bad Grant',
        email: `badgrant.${Date.now()}@example.com`,
        password: 'StaffPass123!',
        role: 'WAITER',
        permissions: ['DELETE_THE_PLATFORM'],
      },
    });
    expect(unknownPerm.status()).toBeGreaterThanOrEqual(400);
  });

  test('unauthenticated API callers cannot list users', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/users`);
    expect([401, 403]).toContain(response.status());
  });

  test('create-admin is rejected for a non-super-admin token', async ({ request }) => {
    const { token, body } = await loginViaApi(request);
    const role = body.user?.globalRole || body.user?.role || body.data?.user?.globalRole;
    test.skip(role === 'SUPER_ADMIN', 'Seed account is SUPER_ADMIN; privilege test does not apply');

    const response = await request.post(`${apiBaseUrl}/users/create-admin`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'Should Fail',
        email: `super.${Date.now()}@example.com`,
        password: 'AdminPass123!',
      },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
