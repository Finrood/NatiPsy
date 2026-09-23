import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dockerignore = await readFile(new URL('../.dockerignore', import.meta.url), 'utf8');
const rules = dockerignore
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

test('excludes heavy, generated, and secret-bearing local paths', () => {
  for (const required of [
    '.git',
    'node_modules',
    'dist',
    '.angular',
    'coverage',
    '.env',
    '*.pem',
    '*.key',
  ]) {
    assert.ok(rules.includes(required), `missing .dockerignore rule: ${required}`);
  }
});

test('does not exclude required application source and manifests', () => {
  for (const required of [
    'public',
    'src',
    'package.json',
    'package-lock.json',
    'Dockerfile',
    'nginx.conf',
  ]) {
    assert.equal(rules.includes(required), false, `required build input was excluded: ${required}`);
  }
});
