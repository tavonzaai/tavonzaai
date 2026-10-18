import { expect, type Page } from '@playwright/test';

export const managerEmail = process.env.MANAGER_E2E_EMAIL || 'manager@tavonza.ai';
export const managerPassword = process.env.MANAGER_E2E_PASSWORD || 'Manager@1234';

export async function loginAsManager(page: Page) {
  await page.goto('/login');
  const email = page.getByTestId('login-email');
  const password = page.getByTestId('login-password');
  await expect(email).toBeVisible();
  await email.fill(managerEmail);
  await password.fill(managerPassword);
  await expect(email).toHaveValue(managerEmail);

  await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes('/auth/login') && res.request().method() === 'POST',
      { timeout: 30_000 },
    ),
    page.getByTestId('login-submit').click(),
  ]).then(([response]) => {
    expect(response.ok(), `manager login HTTP ${response.status()}`).toBeTruthy();
  });

  await page.waitForURL(/\/branch-manager-dashboard/, { timeout: 30_000 });
  await expect(page.getByTestId('nav-dashboard')).toBeVisible();
}
