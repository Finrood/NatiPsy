import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = process.env.RENDER_OUTPUT || 'dist/nati-psy/browser';
const home = await readFile(`${root}/index.html`, 'utf8');
const article = await readFile(`${root}/blog/carreira-mulheres-negras-fadiga-racial/index.html`, 'utf8');

function statePayload(html) {
  const match = html.match(/<script id="ng-state"[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(match, 'SSR output must include Angular transfer state');
  return match[1];
}

const homeState = statePayload(home);
const articleState = statePayload(article);
const indexUrl = /assets(?:\/|\\u002F)content(?:\/|\\u002F)blog(?:\/|\\u002F)index\.json/g;
const postUrl = /assets(?:\/|\\u002F)content(?:\/|\\u002F)blog(?:\/|\\u002F)posts(?:\/|\\u002F)carreira-mulheres-negras-fadiga-racial\.json/g;
assert.equal((homeState.match(indexUrl) ?? []).length, 1);
assert.equal((articleState.match(indexUrl) ?? []).length, 1);
assert.equal((articleState.match(postUrl) ?? []).length, 1);
assert.doesNotMatch(`${homeState}${articleState}`, /blog-post-/);
assert.match(article, /<article[\s\S]*<h1/);
assert.equal((article.match(/id="json-ld-blog-post-/g) ?? []).length, 1);

console.log('Rendered SSR hydration contract passed.');
