import assert from 'node:assert/strict';
import { test } from 'node:test';

const serverModule = await import('../dist/nati-psy/server/server.mjs');
const { buildRenderUrl, isProtocolRelativeRequest, normalizeHostHeader, validatePublicOrigin } =
  serverModule;

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

test('normalizes valid host headers and rejects ambiguous forms', () => {
  assert.equal(normalizeHostHeader('Example.TEST:443'), 'example.test');
  assert.equal(normalizeHostHeader('example.test.'), 'example.test');
  assert.equal(normalizeHostHeader('[::1]:4000'), '::1');
  for (const value of [
    undefined,
    '',
    'bad host',
    'example.test/path',
    'user@example.test',
    'example.test:bad',
  ]) {
    assert.equal(normalizeHostHeader(value), null);
  }
});
