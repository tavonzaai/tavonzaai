import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const adminEmail = process.env.ADMIN_E2E_EMAIL || 'owner@tavonza.ai';
export const adminPassword = process.env.ADMIN_E2E_PASSWORD || 'Owner@1234';
export const apiBaseUrl = (process.env.API_E2E_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

export function requireAdminCredentials() {
  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_E2E_EMAIL and ADMIN_E2E_PASSWORD must be set for Admin E2E tests');
  }
}

export async function loginAsAdmin(page: Page) {
  requireAdminCredentials();
  await page.goto('/login');
  const email = page.getByTestId('login-email');
  const password = page.getByTestId('login-password');
  await expect(email).toBeVisible();
  await email.fill(adminEmail);
  await password.fill(adminPassword);
  await expect(email).toHaveValue(adminEmail);

  await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes('/auth/login') && res.request().method() === 'POST',
      { timeout: 30_000 },
    ),
    page.getByTestId('login-submit').click(),
  ]).then(([response]) => {
    expect(response.ok(), `admin login HTTP ${response.status()}`).toBeTruthy();
  });

  await page.waitForURL(/\/new-admin-dashboard/, { timeout: 30_000 });
  await expect(page.getByTestId('admin-view-dashboard')).toBeVisible();
}

export async function loginViaApi(request: APIRequestContext) {
  requireAdminCredentials();
  const response = await request.post(`${apiBaseUrl}/auth/login`, {
    data: { email: adminEmail, password: adminPassword },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const token = body.accessToken || body.data?.accessToken;
  expect(token).toBeTruthy();
  return { token, body };
}
