import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000'; // Assuming the dev server runs on port 3000

test.describe('Authentication Flow', () => {
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const password = 'Password123';
  const name = 'Test User';

  test('should allow a user to register', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);

    await expect(page).toHaveTitle(/Create an Account/);

    await page.fill('input[id="name"]', name);
    await page.fill('input[id="email"]', uniqueEmail);
    await page.fill('input[id="password"]', password);

    await page.click('button[type="submit"]');

    // After registration, user should be redirected to the dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('h1')).toHaveText(/Welcome to your Dashboard/);
    await expect(page.locator('p')).toContainText(`Hello, ${name}`);
  });

  test('should allow a registered user to log out and log back in', async ({ page }) => {
    // First, ensure the user is registered and logged in by running the registration flow
    await page.goto(`${BASE_URL}/auth/register`);
    await page.fill('input[id="name"]', name);
    await page.fill('input[id="email"]', uniqueEmail);
    await page.fill('input[id="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Now, log out
    await page.click('button:has-text("Log Out")');
    
    // After logout, user should be redirected to the login page
    await page.waitForURL(`${BASE_URL}/auth/login`);
    await expect(page.locator('h1')).toHaveText(/Log in to your Account/);

    // Now, log back in
    await page.fill('input[id="email"]', uniqueEmail);
    await page.fill('input[id="password"]', password);
    await page.click('button[type="submit"]');

    // After login, user should be redirected to the dashboard again
    await page.waitForURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('h1')).toHaveText(/Welcome to your Dashboard/);
  });

  test('should show an error for invalid login credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    await page.fill('input[id="email"]', 'wrong@example.com');
    await page.fill('input[id="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Check for an error message on the page
    const errorMessage = page.locator('p.text-red-500');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/invalid email or password/i);
  });
});
