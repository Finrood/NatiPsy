import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../src/app/config/site-config.json', import.meta.url), 'utf8'));
const contact = readFileSync(new URL('../src/app/config/contact.ts', import.meta.url), 'utf8');
const generator = readFileSync(new URL('../src/scripts/generate-blog-index.js', import.meta.url), 'utf8');
const server = readFileSync(new URL('../src/server.ts', import.meta.url), 'utf8');
const index = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const llms = readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');

assert.match(config.canonicalOrigin, /^https:\/\/[^/]+$/);
assert.equal(config.locale, 'pt-BR');
assert.ok(config.allowedHosts.includes(new URL(config.canonicalOrigin).hostname));
assert.ok(config.allowedHosts.includes(`www.${new URL(config.canonicalOrigin).hostname}`));
assert.doesNotMatch(JSON.stringify(config), /password|secret|token|privateKey/i);
assert.match(contact, /site-config\.json/);
assert.match(generator, /site-config\.json/);
assert.match(generator, /synchronizeStaticMetadata\(\)/);
assert.match(generator, /generateRobots\(\)/);
assert.match(generator, /generateLlms\(\)/);
assert.match(server, /SITE_CONFIG_ALLOWED_HOSTS/);
assert.match(index, new RegExp(config.canonicalOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(robots, new RegExp(`${config.canonicalOrigin}/sitemap\\.xml`));
assert.match(sitemap, new RegExp(config.canonicalOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(llms, new RegExp(config.canonicalOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

console.log('Central site configuration contract passed.');
