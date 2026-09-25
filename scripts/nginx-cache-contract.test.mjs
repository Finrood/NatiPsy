import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const nginx = readFileSync(new URL('../nginx.conf', import.meta.url), 'utf8');
const server = readFileSync(new URL('../src/server.ts', import.meta.url), 'utf8');

const nginxHashedLocation = 'location ~* "-[A-Za-z0-9_-]{8}\\.(?:js|css)$"';
const oldNginxHashedLocation = 'location ~* "-[A-Za-z0-9]{8}\\.(?:js|css)$"';
const serverHashedPattern = 'const HASHED_ASSET = /-[A-Za-z0-9_-]{8}(\\.[cm]?js|\\.css)$/;';

assert.ok(nginx.includes(nginxHashedLocation), 'Nginx must accept URL-safe 8-character hashes');
assert.ok(
  !nginx.includes(oldNginxHashedLocation),
  'Nginx must not retain the alphanumeric-only hash',
);
assert.ok(
  server.includes(serverHashedPattern),
  'Express and Nginx must share the same hash grammar',
);

const hashedAsset = /-[A-Za-z0-9_-]{8}\.(?:js|css)$/;
const validBundles = ['/main-ABCDEFGH.js', '/chunk-CkMi-9d3.js', '/styles-AB_CD123.css'];
const nearMisses = [
  '/main-ABCDEFG.js',
  '/main-ABCDEFGHI.js',
  '/main-AB.CDEFG.js',
  '/main-ABCDEFGH.js.map',
  '/main-ABCDEFGH.json',
];

for (const file of validBundles) {
  assert.match(file, hashedAsset, `${file} should receive immutable caching`);
}
for (const file of nearMisses) {
  assert.doesNotMatch(file, hashedAsset, `${file} should not receive immutable caching`);
}

const cachePolicies = nginx.match(/add_header Cache-Control/g) ?? [];
assert.equal(
  cachePolicies.length,
  11,
  'Nginx should declare one Cache-Control policy for each cache-controlled location',
);
assert.equal(
  (nginx.match(/^\s*expires\b/gm) ?? []).length,
  0,
  'Nginx should not emit an extra Expires-derived cache policy',
);
assert.match(nginx, /add_header Cache-Control "no-cache, must-revalidate"(?: always)?;/);
assert.match(nginx, /add_header Cache-Control "public, max-age=31536000, immutable";/);
assert.match(nginx, /add_header Cache-Control "public, max-age=604800, must-revalidate";/);

assert.match(server, /public, max-age=31536000, immutable/);
assert.match(server, /public, max-age=3600/);
assert.match(server, /public, max-age=604800/);

console.log('Nginx/Express cache contract passed.');
