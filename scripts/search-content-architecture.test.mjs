import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const read = (relativePath) => readFile(resolve(process.cwd(), relativePath), 'utf8');

const [routes, sitemap, routeConfig, pageTemplate, pageSource, footer, generator] = await Promise.all([
  read('src/routes.txt'),
  read('public/sitemap.xml'),
  read('src/app/app.routes.ts'),
  read('src/app/components/service-page/service-page.component.html'),
  read('src/app/components/service-page/service-page.component.ts'),
  read('src/app/components/footer/footer.component.html'),
  read('src/scripts/generate-blog-index.js')
]);

for (const route of ['/terapia-online', '/orientacao-profissional']) {
  assert.match(routes, new RegExp('^' + route.replace('/', '\\/') + '$', 'm'), route + ' must be in the prerender route list');
  assert.match(sitemap, new RegExp('<loc>https://psicologanataliaferreira\\.com' + route + '</loc>'),
    route + ' must be in the sitemap');
  assert.match(routeConfig, new RegExp("path: '" + route.slice(1) + "'"), route + ' must have an Angular route');
}

assert.equal((pageTemplate.match(/<h1\b/g) ?? []).length, 1, 'service pages must have one H1');
assert.match(pageTemplate, /aria-label="Breadcrumb"/, 'service pages must expose breadcrumbs');
assert.match(pageTemplate, /aria-label="Conteúdos relacionados"/, 'service pages must link to related content');
assert.match(pageSource, /'@type': 'WebPage'/, 'service pages must emit WebPage structured data');
assert.match(pageSource, /'@type': 'BreadcrumbList'/, 'service pages must emit breadcrumb structured data');
assert.match(pageSource, /url: pageUrl/, 'service page canonical metadata must use the route URL');
assert.match(footer, /routerLink="\/terapia-online"/, 'footer must link to the therapy page');
assert.match(footer, /routerLink="\/orientacao-profissional"/, 'footer must link to the career page');
assert.doesNotMatch(pageSource + pageTemplate, /Eficácia Comprovada|cura garantida|garantia de resultado/i,
  'new page copy must not introduce unsupported clinical guarantees');
assert.match(sitemap, /<lastmod>2026-09-12<\/lastmod>/, 'new page dates must be explicit material-review dates');
assert.doesNotMatch(generator, /lastSiteUpdate|new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/,
  'sitemap must not use a changing build date for page freshness');

console.log('Search content architecture contract passed.');
