import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = process.cwd();
const fixtureDirectory = await mkdtemp(join(root, 'src', '.lint-format-fixture-'));
const eslint = resolve(root, 'node_modules/.bin/eslint');
const prettier = resolve(root, 'node_modules/.bin/prettier');

const assertFails = (command, args, message) => {
  assert.throws(() => execFileSync(command, args, { cwd: root, stdio: 'pipe' }), message);
};

try {
  const invalidTypeScript = join(fixtureDirectory, 'unused.ts');
  const invalidTemplate = join(fixtureDirectory, 'click.html');
  const invalidMarkdown = join(fixtureDirectory, 'article.md');
  const invalidStyle = join(fixtureDirectory, 'style.css');

  await writeFile(invalidTypeScript, 'const unused = 1;\n');
  await writeFile(invalidTemplate, '<button (click)="noop()">Click</button>\n');
  await writeFile(invalidMarkdown, '# Heading\n\n-   badly spaced\n');
  await writeFile(invalidStyle, '.fixture{color:red}\n');

  assertFails(
    eslint,
    ['--max-warnings=0', invalidTypeScript, invalidTemplate],
    'invalid TypeScript and template fixtures must fail ESLint',
  );
  assertFails(
    prettier,
    ['--check', invalidTypeScript, invalidTemplate, invalidStyle, invalidMarkdown],
    'invalid TypeScript, template, style, and Markdown fixtures must fail formatting',
  );
} finally {
  await rm(fixtureDirectory, { recursive: true, force: true });
}

console.log('Lint and format failure fixtures passed.');
