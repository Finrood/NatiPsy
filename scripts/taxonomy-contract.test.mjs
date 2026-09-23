import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const generator = readFileSync(
  new URL('../src/scripts/generate-blog-index.js', import.meta.url),
  'utf8',
);
const model = readFileSync(
  new URL('../src/app/models/blog-post.model.ts', import.meta.url),
  'utf8',
);
const markdown = readFileSync(
  new URL('../content/blog/carreira-mulheres-negras-fadiga-racial.md', import.meta.url),
  'utf8',
);
const card = readFileSync(
  new URL('../src/app/components/blog-list/blog-list.component.html', import.meta.url),
  'utf8',
);
const post = readFileSync(
  new URL('../src/app/components/blog-post/blog-post.component.html', import.meta.url),
  'utf8',
);
const archiveComponent = readFileSync(
  new URL('../src/app/components/blog-list/blog-list.component.ts', import.meta.url),
  'utf8',
);
const generatedPost = JSON.parse(
  readFileSync(
    new URL(
      '../public/assets/content/blog/posts/carreira-mulheres-negras-fadiga-racial.json',
      import.meta.url,
    ),
    'utf8',
  ),
);
const routes = readFileSync(new URL('../src/routes.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const feed = readFileSync(new URL('../public/feed.xml', import.meta.url), 'utf8');

assert.match(generator, /const CATEGORY_REGISTRY = new Map/);
assert.match(generator, /slug: 'carreira'/);
assert.match(generator, /description:/);
assert.match(generator, /aliases:/);
assert.match(generator, /between one and three primary categories/);
assert.match(generator, /Duplicate \$\{fieldName\}/);
assert.match(generator, /Duplicate category/);
assert.match(generator, /normalizeKey/);
assert.match(generator, /normalizeTags\(data\.tags, categories\)/);
assert.match(model, /categories: string\[\];/);
assert.match(model, /tags: string\[\];/);
assert.match(model, /categoryDetails: BlogCategory\[\];/);
assert.match(markdown, /categories:\s*\n\s+- Carreira/);
assert.match(markdown, /tags:\s*\n/);
assert.match(markdown, /categories:\s*\n\s+- Carreira\s*\ntags:/);
assert.match(card, /@for \(category of post\.categoryDetails/);
assert.match(card, /routerLink.*blog\/category/);
assert.match(post, /@for \(tag of post\.tags/);
assert.match(post, /routerLink.*blog\/category/);
assert.ok(post.indexOf('<h1') < post.indexOf('post.tags'), 'article tags must follow the title');
assert.match(generator, /blog\/category/);
assert.deepEqual(generatedPost.categories, ['Carreira']);
assert.deepEqual(
  generatedPost.categoryDetails.map(({ label }) => label),
  generatedPost.categories,
);
assert.ok(generatedPost.tags.includes('Mulheres Negras'));
assert.match(routes, /\/blog\/category\/carreira/);
assert.doesNotMatch(
  sitemap,
  /\/blog\/category\/carreira/,
  'a category with one article must stay out of the sitemap',
);
assert.match(archiveComponent, /rawCategorySlug\$ = this\.rawParamMap\$\.pipe/);
assert.match(archiveComponent, /isCategoryRoute && content\.posts\.length < 2/);
for (const label of [...generatedPost.categories, ...generatedPost.tags]) {
  assert.ok(
    feed.includes(`<category>${label}</category>`),
    `${label} should be normalized into RSS`,
  );
}

console.log('Taxonomy contract passed.');
