import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const read = (relativePath) => readFile(resolve(process.cwd(), relativePath), 'utf8');

const [
  routes,
  sitemap,
  routeConfig,
  pageTemplate,
  pageSource,
  footer,
  generator,
  staticPages,
  trustTemplate,
] = await Promise.all([
  read('src/routes.txt'),
  read('public/sitemap.xml'),
  read('src/app/app.routes.ts'),
  read('src/app/components/service-page/service-page.component.html'),
  read('src/app/components/service-page/service-page.component.ts'),
  read('src/app/components/footer/footer.component.html'),
  read('src/scripts/generate-blog-index.js'),
  read('src/content/static-pages.json'),
  read('src/app/components/trust-contact/trust-contact.component.html'),
]);

for (const route of ['/terapia-online', '/orientacao-profissional']) {
  assert.match(
    routes,
    new RegExp('^' + route.replace('/', '\\/') + '$', 'm'),
    route + ' must be in the prerender route list',
  );
  assert.match(
    sitemap,
    new RegExp('<loc>https://psicologanataliaferreira\\.com' + route + '</loc>'),
    route + ' must be in the sitemap',
  );
  assert.match(
    routeConfig,
    new RegExp("path: '" + route.slice(1) + "'"),
    route + ' must have an Angular route',
  );
}

assert.equal((pageTemplate.match(/<h1\b/g) ?? []).length, 1, 'service pages must have one H1');
assert.match(pageTemplate, /aria-label="Breadcrumb"/, 'service pages must expose breadcrumbs');
assert.match(
  pageTemplate,
  /aria-label="Conteúdos relacionados"/,
  'service pages must link to related content',
);
assert.match(pageSource, /'@type': 'WebPage'/, 'service pages must emit WebPage structured data');
assert.match(
  pageSource,
  /'@type': 'BreadcrumbList'/,
  'service pages must emit breadcrumb structured data',
);
assert.match(pageSource, /url: pageUrl/, 'service page canonical metadata must use the route URL');
assert.match(footer, /routerLink="\/terapia-online"/, 'footer must link to the therapy page');
assert.match(
  footer,
  /routerLink="\/orientacao-profissional"/,
  'footer must link to the career page',
);
assert.match(
  footer,
  /routerLink="\/contato-e-privacidade"/,
  'footer must link to trust and contact information',
);
assert.match(
  pageTemplate,
  /Natalia Ferreira dos Santos · Psicóloga · CRP 12\/19892/,
  'service pages must show the full professional identity',
);
assert.match(
  pageTemplate,
  /não é um canal de emergência/,
  'the service CTA must state the WhatsApp crisis boundary',
);
assert.match(
  pageTemplate,
  /SAMU \(192\).*CVV \(188\)/s,
  'the service CTA must provide official urgent directions',
);
assert.match(
  trustTemplate,
  /Privacidade e escopo/,
  'the linked trust page must explain initial-contact privacy and scope',
);
assert.match(
  trustTemplate,
  /Política editorial/,
  'the linked trust page must state the editorial policy',
);
assert.doesNotMatch(
  pageSource + pageTemplate,
  /Eficácia Comprovada|cura garantida|garantia de resultado/i,
  'new page copy must not introduce unsupported clinical guarantees',
);
const pageRegistry = JSON.parse(staticPages);
for (const route of ['/terapia-online', '/orientacao-profissional', '/contato-e-privacidade']) {
  const page = pageRegistry.find((entry) => entry.path === route);
  assert.ok(page, `${route} must have content-owned sitemap metadata`);
  assert.match(
    page.reviewedAt,
    /^\d{4}-\d{2}-\d{2}$/,
    `${route} must have an explicit reviewedAt date`,
  );
  assert.match(
    sitemap,
    new RegExp(
      `<loc>https://psicologanataliaferreira\\.com${route}<\\/loc>\\s*<lastmod>${page.reviewedAt}<\\/lastmod>`,
    ),
    `${route} sitemap freshness must come from its content review date`,
  );
}
assert.match(
  generator,
  /static-pages\.json/,
  'sitemap generation must consume the content registry',
);
assert.match(generator, /page\.reviewedAt/, 'sitemap lastmod must use reviewedAt');
assert.doesNotMatch(
  generator,
  /lastSiteUpdate|new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/,
  'sitemap must not use a changing build date for page freshness',
);

console.log('Search content architecture contract passed.');
