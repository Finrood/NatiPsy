import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = await readFile(new URL('../.github/workflows/quality.yml', import.meta.url), 'utf8');

test('quality workflow is read-only and cancels superseded runs', () => {
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.match(workflow, /cancel-in-progress: true/);
  assert.match(workflow, /actions\/checkout@v4/);
  assert.match(workflow, /actions\/setup-node@v4/);
});

test('quality workflow protects generation, audit, tests, build, contracts, and Docker', () => {
  for (const command of [
    'npm ci',
    'npm run build:blog-index',
    'git diff --exit-code',
    'npm run audit:security',
    'npm test -- --watch=false',
    'npm run build -- --configuration=production',
    'for contract in scripts/*contract.test.mjs',
    'npm run report:bundle-size',
    'docker build --tag natipsy-quality .',
  ]) {
    assert.match(workflow, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
