import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const generator = readFileSync(new URL('../src/scripts/generate-blog-index.js', import.meta.url), 'utf8');
const model = readFileSync(new URL('../src/app/models/blog-post.model.ts', import.meta.url), 'utf8');
const template = readFileSync(new URL('../src/app/components/blog-post/blog-post.component.html', import.meta.url), 'utf8');
const component = readFileSync(new URL('../src/app/components/blog-post/blog-post.component.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/app/components/blog-post/blog-post.component.css', import.meta.url), 'utf8');

assert.match(generator, /function slugifyHeading\(text, usedIds\)/);
assert.match(generator, /normalize\('NFD'\)/);
assert.match(generator, /headings\.push\(\{ id, text, level: depth \}\)/);
assert.match(generator, /id="\$\{id\}"/);
assert.match(model, /export interface BlogHeading/);
assert.match(model, /headings\?: BlogHeading\[\]/);
assert.match(template, /<nav aria-label="Neste artigo"/);
assert.match(template, /post\.headings\.length >= 2/);
assert.match(template, /\[href\]="'#' \+ heading\.id"/);
assert.match(template, /<h1 tabindex="-1"/);
assert.match(template, /class="breadcrumb-title" \[title\]="post\.title"/);
assert.match(component, /MutationObserver/);
assert.match(component, /scrollIntoView\(\{ behavior: 'auto', block: 'start' \}\)/);
assert.match(component, /window\.addEventListener\('hashchange'/);
assert.match(styles, /scroll-margin-top: 6rem/);

console.log('Article reading structure contract passed.');
