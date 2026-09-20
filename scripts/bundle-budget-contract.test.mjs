import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const angular = JSON.parse(fs.readFileSync('angular.json', 'utf8'));
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const policy = JSON.parse(fs.readFileSync('performance-budgets.json', 'utf8'));
const budgets = angular.projects.NatiPsy.architect.build.configurations.production.budgets;
const initial = budgets.find(budget => budget.type === 'initial');

assert.equal(initial.maximumWarning, '500kB');
assert.equal(initial.maximumError, '550kB');
assert.equal(policy.initial.warningBytes, 512000);
assert.equal(policy.initial.errorBytes, 563200);
assert.equal(policy.regression.maxIncreasePercent, 10);
assert.equal(packageJson.scripts['report:bundle-size'], 'node ./scripts/report-bundle-size.mjs');
assert.match(fs.readFileSync('scripts/report-bundle-size.mjs', 'utf8'), /BUNDLE_BASELINE_FILE/);
assert.match(fs.readFileSync('scripts/report-bundle-size.mjs', 'utf8'), /stats\.outputs/);

const fixtureRoot = await mkdtemp(join(process.cwd(), 'dist', '.bundle-budget-fixture-'));
try {
  const browser = join(fixtureRoot, 'browser');
  await fs.promises.mkdir(browser, { recursive: true });
  await writeFile(join(browser, 'index.html'), '<script src="main.js"></script>');
  await writeFile(join(browser, 'main.js'), Buffer.alloc(563201));
  await writeFile(join(fixtureRoot, 'stats.json'), JSON.stringify({
    outputs: { 'main.js': { bytes: 563201, imports: [] } },
  }));
  const baselinePath = join(fixtureRoot, 'baseline.json');
  await writeFile(baselinePath, JSON.stringify({ initialBytes: 500000 }));
  assert.throws(() => execFileSync(process.execPath, ['scripts/report-bundle-size.mjs'], {
    env: {
      ...process.env,
      BUNDLE_DIST_ROOT: fixtureRoot,
      BUNDLE_BASELINE_FILE: baselinePath,
    },
    stdio: 'pipe',
  }), 'a fixture over the error budget and regression threshold must fail');

  await writeFile(join(browser, 'lazy.js'), Buffer.alloc(120));
  await writeFile(join(browser, 'main.js'), Buffer.alloc(500000));
  await writeFile(join(fixtureRoot, 'server.mjs'), Buffer.alloc(900));
  await writeFile(join(fixtureRoot, 'polyfills.server.mjs'), Buffer.alloc(800));
  await writeFile(join(fixtureRoot, 'browser-only-baseline.json'), JSON.stringify({ initialBytes: 500000 }));
  await writeFile(join(fixtureRoot, 'browser-only-stats.json'), JSON.stringify({
    outputs: {
      'main.js': { bytes: 500000, imports: [] },
      'lazy.js': { bytes: 120, imports: [] },
      'server.mjs': { bytes: 900, imports: [] },
      'polyfills.server.mjs': { bytes: 800, imports: [] },
    },
  }));
  const reportOutput = execFileSync(process.execPath, ['scripts/report-bundle-size.mjs'], {
    env: {
      ...process.env,
      BUNDLE_DIST_ROOT: fixtureRoot,
      BUNDLE_BASELINE_FILE: join(fixtureRoot, 'browser-only-baseline.json'),
      BUNDLE_STATS_FILE: join(fixtureRoot, 'browser-only-stats.json'),
    },
    encoding: 'utf8',
  });
  const reportStart = reportOutput.indexOf('{');
  const reportEnd = reportOutput.lastIndexOf('}') + 1;
  const report = JSON.parse(reportOutput.slice(reportStart, reportEnd));
  assert.equal(report.lazyBytes, 120);
  assert.deepEqual(report.lazyFiles.map(file => file.asset), ['lazy.js']);
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

console.log('Bundle budget contract passed.');
