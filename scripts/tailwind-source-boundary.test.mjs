import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';

const sourceStylesheet = resolve(process.cwd(), 'src/styles.css');
const probeClass = 'bg-fuchsia-950';
const tempProject = await mkdtemp(join(tmpdir(), 'natipsy-tailwind-project-'));
const stylesheetPath = join(tempProject, 'src', 'styles.css');
const appProbePath = join(tempProject, 'src', 'app', 'tailwind-source-probe.html');
const docsProbePath = join(tempProject, 'docs', 'tailwind-source-probe.md');

await mkdir(dirname(stylesheetPath), { recursive: true });
await mkdir(dirname(appProbePath), { recursive: true });
await mkdir(dirname(docsProbePath), { recursive: true });
await copyFile(sourceStylesheet, stylesheetPath);
await symlink(
  resolve(process.cwd(), 'node_modules'),
  join(tempProject, 'node_modules'),
  'junction',
);

const compileStyles = async () => {
  const css = await readFile(stylesheetPath, 'utf8');
  const result = await postcss([tailwindcss()]).process(css, { from: stylesheetPath });
  return result.css;
};

const fingerprint = (css) => ({
  bytes: Buffer.byteLength(css),
  sha256: createHash('sha256').update(css).digest('hex'),
});

try {
  const baseline = await compileStyles();
  assert.doesNotMatch(baseline, /fuchsia-950/, 'the probe utility must not already be present');

  await writeFile(docsProbePath, `<div class="${probeClass}"></div>\n`);
  const withDocumentationProbe = await compileStyles();
  assert.deepEqual(
    fingerprint(withDocumentationProbe),
    fingerprint(baseline),
    'a documentation fixture inside the temporary repository must not change production CSS',
  );

  await writeFile(appProbePath, `<div class="${probeClass}"></div>\n`);
  const withApplicationProbe = await compileStyles();
  assert.notDeepEqual(
    fingerprint(withApplicationProbe),
    fingerprint(baseline),
    'an application-template fixture must change the generated CSS',
  );
  assert.match(
    withApplicationProbe,
    /\.bg-fuchsia-950/,
    'the application-template utility must be emitted into production CSS',
  );
} finally {
  await rm(tempProject, { recursive: true, force: true });
}

console.log('Tailwind source boundary contract passed.');
