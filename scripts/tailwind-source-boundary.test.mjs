import assert from 'node:assert/strict';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';

const stylesheetPath = resolve(process.cwd(), 'src/styles.css');
const appProbePath = resolve(process.cwd(), 'src/app/tailwind-source-probe.html');
const docsProbePath = '/tmp/natipsy-tailwind-doc-probe.md';
const probeClass = 'bg-fuchsia-950';

const compileStyles = async () => {
  const css = await readFile(stylesheetPath, 'utf8');
  const result = await postcss([tailwindcss()]).process(css, { from: stylesheetPath });
  return result.css;
};

const baseline = await compileStyles();
assert.doesNotMatch(baseline, /fuchsia-950/, 'the probe utility must not already be present');

try {
  await writeFile(docsProbePath, '<div class="' + probeClass + '"></div>\n');
  const withDocumentationProbe = await compileStyles();
  assert.equal(withDocumentationProbe, baseline,
    'a utility token in a documentation fixture must not change production CSS');

  await writeFile(appProbePath, '<div class="' + probeClass + '"></div>\n');
  const withApplicationProbe = await compileStyles();
  assert.notEqual(withApplicationProbe, baseline,
    'a utility token in an application template must change production CSS');
  assert.match(withApplicationProbe, /\.bg-fuchsia-950/,
    'the application probe utility must be emitted into production CSS');
} finally {
  await unlink(docsProbePath).catch(() => {});
  await unlink(appProbePath).catch(() => {});
}

console.log('Tailwind source boundary contract passed.');
