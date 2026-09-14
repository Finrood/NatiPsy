import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compareVersions, isSupportedToolchain } from './check-toolchain.mjs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const toolchainGuard = fs.readFileSync('scripts/check-toolchain.mjs', 'utf8');
const nvmrc = fs.readFileSync('.nvmrc', 'utf8').trim();
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

assert.equal(nvmrc, '22.22.3');
assert.deepEqual(packageJson.engines, { node: '>=22.22.3 <23', npm: '>=10.9.7 <11' });
assert.equal(packageJson.packageManager, 'npm@10.9.7');
assert.equal(packageJson.scripts.preinstall, 'node ./scripts/check-toolchain.mjs');
assert.match(toolchainGuard, /Unsupported toolchain/);
assert.equal(compareVersions([22, 21, 99], [22, 22, 3]) < 0, true);
assert.equal(compareVersions([22, 22, 2], [22, 22, 3]) < 0, true);
assert.equal(compareVersions([22, 22, 3], [22, 22, 3]), 0);
assert.equal(compareVersions([22, 22, 4], [22, 22, 3]) > 0, true);
assert.equal(compareVersions([23, 0, 0], [22, 22, 3]) > 0, true);
assert.equal(isSupportedToolchain('22.21.99', '10.9.7'), false);
assert.equal(isSupportedToolchain('22.22.2', '10.9.99'), false);
assert.equal(isSupportedToolchain('22.22.3', '10.9.7'), true);
assert.equal(isSupportedToolchain('22.22.4', '10.9.8'), true);
assert.equal(isSupportedToolchain('23.0.0', '10.9.7'), false);
assert.equal(isSupportedToolchain('22.22.3', '11.0.0'), false);
assert.match(fs.readFileSync('Dockerfile', 'utf8'), /FROM node:22\.22\.3-alpine AS build/);
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
