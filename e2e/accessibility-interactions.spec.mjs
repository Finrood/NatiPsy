import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const articlePath = '/blog/carreira-mulheres-negras-fadiga-racial';

for (const path of ['/blog', articlePath]) {
  test(`${path} has no serious axe or contrast violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
    ).toEqual([]);
  });
}

test('mobile menu has visible keyboard focus and returns it on close', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Abrir menu principal' });
  await expect(toggle).toBeEnabled();
  await toggle.focus();
  await expect(toggle).toBeFocused();
  const focusStyle = await toggle.evaluate((element) => {
    const style = getComputedStyle(element);
    return `${style.outlineStyle} ${style.boxShadow}`;
  });
  expect(focusStyle).not.toBe('none none');
  await page.keyboard.press('Enter');
  await expect(page.locator('#mobile-menu a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
});

test('article network failure is announced without exposing backend details', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('#category-filter')).toBeEnabled();
  await page.route('**/assets/content/blog/posts/*.json', (route) =>
    route.abort('internetdisconnected'),
  );
  await page.locator(`a[href="${articlePath}"]`).first().click();
  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(/erro|carregar|encontrado/i);
  await expect(alert).not.toContainText(/internetdisconnected|stack|exception/i);
});

test('reduced motion preference suppresses loading animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/blog');
  await expect(page.locator('#category-filter')).toBeEnabled();
  await page.route('**/assets/content/blog/posts/*.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.locator(`a[href="${articlePath}"]`).first().click();
  const status = page.getByRole('status');
  await expect(status).toBeVisible();
  const duration = await status
    .locator('.animate-spin')
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).animationDuration));
  expect(duration).toBeLessThanOrEqual(0.01);
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );
});
