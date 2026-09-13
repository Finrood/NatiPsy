import assert from 'node:assert/strict';
import fs from 'node:fs';

const config = fs.readFileSync('eslint.config.mjs', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const prettier = JSON.parse(fs.readFileSync('.prettierrc.json', 'utf8'));

assert.match(config, /extract-inline-html/);
assert.match(config, /click-events-have-key-events/);
assert.match(config, /interactive-supports-focus/);
assert.equal(packageJson.scripts.lint, 'eslint .');
assert.equal(
  packageJson.scripts['format:check'],
  'prettier --check eslint.config.mjs scripts/**/*.mjs .prettierrc.json',
);
assert.equal(prettier.singleQuote, true);
assert.equal(prettier.overrides[0].options.parser, 'angular');

console.log('Lint and format contract passed.');
