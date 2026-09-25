import assert from 'node:assert/strict';
import fs from 'node:fs';

const config = fs.readFileSync('nginx.conf', 'utf8');
const headers = fs.readFileSync('nginx-security-headers.conf', 'utf8');
const dockerfile = fs.readFileSync('Dockerfile', 'utf8');

assert.equal(
  (config.match(/include \/etc\/nginx\/snippets\/natipsy-security-headers\.conf;/g) || []).length,
  4,
);
assert.match(
  config,
  /location = \/50x\.html[\s\S]*include \/etc\/nginx\/snippets\/natipsy-security-headers\.conf;/,
);
assert.match(
  dockerfile,
  /COPY nginx-security-headers\.conf \/etc\/nginx\/snippets\/natipsy-security-headers\.conf/,
);
assert.match(config, /server_tokens off/);
assert.match(headers, /object-src 'none'/);
assert.match(headers, /base-uri 'self'/);
assert.doesNotMatch(headers, /fonts\.(?:googleapis|gstatic)\.com/);
assert.match(headers, /form-action 'self'/);
assert.match(headers, /frame-ancestors 'self'/);
assert.match(headers, /Permissions-Policy/);
assert.match(headers, /connect-src 'self';/);
assert.match(headers, /script-src[^;]*https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js/);
assert.match(
  headers,
  /script-src[^;]*https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js\//,
);
assert.doesNotMatch(
  headers,
  /script-src[^;]*https:\/\/(?!static\.cloudflareinsights\.com\/beacon\.min\.js(?:\/|\s|;))/,
);
assert.doesNotMatch(headers, /connect-src[^;]*https:/);
assert.doesNotMatch(headers, /img-src[^;]*\shttps:/);

console.log('Nginx security-header contract passed.');
