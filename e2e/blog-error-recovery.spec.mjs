import { expect, test } from '@playwright/test';

const articleSlug = 'carreira-mulheres-negras-fadiga-racial';
const articlePath = `/blog/${articleSlug}`;
const postPattern = `**/assets/content/blog/posts/${articleSlug}.json`;

const failures = [
  {
    name: 'offline',
    message: /Não foi possível conectar/,
    respond: (route) => route.abort('internetdisconnected'),
  },
  {
    name: 'malformed JSON',
    message: /Não foi possível ler este conteúdo/,
    respond: (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"privateBackendDetail":',
      }),
  },
  {
    name: '404',
    message: /Não encontramos este conteúdo/,
    respond: (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: '{"privateBackendDetail":"missing"}',
      }),
  },
  {
    name: '500',
    message: /temporariamente indisponível/,
    respond: (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: '{"privateBackendDetail":"database unavailable"}',
      }),
  },
];

function captureApplicationErrors(page) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('BlogService request failed')) {
      errors.push(message.text());
    }
  });
  return errors;
}

async function removeIndexTransferCache(page) {
  await page.route('**/blog', async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    const withoutIndexCache = body.replace(
      /(<script id="ng-state" type="application\/json">)(.*?)(<\/script>)/s,
      (_match, opening, json, closing) => {
        const state = JSON.parse(json);
        for (const key of Object.keys(state)) {
          if (key !== '__nghData__') delete state[key];
        }
        return `${opening}${JSON.stringify(state)}${closing}`;
      },
    );
    await route.fulfill({ response, body: withoutIndexCache });
  });
}

for (const failure of failures) {
  test(`archive maps ${failure.name} once without leaking backend details`, async ({ page }) => {
    const applicationErrors = captureApplicationErrors(page);
    let requestCount = 0;
    await removeIndexTransferCache(page);
    await page.route('**/assets/content/blog/index.json', async (route) => {
      requestCount += 1;
      await failure.respond(route);
    });

    await page.goto('/blog');

    const alert = page.getByRole('alert');
    await expect(alert).toContainText(failure.message);
    await expect(alert).not.toContainText(/privateBackendDetail|database unavailable|missing/);
    expect(requestCount).toBe(1);
    expect(applicationErrors).toHaveLength(1);
    expect(applicationErrors[0]).not.toMatch(/privateBackendDetail|database unavailable|missing/);
  });

  test(`article maps ${failure.name} once without leaking backend details`, async ({ page }) => {
    const applicationErrors = captureApplicationErrors(page);
    let requestCount = 0;
    await page.route(postPattern, async (route) => {
      requestCount += 1;
      await failure.respond(route);
    });

    await page.goto('/blog');
    await page.locator(`a[href="${articlePath}"]`).first().click();

    const alert = page.getByRole('alert');
    await expect(alert).toContainText(failure.message);
    await expect(alert).not.toContainText(/privateBackendDetail|database unavailable|missing/);
    expect(requestCount).toBe(1);
    expect(applicationErrors).toHaveLength(1);
    expect(applicationErrors[0]).not.toMatch(/privateBackendDetail|database unavailable|missing/);
  });
}

test('archive retry succeeds and rapid duplicate clicks start one request', async ({ page }) => {
  const applicationErrors = captureApplicationErrors(page);
  let requestCount = 0;
  await removeIndexTransferCache(page);
  await page.route('**/assets/content/blog/index.json', async (route) => {
    requestCount += 1;
    if (requestCount === 1) {
      await route.fulfill({ status: 500, body: 'private first failure' });
    } else {
      await route.continue();
    }
  });

  await page.goto('/blog');
  const retry = page.getByRole('button', { name: 'Tentar novamente' }).last();
  await expect(retry).toBeVisible();
  await retry.evaluate((button) => {
    button.click();
    button.click();
  });

  await expect(page.locator('article h3')).toBeVisible();
  expect(requestCount).toBe(2);
  expect(applicationErrors).toHaveLength(1);
});

test('article retry succeeds and rapid duplicate clicks start one request', async ({ page }) => {
  const applicationErrors = captureApplicationErrors(page);
  let requestCount = 0;
  await page.route(postPattern, async (route) => {
    requestCount += 1;
    if (requestCount === 1) {
      await route.fulfill({ status: 500, body: 'private first failure' });
    } else {
      await route.continue();
    }
  });

  await page.goto('/blog');
  await page.locator(`a[href="${articlePath}"]`).first().click();
  const retry = page.getByRole('button', { name: 'Tentar novamente' });
  await expect(retry).toBeVisible();
  await retry.evaluate((button) => {
    button.click();
    button.click();
  });

  await expect(page.locator('article h1')).toBeVisible();
  expect(requestCount).toBe(2);
  expect(applicationErrors).toHaveLength(1);
});
