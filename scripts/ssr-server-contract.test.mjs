import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/server.ts', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');

assert.match(source, /relative\(root, target\)/);
assert.match(source, /PUBLIC_ORIGIN/);
assert.match(source, /app\.disable\('x-powered-by'\)/);
assert.match(source, /app\.set\('trust proxy', false\)/);
assert.match(source, /app\.get\('\/healthz'/);
assert.match(source, /server\.close\(/);
assert.match(readme, /PUBLIC_ORIGIN/);
assert.match(readme, /\/healthz/);

console.log('SSR server hardening contract passed.');
