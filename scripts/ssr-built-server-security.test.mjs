import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { after, before, test } from 'node:test';

const port = 43000 + Math.floor(Math.random() * 1000);
let server;

function request(path, host) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        headers: { Host: host },
      },
      (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => resolve({ status: response.statusCode, body }));
      },
    );
    req.on('error', reject);
    req.end();
  });
}

before(async () => {
  server = spawn(process.execPath, ['dist/nati-psy/server/server.mjs'], {
    env: {
      ...process.env,
      PORT: String(port),
      PUBLIC_ORIGIN: 'https://psicologanataliaferreira.com',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('SSR server did not start')), 10_000);
    server.once('exit', (code) => reject(new Error(`SSR server exited with ${code}`)));
    server.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('Node Express server listening')) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
});

after(async () => {
  if (!server || server.exitCode !== null) return;
  server.kill('SIGTERM');
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('SSR server did not stop')), 10_000);
    server.once('exit', (code) => {
      clearTimeout(timer);
      assert.equal(code, 0);
      resolve();
    });
  });
});

test('accepts only local, canonical, and approved alias hosts', async () => {
  assert.equal((await request('/does-not-exist', 'psicologanataliaferreira.com')).status, 404);
  assert.equal((await request('/does-not-exist', 'www.psicologanataliaferreira.com')).status, 404);
  assert.equal((await request('/healthz', `127.0.0.1:${port}`)).status, 200);
  assert.equal((await request('/', 'attacker.test')).status, 421);
  assert.equal((await request('/', 'attacker.test:bad')).status, 400);
});

test('rejects ambiguous targets and keeps traversal inside the public root', async () => {
  assert.equal((await request('//attacker.test/path', 'psicologanataliaferreira.com')).status, 400);
  const traversal = await request('/%2e%2e/%2e%2e/etc/passwd', 'psicologanataliaferreira.com');
  assert.notEqual(traversal.status, 200);
  assert.doesNotMatch(traversal.body, /root:x:/);
});
