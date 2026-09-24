import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const workflow = await readFile(
  new URL('../.github/workflows/quality.yml', import.meta.url),
  'utf8',
);

test('quality workflow is read-only and cancels superseded runs', () => {
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.match(workflow, /cancel-in-progress: true/);
  assert.match(workflow, /actions\/checkout@v5/);
  assert.match(workflow, /actions\/setup-node@v5/);
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

test('quality workflow builds before discovering every package test script', () => {
  assert.match(workflow, /node-version: 22\.22\.3/);
  assert.match(workflow, /mapfile -t test_scripts/);
  assert.match(workflow, /name\.startsWith\('test:'\)/);
  assert.match(workflow, /RUN_NGINX_HTTP_TESTS=1 npm run "\$script"/);
  assert.ok(
    workflow.indexOf('name: Build production output') <
      workflow.indexOf('name: Run finding contracts'),
  );
});

test('workflows use supported Node 24-based checkout and setup actions', async () => {
  const directory = new URL('../.github/workflows/', import.meta.url);
  for (const filename of await readdir(directory)) {
    if (!filename.endsWith('.yml')) continue;
    const source = await readFile(new URL(filename, directory), 'utf8');
    assert.doesNotMatch(source, /actions\/(?:checkout|setup-node)@v[1-4]\b/);
  }
});
