import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const config = JSON.parse(
  await readFile(new URL('../src/app/config/site-config.json', import.meta.url), 'utf8'),
);
const homepage = await readFile(
  new URL('../dist/nati-psy/browser/index.html', import.meta.url),
  'utf8',
);
const escapedOrigin = config.canonicalOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapedBrand = config.brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

assert.match(homepage, new RegExp(`<title>[^<]*${escapedBrand}[^<]*</title>`));
assert.match(homepage, new RegExp(`<link rel="canonical" href="${escapedOrigin}/">`));
assert.match(homepage, new RegExp(`<meta property="og:image" content="${escapedOrigin}`));

const serverModule = await import(
  pathToFileURL(new URL('../dist/nati-psy/server/server.mjs', import.meta.url).pathname).href
);
const server = serverModule.default.listen(0, '127.0.0.1');

try {
  await once(server, 'listening');
  const address = server.address();
  assert.equal(typeof address, 'object');
  const canonicalHost = new URL(config.canonicalOrigin).host;
  const request = (host) =>
    fetch(`http://127.0.0.1:${address.port}/runtime-host-check`, {
      headers: { host },
    });

  const canonical = await request(canonicalHost);
  assert.equal(canonical.status, 404, 'canonical host should reach Angular routing');

  const untrusted = await request('attacker.example');
  assert.ok(untrusted.status >= 400, 'an untrusted SSR host must be rejected');
} finally {
  server.close();
  await once(server, 'close');
}

console.log('Built site configuration and SSR host contract passed.');
