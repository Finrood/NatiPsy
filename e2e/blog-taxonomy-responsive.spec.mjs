import { expect, test } from '@playwright/test';

const slug = 'carreira-mulheres-negras-fadiga-racial';

async function expectNoHorizontalOverflow(page) {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      })),
    )
    .toMatchObject({
      viewport: page.viewportSize().width,
      document: page.viewportSize().width,
      body: page.viewportSize().width,
    });
}

for (const width of [320, 390]) {
  test(`taxonomy remains bounded and usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/blog');

    await expect(page.getByLabel('Filtrar por Categoria:')).toBeVisible();
    const categoryLink = page.locator('article a[href="/blog/category/carreira"]');
    await expect(categoryLink).toHaveText('Carreira');
    await expectNoHorizontalOverflow(page);

    await page.locator(`article h3 a[href="/blog/${slug}"]`).click();
    await expect(page.locator('article h1')).toBeVisible();
    const topics = page.getByLabel('Temas do artigo');
    await expect(topics).toBeVisible();
    await expect(topics.locator('span')).toHaveCount(7);
    await expectNoHorizontalOverflow(page);

    const positions = await page.evaluate(() => {
      const heading = document.querySelector('article h1');
      const tags = document.querySelector('[aria-label="Temas do artigo"]');
      return {
        heading: heading?.getBoundingClientRect().top,
        tags: tags?.getBoundingClientRect().top,
      };
    });
    expect(positions.tags).toBeGreaterThan(positions.heading);
  });
}

test('sparse category pages are crawlable links with a self-canonical noindex policy', async ({ page }) => {
  await page.goto('/blog/category/carreira');

  await expect(page.locator('article h3')).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex,follow',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://psicologanataliaferreira.com/blog/category/carreira',
  );
});

test('visible taxonomy, generated JSON, and JSON-LD share one normalized source', async ({ page }) => {
  await page.goto(`/blog/${slug}`);
  await expect(page.locator('article h1')).toBeVisible();

  const visibleCategories = await page
    .locator('article header a[href^="/blog/category/"]')
    .allTextContents();
  const visibleTags = (await page.getByLabel('Temas do artigo').locator('span').allTextContents())
    .map((label) => label.trim().replace(/^#/, ''));
  const generated = await page.evaluate(async (postSlug) => {
    const response = await fetch(`/assets/content/blog/posts/${postSlug}.json`);
    return response.json();
  }, slug);
  const schema = await page.locator('#json-ld-blog-post').evaluate(
    (script) => JSON.parse(script.textContent)['@graph'][0],
  );

  expect(visibleCategories.map((label) => label.trim())).toEqual(generated.categories);
  expect(visibleTags).toEqual(generated.tags);
  expect(schema.keywords.split(', ')).toEqual([
    ...generated.categories,
    ...generated.tags,
  ]);
});

test('client-side category changes update cards, filter, metadata, and back navigation', async ({ page }) => {
  const indexResponse = await page.request.get('/assets/content/blog/index.json');
  expect(indexResponse.ok()).toBe(true);
  const [careerPost] = await indexResponse.json();
  const psychology = {
    slug: 'psicologia',
    label: 'Psicologia',
    description: 'Conteúdos sobre saúde mental, relações e desenvolvimento pessoal.',
  };
  const psychologyPosts = [1, 2].map((number) => ({
    ...careerPost,
    slug: `psychology-fixture-${number}`,
    title: `Artigo de psicologia ${number}`,
    categories: ['Psicologia'],
    categoryDetails: [psychology],
    image: null,
  }));

  await page.route('**/blog/category/**', async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /(<script id="ng-state" type="application\/json">)(.*?)(<\/script>)/s,
      (_match, opening, json, closing) => {
        const state = JSON.parse(json);
        for (const key of Object.keys(state)) {
          if (key !== '__nghData__') delete state[key];
        }
        return `${opening}${JSON.stringify(state)}${closing}`;
      },
    );
    await route.fulfill({ response, body });
  });
  await page.route('**/assets/content/blog/index.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([careerPost, ...psychologyPosts]) }),
  );

  await page.goto('/blog/category/carreira');
  await expect(page.locator('article h3')).toHaveCount(1);
  await expect(page.getByLabel('Filtrar por Categoria:')).toHaveValue('Carreira');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://psicologanataliaferreira.com/blog/category/carreira',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
  await page.evaluate(() => { window.__taxonomyRouteMarker = 'same-document'; });

  await page.getByLabel('Filtrar por Categoria:').selectOption('Psicologia');
  await expect(page).toHaveURL(/\/blog\/category\/psicologia$/);
  await expect(page.locator('article h3')).toHaveCount(2);
  await expect(page.locator('article h3').first()).toContainText('Artigo de psicologia');
  await expect(page.getByLabel('Filtrar por Categoria:')).toHaveValue('Psicologia');
  await expect(page).toHaveTitle(/Psicologia \| Blog/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://psicologanataliaferreira.com/blog/category/psicologia',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.__taxonomyRouteMarker)).toBe('same-document');

  await page.goBack();
  await expect(page).toHaveURL(/\/blog\/category\/carreira$/);
  await expect(page.locator('article h3')).toHaveCount(1);
  await expect(page.getByLabel('Filtrar por Categoria:')).toHaveValue('Carreira');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://psicologanataliaferreira.com/blog/category/carreira',
  );
  expect(await page.evaluate(() => window.__taxonomyRouteMarker)).toBe('same-document');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
});
