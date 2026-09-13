import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const generator = readFileSync(new URL('../src/scripts/generate-blog-index.js', import.meta.url), 'utf8');
const index = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
const feed = readFileSync(new URL('../public/feed.xml', import.meta.url), 'utf8');

assert.match(generator, /const feedPath/);
assert.match(generator, /posts\.slice\(0, 20\)/);
assert.match(generator, /data\.draft === true/);
assert.match(generator, /guid isPermaLink/);
assert.match(generator, /escapeXml\(post\.description\)/);
assert.match(generator, /atom:link/);
assert.match(index, /rel="alternate" type="application\/rss\+xml"/);
assert.match(feed, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
assert.match(feed, /<rss version="2\.0"/);
assert.match(feed, /<atom:link href="https:\/\/psicologanataliaferreira\.com\/feed\.xml" rel="self" type="application\/rss\+xml" \/>/);
assert.match(feed, /<guid isPermaLink="true">https:\/\/psicologanataliaferreira\.com\/blog\//);
assert.match(feed, /<description>.*<\/description>/s);
assert.equal((feed.match(/<item>/g) ?? []).length, 1);
assert.equal((feed.match(/<guid /g) ?? []).length, 1);

console.log('RSS feed contract passed.');
