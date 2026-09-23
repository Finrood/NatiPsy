import { expect, test } from '@playwright/test';

const pages = [
  {
    path: '/terapia-online',
    heading: 'Terapia Online',
    title: 'Terapia Online | Natalia Ferreira Psicóloga',
    schemaId: 'json-ld-service-page-therapyOnline',
  },
  {
    path: '/orientacao-profissional',
    heading: 'Orientação Profissional e de Carreira',
    title: 'Orientação Profissional e de Carreira | Natalia Ferreira',
    schemaId: 'json-ld-service-page-careerGuidance',
  },
];

for (const service of pages) {
  test(`${service.path} renders one canonical H1 and valid structured data`, async ({ page }) => {
    await page.goto(service.path);

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(service.heading);
    await expect(page).toHaveTitle(service.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://psicologanataliaferreira.com${service.path}`,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Natalia Ferreira/,
    );
    await expect(
      page.getByText('Natalia Ferreira dos Santos · Psicóloga · CRP 12/19892'),
    ).toBeVisible();
    await expect(
      page.getByText(/WhatsApp é usado para contato inicial.*não é um canal de emergência/),
    ).toBeVisible();
    await expect(page.getByText(/SAMU \(192\).*CVV \(188\)/)).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Como funciona o contato e a privacidade' }),
    ).toHaveAttribute('href', '/contato-e-privacidade');

    const schemas = await page
      .locator(`#${service.schemaId}`)
      .evaluate((script) => JSON.parse(script.textContent));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['WebPage', 'BreadcrumbList']);
    expect(schemas[0].url).toBe(`https://psicologanataliaferreira.com${service.path}`);
  });

  for (const width of [320, 390]) {
    test(`${service.path} stays usable without horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(service.path);

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.getByRole('link', { name: /conversa|WhatsApp/i }).first()).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
      expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport);
    });
  }
}

test('trust page explains contact privacy and editorial accountability', async ({ page }) => {
  await page.goto('/contato-e-privacidade');

  await expect(page.locator('h1')).toHaveText('Contato, privacidade e conteúdo');
  await expect(
    page.getByText('Natalia Ferreira dos Santos · Psicóloga · CRP 12/19892'),
  ).toBeVisible();
  await expect(page.getByText(/não é um canal de emergência/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Privacidade e escopo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Política editorial' })).toBeVisible();
  await expect(page.getByText(/autoria.*data de publicação.*data de revisão/i)).toBeVisible();
});
