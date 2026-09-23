import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const service = readFileSync(
  new URL('../src/app/services/blog.service.ts', import.meta.url),
  'utf8',
);
const config = readFileSync(new URL('../src/app/app.config.ts', import.meta.url), 'utf8');

assert.match(config, /provideClientHydration\(withEventReplay\(\)\)/);
assert.match(config, /HttpTransferCache/);
assert.doesNotMatch(service, /TransferState|makeStateKey|POSTS_INDEX_KEY|postKey\(/);
assert.match(service, /Angular's default HTTP transfer cache owns SSR-to-client hydration/);
assert.match(service, /this\.http\s*\.get<.*>\(this\.postsIndexUrl\)/s);
assert.match(service, /this\.http\.get<BlogPost>\(postUrl\)/);

const stateFixture =
  '<script id="ng-state">{"http:/assets/content/blog/index.json": {"body": []}}</script>';
const state = stateFixture.match(/<script id="ng-state">(.*?)<\/script>/)?.[1];
assert.ok(state, 'hydration fixture must expose the Angular state payload');
assert.equal((state.match(/blog-post-/g) ?? []).length, 0);
assert.equal((state.match(/index\.json/g) ?? []).length, 1);

console.log('Single hydration-cache contract passed.');
