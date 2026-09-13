import assert from 'node:assert/strict';
import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const nvmrc = fs.readFileSync('.nvmrc', 'utf8').trim();
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

assert.equal(nvmrc, '22.22.3');
assert.deepEqual(packageJson.engines, { node: '>=22.22.3 <23', npm: '>=10.9.7 <11' });
assert.equal(packageJson.packageManager, 'npm@10.9.7');
for (const name of ['@angular/common', '@angular/core', '@angular/router', '@angular/build', '@angular/cli']) {
  assert.match(dependencies[name], /^22\.1\./, `${name} should stay on the documented Angular 22.1 patch line`);
}
for (const name of ['@tailwindcss/postcss', 'postcss', 'tailwindcss']) {
  assert.ok(packageJson.devDependencies[name], `${name} should be build-only`);
  assert.equal(packageJson.dependencies[name], undefined, `${name} should not be runtime dependency`);
}
for (const name of ['@angular/animations', '@angular/platform-browser-dynamic', 'karma', 'jasmine-core', 'karma-jasmine']) {
  assert.equal(dependencies[name], undefined, `${name} should be removed from the Vitest toolchain`);
}

console.log('Toolchain and dependency-role contract passed.');
