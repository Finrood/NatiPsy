import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const config = fs.readFileSync('eslint.config.mjs', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const prettier = JSON.parse(fs.readFileSync('.prettierrc.json', 'utf8'));

assert.match(config, /extract-inline-html/);
assert.match(config, /click-events-have-key-events/);
assert.match(config, /interactive-supports-focus/);
assert.equal(packageJson.scripts.lint, 'eslint . --max-warnings=0');
assert.equal(packageJson.scripts['lint:fix'], 'eslint . --fix --max-warnings=0');
const check = packageJson.scripts['format:check'];
const write = packageJson.scripts.format;
assert.equal(write, check.replace(' --check ', ' --write '));
for (const target of [
  'src/**/*.{ts,html,css}',
  'scripts/**/*.mjs',
  'e2e/**/*.mjs',
  'README.md',
  'content/blog/**/*.md',
  'public/assets/fonts/**/*.md',
]) {
  assert.ok(check.includes(target), `Missing format target: ${target}`);
}
assert.match(fs.readFileSync('.prettierignore', 'utf8'), /PROJECT_IMPROVEMENTS\.md/);
assert.match(fs.readFileSync('.gitignore', 'utf8'), /^\*\.iml$/m);
assert.equal(execFileSync('git', ['ls-files', '*.iml'], { encoding: 'utf8' }).trim(), '');
assert.equal(prettier.singleQuote, true);
assert.equal(prettier.overrides[0].options.parser, 'angular');

console.log('Lint and format contract passed.');
