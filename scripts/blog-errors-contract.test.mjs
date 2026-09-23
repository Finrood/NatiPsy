import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const service = readFileSync(new URL('../src/app/services/blog.service.ts', import.meta.url), 'utf8');
const list = readFileSync(new URL('../src/app/components/blog-list/blog-list.component.ts', import.meta.url), 'utf8');
const listTemplate = readFileSync(new URL('../src/app/components/blog-list/blog-list.component.html', import.meta.url), 'utf8');
const post = readFileSync(new URL('../src/app/components/blog-post/blog-post.component.ts', import.meta.url), 'utf8');
const postTemplate = readFileSync(new URL('../src/app/components/blog-post/blog-post.component.html', import.meta.url), 'utf8');

assert.match(service, /export type BlogErrorKind = 'not-found' \| 'offline' \| 'server' \| 'invalid-content'/);
assert.match(service, /status === 0/);
assert.match(service, /status >= 500/);
assert.match(service, /BlogService request failed/);
assert.match(service, /shareReplay/);
assert.doesNotMatch(service, /console\.error\([^\n]*error/);
assert.doesNotMatch(service, /Failed to|Please try again later|errorMessage =/);
assert.match(list, /BLOG_ERROR_MESSAGES\[error\.kind\]/);
assert.match(list, /retry\(\): void/);
assert.match(list, /retryCategories\(\): void/);
assert.match(list, /retryingList/);
assert.match(list, /retryingCategories/);
assert.doesNotMatch(list, /err\.message/);
assert.match(listTemplate, /Tentar novamente/);
assert.match(post, /retryable = false/);
assert.match(post, /retryPost\(\): void/);
assert.doesNotMatch(post, /err\.message/);
assert.match(postTemplate, /\(click\)="retryPost\(\)"/);

console.log('Blog error-recovery contract passed.');
