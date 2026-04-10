import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads and has hero CTA', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Words Incarnate/i);
    // Hero section should be visible
    await expect(page.locator('text=/discover|values|family/i').first()).toBeVisible({ timeout: 10_000 });
  });

  test('quiz page loads', async ({ page }) => {
    await page.goto('/quiz', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).not.toBeEmpty();
    // Should not show an error/crash screen
    await expect(page.locator('text=/error|crash|500/i')).not.toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('text=/error|crash|500/i')).not.toBeVisible();
  });

  test('schools page loads', async ({ page }) => {
    await page.goto('/schools', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('text=/error|crash|500/i')).not.toBeVisible();
  });

  test('testimonials page loads', async ({ page }) => {
    await page.goto('/testimonials', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('text=/error|crash|500/i')).not.toBeVisible();
  });

  test('/our-story redirects to /about', async ({ page }) => {
    await page.goto('/our-story', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/about');
    expect(page.url()).toContain('/about');
  });

  test('navigation links resolve', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Find and click a nav link to /about
    const aboutLink = page.locator('a[href="/about"]').first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await page.waitForURL('**/about');
      expect(page.url()).toContain('/about');
    }
  });

  test('chat widget opens', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Look for chat trigger button
    const chatTrigger = page.locator('[data-testid="chat-trigger"], button:has-text("chat"), button:has-text("Chat"), [aria-label*="chat" i]').first();
    if (await chatTrigger.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await chatTrigger.click();
      // Chat container should appear
      await expect(page.locator('[data-testid="chat-container"], [class*="chat"], [role="dialog"]').first()).toBeVisible({ timeout: 5_000 });
    }
  });
});
