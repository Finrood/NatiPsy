import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync(new URL('../src/app/app.component.ts', import.meta.url), 'utf8');
const template = readFileSync(new URL('../src/app/app.component.html', import.meta.url), 'utf8');

assert.match(component, /NavigationEnd/);
assert.match(component, /document\.querySelector<HTMLElement>\('main h1'\)/);
assert.match(component, /destination\.focus\(\{ preventScroll: true \}\)/);
assert.match(component, /event\.urlAfterRedirects\.includes\('#'\)/);
assert.match(component, /if \(initialNavigation\)/);
assert.match(template, /id="route-announcer"[^>]*aria-live="polite"/);
assert.match(template, /id="main-content"[^>]*tabindex="-1"/);

console.log('Route focus/announcement contract passed.');
