import { expect, test } from '@playwright/test';

const articlePath = '/blog/carreira-mulheres-negras-fadiga-racial';

test('home preview and archive remain distinct and usable', async ({ page }) => {
  const runtimeErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('app-blog-preview article')).toHaveCount(1);
  expect(await page.locator('app-blog-preview article').count()).toBeLessThanOrEqual(3);
  await expect(page.locator('app-blog-preview #category-filter')).toHaveCount(0);

  await page.goto('/blog');
  await expect(page.locator('h1')).toHaveCount(1);
  const category = page.locator('#category-filter');
  await expect(category).toBeEnabled();
  await category.selectOption({ label: 'Carreira' });
  await expect(page).toHaveURL(/category=Carreira/);
  await category.selectOption('');
  await expect(page).not.toHaveURL(/category=/);

  await page.locator(`a[href="${articlePath}"]`).first().click();
  await expect(page).toHaveURL(articlePath);
  await expect(page.locator('article h1')).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

for (const width of [320, 390]) {
  test(`archive has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/blog');
    await expect(page.locator('#category-filter')).toBeEnabled();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
    }));
    expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
  });
}
