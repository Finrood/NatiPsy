import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../nginx.conf', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404/index.html', import.meta.url), 'utf8');

test('does not use a universal index fallback for unknown routes', () => {
  assert.match(config, /try_files \$uri\/index\.html \$uri @not_found;/);
  assert.doesNotMatch(config, /try_files\s+\$uri\s+\$uri\/\s+\/index\.html;/);
  assert.match(config, /error_page 404 =404 \/404\/index\.html;/);
});

test('keeps canonical no-slash routes and a crawl-safe branded 404', () => {
  assert.match(config, /location = \/blog\/ \{[\s\S]*return 301 \/blog\$is_args\$args;/);
  assert.match(
    config,
    /location ~ \^\/blog\/\(\[\^\/\]\+\)\/\$ \{[\s\S]*return 301 \/blog\/\$1\$is_args\$args;/,
  );
  assert.match(
    config,
    /location ~ \^\/\(terapia-online\|orientacao-profissional\|contato-e-privacidade\|blog\/category\/\[\^\/\]\+\)\/\$/,
  );
  assert.match(config, /location ~ \^\/404\/\?\$ \{[\s\S]*return 404;/);
  assert.match(notFound, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(notFound, /<h1>Página não encontrada<\/h1>/);
});
