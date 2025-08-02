import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('should display homepage with registration and login buttons', async ({ page }) => {
    await expect(page.getByText('智能化在线视频创作平台')).toBeVisible()
    await expect(page.getByRole('link', { name: '开始创作' })).toBeVisible()
    await expect(page.getByRole('link', { name: '登录' })).toBeVisible()
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.getByRole('link', { name: '开始创作' }).click()
    await expect(page).toHaveURL('/auth/register')
    await expect(page.getByText('创建账户')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: '登录' }).click()
    await expect(page).toHaveURL('/auth/login')
    await expect(page.getByText('登录账户')).toBeVisible()
  })

  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/auth/register')
    
    await page.fill('input[name="name"]', 'E2E Test User')
    await page.fill('input[name="email"]', `e2e-test-${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')
    
    await page.click('button[type="submit"]')
    
    // Should redirect to login page with success message
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.getByText('注册成功，请登录')).toBeVisible()
  })

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.goto('/auth/register')
    
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'different')
    
    await page.click('button[type="submit"]')
    
    await expect(page.getByText('密码确认不匹配')).toBeVisible()
  })

  test('should login with valid credentials', async ({ page }) => {
    // First register a user
    await page.goto('/auth/register')
    const email = `login-test-${Date.now()}@example.com`
    
    await page.fill('input[name="name"]', 'Login Test User')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Wait for redirect to login page
    await expect(page).toHaveURL(/\/auth\/login/)
    
    // Now login
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('仪表板')).toBeVisible()
  })

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.getByText('用户不存在')).toBeVisible()
  })

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.getByRole('link', { name: '立即注册' }).click()
    await expect(page).toHaveURL('/auth/register')
    
    await page.getByRole('link', { name: '立即登录' }).click()
    await expect(page).toHaveURL('/auth/login')
  })
})