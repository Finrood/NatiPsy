import { test, expect } from '@playwright/test';

const article = '/blog/carreira-mulheres-negras-fadiga-racial';

test('direct article load renders under delayed article data', async ({ page }) => {
  await page.route('**/assets/content/blog/posts/*.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.continue();
  });
  await page.goto(article);
  await expect(page.locator('article h1')).toBeVisible();
  await expect(page.locator('#json-ld-blog-post')).toHaveCount(1);
});

test('first client article navigation renders under delayed lazy chunks', async ({ page }) => {
  await page.goto('/blog');
  await page.route('**/*.js', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.continue();
  });
  await page.getByRole('link', { name: /Leia mais/ }).first().click();
  await expect(page.locator('article h1')).toBeVisible();
  await expect(page.locator('#json-ld-blog-post')).toHaveCount(1);
});
