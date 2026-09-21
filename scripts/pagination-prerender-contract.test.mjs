import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const fixtureRoot = await mkdtemp(join(tmpdir(), 'nati-psy-pagination-'));
const node = process.env.PAGINATION_NODE || process.execPath;
const angularCli = join(root, 'node_modules/@angular/cli/bin/ng.js');

const fixturePost = (index) => `---
title: Fixture article ${String(index).padStart(2, '0')}
date: 2025-01-${String(index).padStart(2, '0')}
description: Fixture article ${index} for the pagination contract.
categories:
  - Carreira
---

## Fixture section ${index}

This fixture verifies crawlable pagination.
`;

const copyFilter = (source) => {
  const relative = source.slice(root.length + 1);
  return relative !== '.git' &&
    relative !== 'node_modules' &&
    relative !== 'dist' &&
    relative !== '.angular' &&
    relative !== 'coverage' &&
    !relative.startsWith('.git/') &&
    !relative.startsWith('node_modules/') &&
    !relative.startsWith('dist/') &&
    !relative.startsWith('.angular/') &&
    !relative.startsWith('coverage/');
};

async function request(baseUrl, route) {
  const response = await fetch(`${baseUrl}${route}`);
  return { response, html: await response.text() };
}

let server;
try {
  await cp(root, fixtureRoot, { recursive: true, filter: copyFilter });
  await symlink(join(root, 'node_modules'), join(fixtureRoot, 'node_modules'), 'dir');
  await rm(join(fixtureRoot, 'content/blog'), { recursive: true, force: true });
  await mkdir(join(fixtureRoot, 'content/blog'), { recursive: true });
  await Promise.all(
    Array.from({ length: 14 }, (_, offset) => {
      const index = offset + 1;
      return writeFile(
        join(fixtureRoot, 'content/blog', `fixture-${String(index).padStart(2, '0')}.md`),
        fixturePost(index),
      );
    }),
  );

  await execFileAsync(node, [join(fixtureRoot, 'src/scripts/generate-blog-index.js')], {
    cwd: fixtureRoot,
    env: { ...process.env, BLOG_PROJECT_ROOT: fixtureRoot },
  });

  const routes = await readFile(join(fixtureRoot, 'src/routes.txt'), 'utf8');
  const sitemap = await readFile(join(fixtureRoot, 'public/sitemap.xml'), 'utf8');
  assert.match(routes, /\/blog\/page\/2/);
  assert.match(routes, /\/blog\/page\/3/);
  assert.match(sitemap, /<loc>https:\/\/psicologanataliaferreira\.com\/blog\/page\/2<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/psicologanataliaferreira\.com\/blog\/page\/3<\/loc>/);

  try {
    await execFileAsync(node, [angularCli, 'build', '--configuration=production'], {
      cwd: fixtureRoot,
      env: { ...process.env, NG_CLI_ANALYTICS: 'false' },
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    console.error(error.stdout || '', error.stderr || '');
    throw error;
  }

  const port = 4310 + (process.pid % 1000);
  const { default: app } = await import(
    pathToFileURL(join(fixtureRoot, 'dist/nati-psy/server/server.mjs')).href
  );
  server = app.listen(port);
  const baseUrl = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(500) });
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  const pages = await Promise.all([
    request(baseUrl, '/blog'),
    request(baseUrl, '/blog/page/2'),
    request(baseUrl, '/blog/page/3'),
  ]);
  pages.forEach(({ response, html }, pageIndex) => {
    const rendered = html.split('<script id="ng-state"')[0];
    assert.equal(response.status, 200);
    assert.match(rendered, /<h1[^>]*>Blog<\/h1>/);
    assert.match(rendered, /<link rel="canonical" href="https:\/\/psicologanataliaferreira\.com\/blog/);
    assert.match(rendered, /href="\/blog\/fixture-\d{2}"/);
    if (pageIndex < 2) assert.match(rendered, new RegExp(`href="/blog/page/${pageIndex + 2}(?:#|")`));
    if (pageIndex === 2) assert.doesNotMatch(rendered, /href="\/blog\/page\/4"/);
  });

  const renderedPages = pages.map(({ html }) => html.split('<script id="ng-state"')[0]);
  assert.match(renderedPages[0], /Fixture article (?:0[9]|1[0-4])/);
  assert.doesNotMatch(renderedPages[0], /Fixture article 0[1-8]/);
  assert.match(renderedPages[1], /Fixture article 0[3-8]/);
  assert.doesNotMatch(renderedPages[1], /Fixture article (?:0[12]|0[9]|1[0-4])/);
  assert.match(renderedPages[2], /Fixture article 0[12]/);
  assert.doesNotMatch(renderedPages[2], /Fixture article (?:0[3-9]|1[0-4])/);

  const legacy = await request(baseUrl, '/blog?page=2');
  assert.equal(legacy.response.status, 200);
  assert.match(legacy.html, /<link rel="canonical" href="https:\/\/psicologanataliaferreira\.com\/blog\/page\/2"/);

  for (const invalidPath of ['/blog/page/0', '/blog/page/not-a-number', '/blog/page/4']) {
    const invalid = await request(baseUrl, invalidPath);
    assert.equal(invalid.response.status, 404, invalidPath);
    assert.match(invalid.html, /name="robots" content="[^"]*noindex/);
  }

  const home = await request(baseUrl, '/');
  assert.equal(home.response.status, 200);
  assert.match(home.html, /href="\/blog(?:#|"|\?)/);
} finally {
  server?.close();
  await rm(fixtureRoot, { recursive: true, force: true });
}

console.log('Fixture-driven pagination prerender and HTTP contract passed.');
