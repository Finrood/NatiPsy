import assert from 'node:assert/strict';
import fs from 'node:fs';

const index = fs.readFileSync('src/index.html', 'utf8');
const styles = fs.readFileSync('src/styles.css', 'utf8');
const nginx = fs.readFileSync('nginx.conf', 'utf8');

assert.doesNotMatch(index, /fonts\.(?:googleapis|gstatic)\.com/);
assert.match(styles, /montserrat-latin-ext\.woff2/);
assert.match(styles, /montserrat-latin\.woff2/);
assert.match(styles, /font-display:\s*swap/);
assert.match(styles, /unicode-range:[^;]*U\+0100/);
assert.doesNotMatch(nginx, /fonts\.(?:googleapis|gstatic)\.com/);
for (const subset of ['latin', 'latin-ext']) {
  assert.ok(fs.statSync(`public/assets/fonts/montserrat-${subset}.woff2`).size > 1000, `${subset} font should be present`);
}

console.log('Self-hosted font contract passed.');
