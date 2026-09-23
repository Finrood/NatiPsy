import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = readFileSync(new URL('../src/app/app.routes.ts', import.meta.url), 'utf8');
const component = readFileSync(new URL('../src/app/components/blog-list/blog-list.component.ts', import.meta.url), 'utf8');
const template = readFileSync(new URL('../src/app/components/blog-list/blog-list.component.html', import.meta.url), 'utf8');
const generator = readFileSync(new URL('../src/scripts/generate-blog-index.js', import.meta.url), 'utf8');

assert.match(routes, /path: 'page\/:page'/);
assert.match(generator, /const POSTS_PER_PAGE = 6/);
assert.match(generator, /\/blog\/page\/\$\{index \+ 2\}/);
assert.match(generator, /\/blog\/page\/\$\{page\}/);
assert.match(component, /return page === 1 \? '\/blog' : `\/blog\/page\/\$\{page\}`/);
assert.match(component, /export function paginateItems/);
assert.match(component, /export function paginationWindow/);
assert.match(
  component,
  /robots:\s*\(isCategoryRoute && content\.posts\.length < 2\) \|\| hasAlternateView\s*\? 'noindex,follow'/,
);
assert.match(template, /<a \[routerLink\]="pageUrl\(pageNum\)"/);
assert.doesNotMatch(template, /<button[^>]*onPageChange/);

console.log('Crawlable pagination contract passed.');
