import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const generator = readFileSync(new URL('../src/scripts/generate-blog-index.js', import.meta.url), 'utf8');
const model = readFileSync(new URL('../src/app/models/blog-post.model.ts', import.meta.url), 'utf8');
const markdown = readFileSync(new URL('../public/assets/content/blog/carreira-mulheres-negras-fadiga-racial.md', import.meta.url), 'utf8');
const card = readFileSync(new URL('../src/app/components/blog-list/blog-list.component.html', import.meta.url), 'utf8');
const post = readFileSync(new URL('../src/app/components/blog-post/blog-post.component.html', import.meta.url), 'utf8');

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

console.log('Taxonomy contract passed.');
