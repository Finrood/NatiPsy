import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRobots } from './robots-smoke-check.mjs';

test('accepts the repository crawler policy and canonical sitemap', () => {
  assert.doesNotThrow(() => validateRobots([
    'User-agent: *',
    'Allow: /',
    'Disallow: /404',
    'Sitemap: https://psicologanataliaferreira.com/sitemap.xml',
  ].join('\n')));
});

test('rejects an edge policy that omits the sitemap directive', () => {
  assert.throws(
    () => validateRobots('User-agent: *\nAllow: /\nDisallow: /404\n'),
    /exactly one Sitemap/
  );
});

test('rejects duplicate canonical directives', () => {
  assert.throws(
    () => validateRobots([
      'User-agent: *',
      'Allow: /',
      'Disallow: /404',
      'Sitemap: https://psicologanataliaferreira.com/sitemap.xml',
      'Sitemap: https://psicologanataliaferreira.com/sitemap.xml',
    ].join('\n')),
    /exactly one Sitemap/,
  );
});
