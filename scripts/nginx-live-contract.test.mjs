import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import test from 'node:test';

function dockerAvailable() {
  try {
    execFileSync('docker', ['info'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });
      if (response.status > 0) return;
    } catch {
      // The container can take a few seconds to start.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Nginx did not become ready at ${url}`);
}

function assertSecurityHeaders(response) {
  assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(
    response.headers.get('strict-transport-security'),
    'max-age=31536000; includeSubDomains; preload',
  );
  assert.match(response.headers.get('content-security-policy') || '', /default-src 'self'/);
}

test(
  'exercises the production Nginx routing and header contract',
  async (t) => {
    if (!dockerAvailable()) {
      if (process.env.CI) throw new Error('Docker is required for the live Nginx contract test');
      t.skip('Docker is unavailable locally');
      return;
    }

    const fixture = mkdtempSync(join(tmpdir(), 'natipsy-nginx-'));
    const containerRoot = join(fixture, 'html');
    const config = join(fixture, 'default.conf');
    const securityHeaders = join(fixture, 'security-headers.conf');
    const snippets = join(fixture, 'snippets');
    const containerPort = Number(process.env.NGINX_LIVE_CONTAINER_PORT || 8080);
    const image = process.env.NGINX_LIVE_IMAGE || 'nginx:1.27-alpine';
    const port = await freePort();
    const baseUrl = `http://127.0.0.1:${port}`;
    let containerId;

    try {
      mkdirSync(join(containerRoot, 'blog/entry'), { recursive: true });
      mkdirSync(join(containerRoot, 'blog/category/carreira'), { recursive: true });
      for (const route of ['terapia-online', 'orientacao-profissional', 'contato-e-privacidade']) {
        mkdirSync(join(containerRoot, route), { recursive: true });
        writeFileSync(join(containerRoot, route, 'index.html'), `<main>${route}</main>`);
      }
      mkdirSync(join(containerRoot, '404'), { recursive: true });
      writeFileSync(join(containerRoot, 'index.html'), '<main id="home">home</main>');
      writeFileSync(join(containerRoot, 'blog/index.html'), '<main id="blog">blog</main>');
      writeFileSync(
        join(containerRoot, 'blog/entry/index.html'),
        '<article><h1>entry</h1></article>',
      );
      writeFileSync(
        join(containerRoot, 'blog/category/carreira/index.html'),
        '<main>carreira</main>',
      );
      writeFileSync(join(containerRoot, '404/index.html'), '<h1>Not found</h1>');
      writeFileSync(join(containerRoot, 'app-12345678.js'), 'console.log(1);');
      writeFileSync(config, readFileSync(new URL('../nginx.conf', import.meta.url)));
      const securityHeaderContents = readFileSync(
        new URL('../nginx-security-headers.conf', import.meta.url),
      );
      writeFileSync(securityHeaders, securityHeaderContents);
      mkdirSync(snippets, { recursive: true });
      writeFileSync(join(snippets, 'natipsy-security-headers.conf'), securityHeaderContents);

      containerId = execFileSync(
        'docker',
        [
          'run',
          '--detach',
          '--rm',
          '--publish',
          `127.0.0.1:${port}:${containerPort}`,
          '--volume',
          `${containerRoot}:/usr/share/nginx/html:ro`,
          '--volume',
          `${config}:/etc/nginx/conf.d/default.conf:ro`,
          '--volume',
          `${securityHeaders}:/etc/nginx/security-headers.conf:ro`,
          '--volume',
          `${snippets}:/etc/nginx/snippets:ro`,
          image,
        ],
        { encoding: 'utf8' },
      ).trim();
      await waitForServer(`${baseUrl}/`);

      const root = await fetch(`${baseUrl}/`);
      assert.equal(root.status, 200);
      assertSecurityHeaders(root);
      assert.match(await root.text(), /id="home"/);
      assert.match(root.headers.get('cache-control') || '', /no-cache/);

      const archiveRedirect = await fetch(`${baseUrl}/blog/`, { redirect: 'manual' });
      assert.equal(archiveRedirect.status, 301);
      assert.equal(archiveRedirect.headers.get('location'), '/blog');
      assertSecurityHeaders(archiveRedirect);
      assert.match(archiveRedirect.headers.get('cache-control') || '', /no-cache/);
      const archiveQuery = await fetch(`${baseUrl}/blog/?source=test`, { redirect: 'manual' });
      assert.equal(archiveQuery.headers.get('location'), '/blog?source=test');

      const archive = await fetch(`${baseUrl}/blog`);
      assert.equal(archive.status, 200);
      assert.match(await archive.text(), /id="blog"/);

      const articleRedirect = await fetch(`${baseUrl}/blog/entry/`, { redirect: 'manual' });
      assert.equal(articleRedirect.status, 301);
      assert.equal(articleRedirect.headers.get('location'), '/blog/entry');
      assertSecurityHeaders(articleRedirect);
      const articleQuery = await fetch(`${baseUrl}/blog/entry/?source=test`, {
        redirect: 'manual',
      });
      assert.equal(articleQuery.headers.get('location'), '/blog/entry?source=test');

      const article = await fetch(`${baseUrl}/blog/entry`);
      assert.equal(article.status, 200);
      assert.match(await article.text(), /<h1>entry<\/h1>/);

      for (const route of [
        'terapia-online',
        'orientacao-profissional',
        'contato-e-privacidade',
        'blog/category/carreira',
      ]) {
        const canonical = await fetch(`${baseUrl}/${route}`);
        assert.equal(canonical.status, 200, route);
        const slash = await fetch(`${baseUrl}/${route}/?source=test`, { redirect: 'manual' });
        assert.equal(slash.status, 301, route);
        assert.equal(slash.headers.get('location'), `/${route}?source=test`);
        assertSecurityHeaders(slash);
      }

      const asset = await fetch(`${baseUrl}/app-12345678.js`);
      assert.equal(asset.status, 200);
      assertSecurityHeaders(asset);
      assert.match(asset.headers.get('cache-control') || '', /immutable/);

      const unknown = await fetch(`${baseUrl}/does-not-exist`);
      assert.equal(unknown.status, 404);
      assertSecurityHeaders(unknown);
      assert.equal(unknown.headers.get('x-robots-tag'), 'noindex, nofollow');
      assert.match(await unknown.text(), /Not found/);

      for (const route of ['/404', '/404/']) {
        const response = await fetch(`${baseUrl}${route}`);
        assert.equal(response.status, 404, route);
        assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
        assert.match(await response.text(), /Not found/);
      }

      const malformed = await fetch(`${baseUrl}/blog/%2`);
      assert.ok([400, 404].includes(malformed.status));
    } finally {
      if (containerId) {
        try {
          execFileSync('docker', ['rm', '--force', containerId], { stdio: 'ignore' });
        } catch {
          // The --rm container may already have exited and been removed.
        }
      }
      rmSync(fixture, { recursive: true, force: true });
    }
  },
  { timeout: 120_000 },
);
