import { expect, test } from '@playwright/test';

test('archive controls cannot lose an early choice while the client bundle is delayed', async ({
  page,
}) => {
  let releaseBundle;
  const bundleGate = new Promise((resolve) => {
    releaseBundle = resolve;
  });
  await page.route('**/main-*.js', async (route) => {
    await bundleGate;
    await route.continue();
  });

  try {
    await page.goto('/blog', { waitUntil: 'commit' });
    const category = page.getByLabel('Filtrar por Categoria:');
    await expect(category).toBeVisible();
    await expect(category).toBeDisabled();
    await expect(page.locator('article h3 a').first()).toHaveAttribute(
      'href',
      '/blog/carreira-mulheres-negras-fadiga-racial',
    );

    releaseBundle();
    await expect(category).toBeEnabled();
    await category.selectOption({ label: 'Carreira' });
    await expect(page).toHaveURL(/category=Carreira/);
    await expect(category).toHaveValue('Carreira');
  } finally {
    releaseBundle();
  }
});

test('article links remain native navigation without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/blog');
    await page.locator('article h3 a').first().click();
    await expect(page).toHaveURL(/\/blog\/carreira-mulheres-negras-fadiga-racial$/);
    await expect(page.locator('article h1')).toBeVisible();
  } finally {
    await context.close();
  }
});

test('mobile menu becomes interactive only after hydration', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let releaseBundle;
  const bundleGate = new Promise((resolve) => {
    releaseBundle = resolve;
  });
  await page.route('**/main-*.js', async (route) => {
    await bundleGate;
    await route.continue();
  });

  try {
    await page.goto('/', { waitUntil: 'commit' });
    const toggle = page.getByRole('button', { name: 'Abrir menu principal' });
    await expect(toggle).toBeVisible();
    await expect(toggle).toBeDisabled();

    releaseBundle();
    await expect(toggle).toBeEnabled();
    await toggle.click();
    await expect(page.getByRole('dialog', { name: 'Menu de navegação' })).toBeVisible();
  } finally {
    releaseBundle();
  }
});
