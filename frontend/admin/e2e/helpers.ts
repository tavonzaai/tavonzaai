import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const adminEmail = process.env.ADMIN_E2E_EMAIL || '';
export const adminPassword = process.env.ADMIN_E2E_PASSWORD || '';
export const apiBaseUrl = (process.env.API_E2E_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

export function requireAdminCredentials() {
  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_E2E_EMAIL and ADMIN_E2E_PASSWORD must be set for Admin E2E tests');
  }
}

export async function loginAsAdmin(page: Page) {
  requireAdminCredentials();
  await page.goto('/login');
  await page.getByTestId('login-email').fill(adminEmail);
  await page.getByTestId('login-password').fill(adminPassword);
  await page.getByTestId('login-submit').click();
  await page.waitForURL(/\/new-admin-dashboard/, { timeout: 20_000 });
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
