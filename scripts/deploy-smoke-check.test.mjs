import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSmokeResponse } from './deploy-smoke-check.mjs';

test('rejects a Cloudflare 523 instead of treating the origin as healthy', () => {
  assert.throws(
    () => validateSmokeResponse('/', 523, '<html><title>523 Origin Is Unreachable</title></html>'),
    /returned HTTP 523; expected 200/
  );
});

test('accepts a successful HTML response with the expected marker', () => {
  assert.doesNotThrow(() => validateSmokeResponse('/', 200, '<html><body>ok</body></html>'));
});
