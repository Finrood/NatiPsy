import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findPrivateContent } from './assert-public-content.mjs';

test('finds Markdown sources that would leak into public output', async () => {
  const root = await mkdtemp(join(tmpdir(), 'natipsy-public-content-'));
  await mkdir(join(root, 'assets'), { recursive: true });
  await writeFile(join(root, 'assets', 'draft.md'), '# private');

  assert.equal((await findPrivateContent(root)).length, 1);
});

test('allows generated public formats', async () => {
  const root = await mkdtemp(join(tmpdir(), 'natipsy-public-content-'));
  await writeFile(join(root, 'index.json'), '[]');

  assert.deepEqual(await findPrivateContent(root), []);
});
