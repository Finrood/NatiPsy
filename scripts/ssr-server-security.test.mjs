import assert from 'node:assert/strict';
import { test } from 'node:test';

const serverModule = await import('../dist/nati-psy/server/server.mjs');
const { buildRenderUrl, isProtocolRelativeRequest, validatePublicOrigin } = serverModule;

test('rejects origins that are not exact public origins', () => {
  assert.equal(validatePublicOrigin('https://example.test').origin, 'https://example.test');
  for (const value of [
    'https://user:pass@example.test',
    'https://example.test/path',
    'https://example.test?query=1',
    'https://example.test#fragment',
  ]) {
    assert.throws(() => validatePublicOrigin(value), /PUBLIC_ORIGIN/);
  }
});

test('does not let protocol-relative request targets replace the public origin', () => {
  const origin = new URL('https://example.test');
  assert.equal(isProtocolRelativeRequest('//attacker.test/path'), true);
  assert.equal(isProtocolRelativeRequest('/blog'), false);
  assert.equal(buildRenderUrl(origin, '/blog?x=1'), 'https://example.test/blog?x=1');
  assert.throws(() => buildRenderUrl(origin, '//attacker.test/path'), /absolute-path/);
  assert.throws(() => buildRenderUrl(origin, 'https://attacker.test/path'), /absolute-path/);
});
