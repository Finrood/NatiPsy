import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function captureConsoleErrors(page) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || /hydration|NG0295[25]/i.test(message.text()))
      errors.push(message.text());
  });
  return errors;
}

test('home renders the primary heading and has no serious axe violations', async ({ page }) => {
  const errors = await captureConsoleErrors(page);
  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
  ).toEqual([]);
  expect(errors).toEqual([]);
});

test('mobile navigation opens and returns focus to its trigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Abrir menu principal' });
  await expect(toggle).toBeEnabled();
  await toggle.click();
  await expect(page.getByRole('dialog', { name: 'Menu de navegação' })).toBeVisible();
  await expect(page.locator('#mobile-menu a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
});

test('blog filter state can be cleared without a stale category query', async ({ page }) => {
  await page.goto('/blog');
  const category = page.locator('#category-filter');
  const option = category.locator('option').filter({ hasText: 'Carreira' });
  await expect(option).toHaveCount(1);
  await expect(category).toBeEnabled();
  await category.selectOption({ label: 'Carreira' });
  await expect(page).toHaveURL(/category=Carreira/);
  await category.selectOption('');
  await expect(page).not.toHaveURL(/category=/);
});

test('production server returns real statuses for public and unknown routes', async ({
  request,
}) => {
  expect((await request.get('/')).status()).toBe(200);
  expect((await request.get('/blog')).status()).toBe(200);
  expect((await request.get('/does-not-exist')).status()).toBe(404);
});

test('article direct load and client navigation expose one valid article schema', async ({
  page,
}) => {
  const article = '/blog/carreira-mulheres-negras-fadiga-racial';
  await page.goto(article);
  await expect(page.locator('article h1')).toBeVisible();
  await expect(page.locator('#json-ld-blog-post')).toHaveCount(1);
  const schema = JSON.parse(await page.locator('#json-ld-blog-post').textContent());
  expect(schema['@graph'].some((entity) => entity['@type'] === 'BreadcrumbList')).toBe(true);

  await page.goto('/blog');
  await expect(page.locator('#category-filter')).toBeEnabled();
  const articleLink = page
    .locator('a[href="/blog/carreira-mulheres-negras-fadiga-racial"]')
    .first();
  await expect(articleLink).toHaveAccessibleName(/Mulheres Negras/i);
  await articleLink.click();
  await expect(page.locator('article h1')).toBeVisible();
  await expect(page.locator('#json-ld-blog-post')).toHaveCount(1);
});

test('client route navigation focuses the new page heading and announces it', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('#category-filter')).toBeEnabled();
  await page.locator('a[href="/blog/carreira-mulheres-negras-fadiga-racial"]').first().click();
  await expect(page.locator('article h1')).toBeFocused();
  await expect(page.locator('#route-announcer')).toContainText('Navegação concluída');
});

test('routed pages expose one main landmark', async ({ page }) => {
  for (const route of ['/', '/blog', '/terapia-online', '/contato-e-privacidade']) {
    await page.goto(route);
    await expect(page.locator('main')).toHaveCount(1);
  }
});

test('article table of contents keeps the article route and focuses the target', async ({
  page,
}) => {
  const article = '/blog/carreira-mulheres-negras-fadiga-racial';
  await page.goto(article);
  const toc = page.getByRole('navigation', { name: 'Neste artigo' });
  await expect(toc).toBeVisible();
  const articleOrder = await page.locator('article').evaluate((articleNode) => {
    const heading = articleNode.querySelector('header h1');
    const lead = articleNode.querySelector('header p');
    const image = articleNode.querySelector(':scope > div > img');
    return {
      firstHeaderElement: articleNode.querySelector('header')?.firstElementChild?.tagName,
      lead: lead?.textContent?.trim(),
      headingBeforeLead: Boolean(
        heading?.compareDocumentPosition(lead) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      leadBeforeImage: Boolean(
        lead?.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    };
  });
  expect(articleOrder.firstHeaderElement).toBe('H1');
  expect(articleOrder.lead).toBeTruthy();
  expect(articleOrder.headingBeforeLead && articleOrder.leadBeforeImage).toBe(true);
  const nestedLink = toc.locator('ol > li > ol > li > a').first();
  await expect(nestedLink).toBeVisible();
  await nestedLink.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#[^#]+$/);
  const firstLink = toc.getByRole('link').first();
  const href = await firstLink.getAttribute('href');
  expect(href).toMatch(new RegExp(`${article}#[^#]+$`));
  const targetId = href.split('#')[1];
  await firstLink.click();
  await expect(page).toHaveURL(new RegExp(`${article}#${targetId}$`));
  await expect(page.locator(`#${targetId}`)).toBeFocused();
});
