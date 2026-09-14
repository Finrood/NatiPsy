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
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

console.log('Bundle budget contract passed.');
