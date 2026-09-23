import { expect, test } from '@playwright/test';

const slug = 'carreira-mulheres-negras-fadiga-racial';
const articlePath = `/blog/${slug}`;
const canonical = `https://psicologanataliaferreira.com${articlePath}`;
const seoTitle = 'Fadiga racial e carreira: caminhos para o bem-estar';
const socialTitle = 'Fadiga racial e bem-estar na carreira de mulheres negras';
const socialDescription =
  'Uma reflexão sobre fadiga de batalha racial, carreira e orientação profissional antirracista para mulheres negras.';

const meta = (page, attribute, value) =>
  page.locator(`meta[${attribute}="${value}"]`).getAttribute('content');

test('direct article metadata is complete and stale article tags are removed on navigation', async ({
  page,
}) => {
  await page.goto(articlePath);

  await expect(page).toHaveTitle(seoTitle);
  expect((await page.title()).length).toBeLessThanOrEqual(60);
  expect((await page.title()).match(/Blog Natália Ferreira/gi) ?? []).toHaveLength(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  await expect.poll(() => meta(page, 'property', 'og:title')).toBe(socialTitle);
  await expect.poll(() => meta(page, 'name', 'twitter:title')).toBe(socialTitle);
  await expect.poll(() => meta(page, 'property', 'og:description')).toBe(socialDescription);
  await expect.poll(() => meta(page, 'name', 'twitter:description')).toBe(socialDescription);
  await expect.poll(() => meta(page, 'property', 'og:image:width')).toBe('1024');
  await expect.poll(() => meta(page, 'property', 'og:image:height')).toBe('1536');
  await expect.poll(() => meta(page, 'property', 'og:image:type')).toBe('image/webp');
  await expect
    .poll(() => meta(page, 'property', 'og:image:alt'))
    .toContain('Carreira e Mulheres Negras');
  await expect
    .poll(() => meta(page, 'name', 'twitter:image:alt'))
    .toContain('Carreira e Mulheres Negras');
  await expect(page.locator('meta[property="article:tag"]')).not.toHaveCount(0);
  await expect(page.locator('#json-ld-blog-post')).toHaveCount(1);

  await page.getByRole('link', { name: 'Blog', exact: true }).first().click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page).toHaveTitle('Blog | Psicóloga Natalia Ferreira');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://psicologanataliaferreira.com/blog',
  );
  await expect(page.locator('meta[property="article:tag"]')).toHaveCount(0);
  await expect(page.locator('meta[property="article:published_time"]')).toHaveCount(0);
  await expect(page.locator('meta[property="article:author"]')).toHaveCount(0);
  await expect(page.locator('#json-ld-blog-post')).toHaveCount(0);
  await expect.poll(() => meta(page, 'property', 'og:image:width')).toBe('853');
  await expect.poll(() => meta(page, 'property', 'og:image:height')).toBe('1280');

  await page.getByRole('link', { name: 'Página Inicial' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://psicologanataliaferreira.com/',
  );
  await expect(page.locator('meta[property="article:tag"]')).toHaveCount(0);
  await expect(page.locator('#json-ld-blog-post')).toHaveCount(0);
});

test('article metadata falls back cleanly when optional discovery fields are absent', async ({
  page,
}) => {
  await page.route(`**/assets/content/blog/posts/${slug}.json`, async (route) => {
    const response = await route.fetch();
    const post = await response.json();
    delete post.seoTitle;
    delete post.seoDescription;
    delete post.socialTitle;
    delete post.socialDescription;
    await route.fulfill({ response, json: post });
  });

  await page.goto('/blog');
  await page.locator(`a[href="${articlePath}"]`).first().click();
  await expect(page.locator('article h1')).toBeVisible();

  const title = await page.title();
  expect(title.length).toBeLessThanOrEqual(60);
  expect((title.match(/Blog Natália Ferreira/gi) ?? []).length).toBeLessThanOrEqual(1);
  const editorialTitle = await page.locator('article h1').textContent();
  await expect.poll(() => meta(page, 'property', 'og:title')).toBe(editorialTitle?.trim());
  await expect.poll(() => meta(page, 'name', 'twitter:title')).toBe(editorialTitle?.trim());
  const description = await meta(page, 'name', 'description');
  await expect.poll(() => meta(page, 'property', 'og:description')).toBe(description);
  await expect.poll(() => meta(page, 'name', 'twitter:description')).toBe(description);
});
