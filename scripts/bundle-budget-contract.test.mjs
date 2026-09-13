import assert from 'node:assert/strict';
import fs from 'node:fs';

const angular = JSON.parse(fs.readFileSync('angular.json', 'utf8'));
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const policy = JSON.parse(fs.readFileSync('performance-budgets.json', 'utf8'));
const budgets = angular.projects.NatiPsy.architect.build.configurations.production.budgets;
const initial = budgets.find(budget => budget.type === 'initial');

assert.equal(initial.maximumWarning, '600kB');
assert.equal(initial.maximumError, '800kB');
assert.equal(policy.initial.warningBytes, 614400);
assert.equal(policy.initial.errorBytes, 819200);
assert.equal(policy.regression.maxIncreasePercent, 10);
assert.equal(packageJson.scripts['report:bundle-size'], 'node ./scripts/report-bundle-size.mjs');
assert.match(fs.readFileSync('scripts/report-bundle-size.mjs', 'utf8'), /BUNDLE_BASELINE_FILE/);

console.log('Bundle budget contract passed.');
